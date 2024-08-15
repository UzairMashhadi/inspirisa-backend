const { PrismaClient } = require('@prisma/client');
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, TEXTS } = require('../../utils/texts');

const prisma = new PrismaClient();

class EventsController {
    async getAllEvents(req, res, next) {
        try {
            const events = await prisma.event.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    tags: true,
                    event_start_date: true,
                    start_time: true,
                    event_end_date: true,
                    end_time: true,
                    image_url: true,
                    video_url: true,
                    images_url_array: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            responseFormatter(res, STATUS_CODE.SUCCESS, { events }, TEXTS.recordFetched);
        } catch (err) {
            next(err);
        }
    }

    async getSingleEventById(req, res, next) {
        try {
            const id = req.params.id;
            if (!id) {
                return responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, TEXTS.someThingWentWrong);
            }
            const event = await prisma.event.findFirst({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    tags: true,
                    event_start_date: true,
                    start_time: true,
                    event_end_date: true,
                    end_time: true,
                    image_url: true,
                    video_url: true,
                    images_url_array: true,
                    organizer: true,
                    replies: {
                        select: {
                            id: true,
                            comment: true,
                            website_url: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                }
                            }
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!event) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.recordNotFound);
            }

            responseFormatter(res, STATUS_CODE.SUCCESS, { event }, TEXTS.recordFetched);
        } catch (err) {
            next(err);
        }
    }

    async postEvent(req, res, next) {
        const {
            image_url,
            video_url,
            title,
            description,
            tags,
            event_start_date,
            start_time,
            event_end_date,
            end_time,
            images_url_array,
            website_url,
        } = req.body;

        try {
            const { email, fullName, } = req.user;
            const organizer = await prisma.organizer.create({
                data: {
                    email,
                    name: fullName,
                    website_url: website_url || '',
                }
            });

            if (!organizer) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.organizerNotFound);
            }

            const event = await prisma.event.create({
                data: {
                    image_url,
                    video_url,
                    title,
                    description,
                    tags,
                    event_start_date,
                    start_time,
                    event_end_date,
                    end_time,
                    images_url_array: images_url_array || [],
                    organizer: { connect: { id: organizer.id }, }
                },
            });

            responseFormatter(res, STATUS_CODE.CREATED, { event }, TEXTS.recordCreated);
        } catch (err) {
            responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, err.message);
        }
    }

    async commentOnEvent(req, res, next) {
        try {
            const { comment, website_url } = req.body;
            const userId = req.user.id;
            const eventId = req.params.id;

            const event = await prisma.event.findUnique({
                where: { id: eventId },
            });

            if (!event) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.recordNotFound);
            }

            await prisma.reply.create({
                data: {
                    comment,
                    website_url,
                    user: { connect: { id: userId } },
                    event: { connect: { id: eventId } }
                }
            });

            const updatedEvent = await prisma.event.findUnique({
                where: { id: eventId },
                select: {
                    id: true,
                    title: true,
                    replies: {
                        select: {
                            id: true,
                            comment: true,
                            website_url: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                }
                            }
                        }
                    }
                }
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, { event: updatedEvent }, TEXTS.recordCreated);
        } catch (err) {
            responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, err.message);
        }
    }
}

module.exports = new EventsController();