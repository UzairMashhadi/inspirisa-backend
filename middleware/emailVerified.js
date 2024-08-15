const { responseFormatter } = require('../utils/helper');
const { STATUS_CODE, TEXTS } = require('../utils/texts');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isEmailVerified = async (req, res, next) => {
    const email = req?.body?.email;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, TEXTS.userNotFound);
    }
    if (!user.isEmailVerified) {
        return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, TEXTS.emailNotVerified);
    }
    next();
};

module.exports = isEmailVerified;
