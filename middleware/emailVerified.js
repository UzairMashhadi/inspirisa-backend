const { responseFormatter } = require('../utils/helper');
const { STATUS_CODE, TEXTS } = require('../utils/texts');
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
            return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, TEXTS.emailNotVerified);
        }

        next();
    } catch (error) {
        console.error('Error in isEmailVerified middleware:', error);
        responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, TEXTS.internalServerError);
    }
};

module.exports = isEmailVerified;
