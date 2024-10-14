const crypto = require('crypto');
const { responseFormatter, generateEmailHtml } = require('../utils/helper');
const { STATUS_CODE, TEXTS } = require('../utils/texts');
const { sendEmail } = require('../services/emailService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isEmailVerified = async (req, res, next) => {
    try {
        const email = req?.body?.email;
        if (!email) {
            return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, TEXTS.emailRequired);
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, TEXTS.userNotFound);
        }
        if (!user.isEmailVerified) {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken }
            });

            const verificationLink = `${process.env.BASEURL}verify-email?token=${verificationToken}`;
            const mailOptions = {
                to: email,
                subject: 'Email Verification',
                html: generateEmailHtml(`<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`)
            };

            await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

            return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, TEXTS.verificationEmailSentAgain);
        }

        next();
    } catch (error) {
        console.error('Error in isEmailVerified middleware:', error);
        responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, TEXTS.internalServerError);
    }
};

module.exports = isEmailVerified;
