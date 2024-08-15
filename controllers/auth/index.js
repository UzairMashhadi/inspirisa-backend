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
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userAlreadyExists);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate a verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Create new user
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
            // Create verification link
            const verificationLink = `${process.env.BASEURL}verify-email?token=${user?.verificationToken}`;

            // Send verification email
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
            // Find user by verification token
            const user = await prisma.user.findUnique({ where: { verificationToken: token } });
            if (!user) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.invalidToken);
            }

            // Update user to set isEmailVerified to true and clear the verification token
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
            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userNotExists);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.passwordInvalid);
            }

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            delete user.password;
            delete user.verificationToken;
            responseFormatter(res, STATUS_CODE.SUCCESS, { ...user, token }, TEXTS.userLogin);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();