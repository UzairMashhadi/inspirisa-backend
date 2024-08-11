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

module.exports = { formatCourse, formatAllCourse };