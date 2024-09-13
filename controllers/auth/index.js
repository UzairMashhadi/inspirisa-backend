const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { responseFormatter, generateEmailHtml } = require('../../utils/helper');
const { STATUS_CODE, ERRORS, TEXTS } = require('../../utils/texts');
const { sendEmail } = require('../../services/emailService');

const prisma = new PrismaClient();

class AuthController {

    async registerUser(req, res, next) {
        try {
            const { fullName, email, password, role } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userAlreadyExists);
            }
            const minLength = 6;
            const maxLength = 20;

            if (password.length < minLength || password.length > maxLength) {
                return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, `Password must be between ${minLength} and ${maxLength} characters long.`);
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const verificationToken = crypto.randomBytes(32).toString('hex');

            const user = await prisma.user.create({
                data: {
                    fullName,
                    email,
                    password: hashedPassword,
                    role,
                    verificationToken
                }
            });
            let addedUser = { ...user };
            delete addedUser.password;
            delete addedUser.verificationToken;

            const verificationLink = `${process.env.BASEURL}verify-email?token=${user?.verificationToken}`;

            const mailOptions = {
                to: email,
                subject: 'Email Verification',
                html: generateEmailHtml(`<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`)
            };

            await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

            responseFormatter(res, STATUS_CODE.CREATED, { user: addedUser }, TEXTS.userCreated);
        } catch (err) {
            next(err);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const token = req?.query?.token;

            const user = await prisma.user.findUnique({ where: { verificationToken: token } });
            if (!user) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.invalidToken);
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isEmailVerified: true,
                    verificationToken: null
                }
            });

            res.send('Email verified successfully!');
        } catch (err) {
            next(err);
        }
    }

    async loginUser(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });

            if (user.isDeleted) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.userNotFound);
            }

            if (!user) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userNotExists);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.passwordInvalid);
            }

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            const updatedUser = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    token,
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                    aboutMe: true,
                    phoneNumber: true,
                    facebook: true,
                    twitter: true,
                    token: true,
                    isEmailVerified: true,
                    role: true,
                    verificationToken: true,
                    resetPasswordToken: true,
                    resetPasswordExpires: true,
                    updatedAt: true,
                    createdAt: true,
                },
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, { user: updatedUser }, TEXTS.userLogin);
        } catch (err) {
            next(err);
        }
    }

    async logoutUser(req, res, next) {
        try {
            let token = req.headers.authorization || req.cookies.token;

            if (!token) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.tokenInvalid);
            }
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }
            const user = await prisma.user.findUnique({
                where: {
                    token,
                },
            });

            if (!user) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.userNotExists);
            }

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    token: null,
                },
            });
            res.clearCookie('token');

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.userLogout);
        } catch (err) {
            next(err);
        }
    }

    async initiatePasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userNotExists);
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // Token valid for 5 minutes

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: resetTokenExpiry,
                },
            });

            const resetLink = `${process.env.FE_BASE_URL}reset-password?token=${resetToken}`;
            const mailOptions = {
                to: email,
                subject: 'Password Reset',
                html: generateEmailHtml(`<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire 5 minutes.</p>`),
            };

            await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.resetPasswordEmailSent);
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;

            const minLength = 6;
            const maxLength = 20;

            if (newPassword.length < minLength || newPassword.length > maxLength) {
                return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, `Password must be between ${minLength} and ${maxLength} characters long.`);
            }

            const user = await prisma.user.findFirst({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        gte: new Date(),
                    },
                },
            });

            if (!user) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.invalidTokenOrExpired);
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.passwordCannotBeSame);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.passwordChanged);
        } catch (err) {
            next(err);
        }
    }

    async checkToken(req, res, next) {
        try {
            let token = req.headers.authorization || req.cookies.token;

            if (!token) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.tokenInvalid);
            }

            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.invalidTokenOrExpired);
                }

                const currentTime = Date.now();
                const expiresAt = decoded.exp * 1000;
                const remainingTime = expiresAt - currentTime;

                let validTime;
                let isValid = false;

                if (remainingTime > 0) {
                    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
                    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

                    validTime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
                    isValid = true;
                } else {
                    validTime = 'Token has expired';
                    isValid = false;
                }

                return responseFormatter(res, STATUS_CODE.SUCCESS, {
                    token: {
                        isValid,
                        validTime,
                        message: isValid ? ERRORS.tokenIsValid : ERRORS.tokenExpired,
                        userId: decoded.id,
                    }
                });


            });
        } catch (err) {
            next(err);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { id } = req.user;
            const { newPassword } = req.body;

            if (!newPassword) {
                return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, TEXTS.requiredFieldsMissing);
            }

            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.userNotFound);
            }

            const isOldPassword = await bcrypt.compare(newPassword, user.password);
            if (isOldPassword) {
                return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, TEXTS.passwordSameAsOld);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id },
                data: { password: hashedPassword },
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.passwordChangedSuccessfully);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        const userId = req.user.id;
        const {
            fullName,
            profileImage,
            aboutMe,
            phoneNumber,
            facebook,
            twitter
        } = req.body;

        try {

            let updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    fullName,
                    profileImage,
                    aboutMe,
                    phoneNumber,
                    facebook,
                    twitter,
                },
            });

            delete updatedUser.password;

            responseFormatter(res, STATUS_CODE.SUCCESS, { user: updatedUser }, TEXTS.recordUpdated);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new AuthController();