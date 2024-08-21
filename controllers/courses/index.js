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
            const courseId = req?.params?.id;
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    UserCourse: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    fullName: true,
                                }
                            },
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
        } catch (error) {
            next(error);
        }
    }

    async postCourse(req, res, next) {
        try {
            const {
                category,
                course_title,
                course_thumbnail_image,
                course_price,
                course_intro_video_url,
                course_total_length,
                course_images,
                course_short_description,
                lessons,
                is_course_paid,
            } = req.body;

            const course = await prisma.course.create({
                data: {
                    category,
                    course_title,
                    course_thumbnail_image,
                    course_price,
                    course_intro_video_url,
                    course_total_length,
                    course_images,
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
            next(error);
        }
    }

    async updateCourse(req, res, next) {
        try {
            const { id } = req.params;
            const {
                category,
                course_title,
                course_price,
                course_thumbnail_image,
                course_intro_video_url,
                course_total_length,
                course_images,
                course_short_description,
                lessons,
                is_course_paid,
            } = req.body;

            // Update the course
            const course = await prisma.course.update({
                where: { id },
                data: {
                    category,
                    course_title,
                    course_thumbnail_image,
                    course_price,
                    course_intro_video_url,
                    course_total_length,
                    course_images,
                    course_short_description,
                    is_course_paid,
                },
            });

            // Array to store update operations
            const updates = [];

            // Update each lesson
            for (const lesson of lessons) {
                updates.push(
                    prisma.lesson.update({
                        where: { id: lesson.id },
                        data: {
                            lesson_title: lesson.lesson_title,
                        },
                    })
                );

                for (const topic of lesson.topics) {
                    updates.push(
                        prisma.topic.update({
                            where: { id: topic.id },
                            data: {
                                topic_title: topic.topic_title,
                                topic_length: topic.topic_length,
                                topic_video_url: topic.topic_video_url,
                            },
                        })
                    );

                    for (const document of topic.topic_documents) {
                        if (document.id) {
                            updates.push(
                                prisma.document.update({
                                    where: { id: document.id },
                                    data: {
                                        url: document.url,
                                    },
                                })
                            );
                        } else {
                            responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, TEXTS.someThingWentWrong);
                        }
                    }
                }
            }

            // Execute all updates in a transaction
            await prisma.$transaction(updates);

            responseFormatter(res, STATUS_CODE.SUCCESS, { course }, TEXTS.recordUpdated);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req, res, next) {
        try {
            const { id } = req?.params;

            const course = await prisma.course.findUnique({
                where: { id },
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
                    UserCourse: true,
                },
            });

            if (!course) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.recordNotFound);
            }

            const topicDocumentIds = course.lessons.flatMap(lesson =>
                lesson.topics.flatMap(topic =>
                    topic.topic_documents.map(doc => doc.id)
                )
            );

            const topicIds = course.lessons.flatMap(lesson =>
                lesson.topics.map(topic => topic.id)
            );

            const lessonIds = course.lessons.map(lesson => lesson.id);

            await prisma.$transaction(async (prisma) => {
                await prisma.document.deleteMany({
                    where: {
                        id: { in: topicDocumentIds },
                    },
                });

                await prisma.topic.deleteMany({
                    where: {
                        id: { in: topicIds },
                    },
                });

                await prisma.lesson.deleteMany({
                    where: {
                        id: { in: lessonIds },
                    },
                });

                await prisma.userCourse.deleteMany({
                    where: { courseId: id },
                });

                await prisma.course.delete({
                    where: { id },
                });
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.recordDeleted);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new CoursesController();