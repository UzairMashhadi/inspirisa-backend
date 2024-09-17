const { PrismaClient } = require('@prisma/client');
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, TEXTS, ERRORS } = require('../../utils/texts');

const prisma = new PrismaClient();

const defaultLanguage = 'ENGLISH';

class CoursesController {
    async getAllCourses(req, res, next) {
        try {
            const courses = await prisma.course.findMany({
                include: {
                    lessons: {
                        include: {
                            topics: true,
                        },
                    },
                },
            });

            const coursesWithVideoCount = courses.map(course => {
                const totalVideos = course.lessons.reduce((count, lesson) => {
                    return count + lesson.topics.length;
                }, 0);

                return {
                    ...course,
                    totalVideos,
                };
            });

            responseFormatter(res, STATUS_CODE.SUCCESS, { courses: coursesWithVideoCount }, TEXTS.recordFetched);
        } catch (error) {
            next(error);
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
                benefitsAndAdvantages,
                courseIncludes,
                languages,
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
                    benefitsAndAdvantages,
                    courseIncludes,
                    languages: languages?.length > 0 ? languages : [defaultLanguage],
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
                benefitsAndAdvantages,
                courseIncludes,
                languages,
                course_short_description,
                lessons,
                is_course_paid,
            } = req.body;

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

            const hasLessons = course.lessons.length > 0;

            if (hasLessons) {
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
                    // Delete existing data
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

                    // Also delete the user-course relationships if needed
                    await prisma.userCourse.deleteMany({
                        where: { courseId: id },
                    });
                });
            }

            // Update the course details
            await prisma.course.update({
                where: { id },
                data: {
                    category,
                    course_title,
                    course_thumbnail_image,
                    course_price,
                    course_intro_video_url,
                    course_total_length,
                    course_images,
                    benefitsAndAdvantages,
                    courseIncludes,
                    languages: languages?.length > 0 ? languages : [defaultLanguage],
                    course_short_description,
                    is_course_paid,
                },
            });

            // Create new lessons with their topics and documents
            for (const lesson of lessons) {
                // Create the lesson
                const newLesson = await prisma.lesson.create({
                    data: {
                        lesson_title: lesson.lesson_title,
                        courseId: id,
                    },
                });

                // Create topics and documents for the new lesson
                for (const topic of lesson.topics) {
                    const newTopic = await prisma.topic.create({
                        data: {
                            topic_title: topic.topic_title,
                            topic_length: topic.topic_length,
                            topic_video_url: topic.topic_video_url,
                            lessonId: newLesson.id,
                        },
                    });

                    for (const document of topic.topic_documents) {
                        await prisma.document.create({
                            data: {
                                url: document.url,
                                topicId: newTopic.id,
                            },
                        });
                    }
                }
            }

            responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.recordUpdated);
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
                    UserCourseProgress: true,
                    WatchedTopic: true,
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
                await prisma.watchedTopic.deleteMany({
                    where: {
                        courseId: id,
                    },
                });

                await prisma.userCourseProgress.deleteMany({
                    where: {
                        courseId: id,
                    },
                });

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

    async updateCourseProgress(req, res, next) {
        try {
            const { courseId, lessonId, topicId, watchedTimeInSeconds } = req.body;
            const userId = req.user.id;

            //     // Check if the user has access to the course
            //     const userCourse = await prisma.userCourse.findFirst({
            //         where: {
            //             userId,
            //             courseId,
            //         },
            //     });

            //     if (!userCourse) {
            //         return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.unAuthorized);
            //     }

            // Check if the course exists
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { course_total_length: true },
            });

            if (!course) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.recordNotFound);
            }

            // Check if the topic exists
            const topic = await prisma.topic.findUnique({
                where: { id: topicId },
                select: { topic_length: true }, // Select the topic length for validation
            });

            if (!topic) {
                return responseFormatter(res, STATUS_CODE.NOT_FOUND, {}, TEXTS.recordNotFound);
            }

            const totalLengthInSeconds = parseFloat(course.course_total_length) || 0;
            const topicLengthInSeconds = parseFloat(topic.topic_length) || 0;

            // Check if the watched time for this topic has already been recorded
            const existingWatchedTopic = await prisma.watchedTopic.findUnique({
                where: {
                    userId_courseId_lessonId_topicId: {
                        userId,
                        courseId,
                        lessonId,
                        topicId
                    }
                }
            });

            let remainingWatchTime = watchedTimeInSeconds;

            if (existingWatchedTopic) {
                // If watched time for the topic is already recorded, check if the new time exceeds the topic length
                const totalWatchedTimeForTopic = existingWatchedTopic.watchedTime + watchedTimeInSeconds;

                if (totalWatchedTimeForTopic >= topicLengthInSeconds) {
                    remainingWatchTime = topicLengthInSeconds - existingWatchedTopic.watchedTime; // Add only the remaining time
                }

                if (remainingWatchTime <= 0) {
                    return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, ERRORS.alreadyWatchedTheEntireTopic);
                }
            }

            const progressPercentage = (remainingWatchTime / totalLengthInSeconds) * 100;

            const existingProgress = await prisma.userCourseProgress.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    },
                },
            });

            if (existingProgress) {
                const newWatchedTimeInSeconds = existingProgress.watchedTime + remainingWatchTime;
                const newProgressPercentage = (newWatchedTimeInSeconds / totalLengthInSeconds) * 100;

                const updatedProgress = await prisma.userCourseProgress.update({
                    where: {
                        userId_courseId: {
                            userId,
                            courseId,
                        },
                    },
                    data: {
                        watchedTime: newWatchedTimeInSeconds,
                        progressPercentage: newProgressPercentage,
                    },
                });

                // Update the WatchedTopic entry or create if none exists
                if (existingWatchedTopic) {
                    await prisma.watchedTopic.update({
                        where: {
                            userId_courseId_lessonId_topicId: {
                                userId,
                                courseId,
                                lessonId,
                                topicId,
                            },
                        },
                        data: {
                            watchedTime: existingWatchedTopic.watchedTime + remainingWatchTime,
                        },
                    });
                } else {
                    await prisma.watchedTopic.create({
                        data: {
                            userId,
                            courseId,
                            lessonId,
                            topicId,
                            watchedTime: remainingWatchTime,
                        }
                    });
                }

                return responseFormatter(res, STATUS_CODE.SUCCESS, { progress: updatedProgress }, TEXTS.recordUpdated);
            } else {
                const newProgress = await prisma.userCourseProgress.create({
                    data: {
                        userId,
                        courseId,
                        watchedTime: remainingWatchTime,
                        progressPercentage,
                    },
                });

                // Create a new WatchedTopic entry
                await prisma.watchedTopic.create({
                    data: {
                        userId,
                        courseId,
                        lessonId,
                        topicId,
                        watchedTime: remainingWatchTime,
                    }
                });

                return responseFormatter(res, STATUS_CODE.CREATED, { progress: newProgress }, TEXTS.recordCreated);
            }
        } catch (error) {
            next(error);
        }
    }

}
module.exports = new CoursesController();