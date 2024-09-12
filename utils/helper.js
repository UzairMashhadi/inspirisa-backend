const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


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
    let foramttedRes = {
        status,
        message
    }
    if (data && (Array.isArray(data) ? data?.length : Object.keys(data).length)) {
        foramttedRes.data = data;
    }
    return res.status(status).json(foramttedRes);
};

const calculateAverageRating = async (events = []) => {
    const eventsWithAverageRating = await Promise.all(events.map(async event => {

        const eventRatings = await prisma.eventRating.findMany({
            where: { eventId: event.id },
            select: { rating: true }
        });

        const ratings = eventRatings.map(eventRating => eventRating.rating);
        const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
        const roundedRating = averageRating !== null ? parseFloat(averageRating) : null;

        return {
            ...event,
            rating: roundedRating,
        };
    }));

    return eventsWithAverageRating;
}

const calculateAverageByEventRatings = (eventRatings = []) => {
    const ratings = eventRatings.map(eventRating => eventRating.rating);
    const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
    return parseFloat(averageRating.toFixed(1));
}

const generateEmailHtml = (bodyContent) => {
    return `
        <html>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9;">
                    <tr>
                        <td>
                            <!-- Header -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-bottom: 1px solid #dddddd;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <img src="https://inspirisa-media-2024.s3.eu-north-1.amazonaws.com/logo_file_1726178754612.png" alt="Inspirisa Logo" style="max-width: 150px;">
                                    </td>
                                </tr>
                            </table>
                            <!-- Body -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px;">
                                <tr>
                                    <td>
                                        ${bodyContent}
                                    </td>
                                </tr>
                            </table>
                            <!-- Footer -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eeeeee; border-top: 1px solid #dddddd; padding: 20px; text-align: center;">
                                <tr>
                                    <td>
                                        <p style="font-size: 14px; color: #777777; margin: 10;">
                                            &copy; ${new Date().getFullYear()} Inspirisa. All rights reserved.
                                        </p>
                                        <p style="font-size: 14px; color: #777777; margin: 0;">
                                            123 Company Address, City, Country
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;
}


module.exports = { formatCourse, formatAllCourse, responseFormatter, calculateAverageRating, calculateAverageByEventRatings, generateEmailHtml };