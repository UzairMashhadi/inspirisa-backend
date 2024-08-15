const { PrismaClient } = require('@prisma/client');
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, TEXTS } = require('../../utils/texts');

const prisma = new PrismaClient();

class CoursesController {
    async getAllCourses(req, res, next) {
        try {
            const courses = await prisma.course.findMany();
            responseFormatter(res, STATUS_CODE.SUCCESS, { courses }, TEXTS.recordFetched);
        } catch (err) {
            responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, TEXTS.someThingWentWrong);
        }
    }

    async getSingleCourseById(req, res, next) {
        try {
            const course = await prisma.course.findUnique({
                where: { id: req?.params?.id },
                include: {
                    UserCourse: {
                        include: {
                            user: true,
                        }
                    },
                    lessons: {
                        include: {
                            topics: {
                                include: {
                                    topic_documents: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!course) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.recordNotFound);
            }

            responseFormatter(res, STATUS_CODE.SUCCESS, { course }, TEXTS.recordFetched);
        } catch (err) {
            responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, TEXTS.someThingWentWrong);
        }
    }

    async postCourse(req, res, next) {
        try {
            const {
                category,
                course_title,
                course_price,
                course_intro_video_url,
                course_total_length,
                courses_image,
                course_short_description,
                lessons,
                is_course_paid,
            } = req.body;

            const course = await prisma.course.create({
                data: {
                    category,
                    course_title,
                    course_price,
                    course_intro_video_url,
                    course_total_length,
                    courses_image,
                    course_short_description,
                    is_course_paid,
                    lessons: {
                        create: lessons.map((lesson) => ({
                            lesson_title: lesson.lesson_title,
                            topics: {
                                create: lesson.topics.map((topic) => ({
                                    topic_title: topic.topic_title,
                                    topic_length: topic.topic_length,
                                    topic_video_url: topic.topic_video_url,
                                    topic_documents: {
                                        create: topic.topic_documents.map((doc) => ({
                                            url: doc.url,
                                        })),
                                    },
                                })),
                            },
                        })),
                    },
                },
                include: {
                    lessons: {
                        include: {
                            topics: {
                                include: {
                                    topic_documents: true,
                                },
                            },
                        },
                    },
                },
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, { course }, TEXTS.recordFetched);
        } catch (error) {
            console.error(error);
            responseFormatter(res, STATUS_CODE.INTERNAL_SERVER_ERROR, {}, TEXTS.someThingWentWrong);
        }
    }
}

module.exports = new CoursesController();