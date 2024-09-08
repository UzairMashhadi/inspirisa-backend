const { PrismaClient } = require('@prisma/client');
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, ERRORS, TEXTS } = require('../../utils/texts');

const prisma = new PrismaClient();

class UserController {

    async userDetails(req, res, next) {
        try {
            const { id } = req.user;

            const user = await prisma.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    UserCourse: true,
                    UserCourseProgress: true,
                    WatchedTopic: true,
                    Reply: true,
                    ContactUs: true,
                    UserCards: true,
                    PaymentHistory: true,
                },
            });

            if (!user) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.userNotFound);
            }

            responseFormatter(res, STATUS_CODE.SUCCESS, { user }, TEXTS.recordFetched);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new UserController();