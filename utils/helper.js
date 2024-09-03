const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Helper function to format course data
const formatCourse = (course) => ({
    _id: course.id,
    category: course.category,
    course_title: course.course_title,
    course_price: course.course_price,
    course_intro_video_url: course.course_intro_video_url,
    course_total_length: course.course_total_length,
    courses_image: course.courses_image,
    course_short_description: course.course_short_description,
    lessons: course.lessons,
    is_course_paid: course.is_course_paid,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
});


const formatAllCourse = (course) => ({
    _id: course._id,
    category: course.category,
    course_title: course.course_title,
    course_price: course.course_price,
    course_intro_video_url: course.course_intro_video_url,
    course_total_length: course.course_total_length,
    courses_image: course.courses_image,
    course_short_description: course.course_short_description,
    is_course_paid: course.is_course_paid
});

const responseFormatter = (res, status, data = {}, message) => {
    return res.status(status).json({
        status,
        data: data,
        message
    });
};

const calculateAverageRating = async (events = []) => {
    const eventsWithAverageRating = await Promise.all(events.map(async event => {
        const replies = await prisma.reply.findMany({
            where: { eventId: event.id },
            select: { rating: true }
        });

        const ratings = replies.map(reply => reply.rating);
        const rating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
        let r = parseFloat(rating.toFixed(1))
        return {
            rating: r,
            ...event,
        };
    }));

    return eventsWithAverageRating;
}

const calculateAverageByReplies = (replies = []) => {
    const ratings = replies.map(reply => reply.rating);
    const rating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
    return parseFloat(rating.toFixed(1));
};

module.exports = { formatCourse, formatAllCourse, responseFormatter, calculateAverageRating, calculateAverageByReplies };