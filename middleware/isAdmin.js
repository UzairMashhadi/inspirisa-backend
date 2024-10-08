const { responseFormatter } = require('../utils/helper');
const { STATUS_CODE, TEXTS, ERRORS } = require('../utils/texts');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
    try {
        const email = req?.user?.email;
        if (!email) {
            return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.unAuthorized);
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, TEXTS.userNotFound);
        }

        if (user.role === "CLIENT") {
            return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.unAuthorized);
        }

        next();
    } catch (error) {
        console.error('Error in isAdmin middleware:', error);
        next(error);
    }
};

module.exports = isAdmin;
