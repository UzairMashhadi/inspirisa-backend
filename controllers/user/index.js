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
                    profileImage: true,
                    aboutMe: true,
                    phoneNumber: true,
                    twitter: true,
                    facebook: true,
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

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            if (id !== userId) {
                return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, { user }, TEXTS.userNotFound);
            }

            const user = await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    isDeleted: true,
                    token: null
                },
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.accountDeleted);
        } catch (error) {
            next(error);
        }
    }

    async restoreUser(req, res, next) {
        try {
            const { id } = req.params;

            const user = await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    isDeleted: false,
                },
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, { user }, TEXTS.userRestoredBack);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new UserController();