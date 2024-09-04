const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { responseFormatter } = require('../../utils/helper');
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
                html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`
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
                    token: true,
                    isEmailVerified: true,
                    role: true,
                    Reply: true,
                    UserCourse: true,
                    ContactUs: true,
                    // UserCards: true,
                    PaymentHistory: true,
                    UserCourseProgress: true,
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

            const resetLink = `${process.env.BASEURL}reset-password?token=${resetToken}`;
            const mailOptions = {
                to: email,
                subject: 'Password Reset',
                html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire 5 minutes.</p>`,
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

}

module.exports = new AuthController();