// Helper function to format course data
const formatCourse = (course) => ({
    id: course.id,
    category: course.category,
    course_title: course.course_title,
    course_price: course.course_price,
    course_intro_video_url: course.course_intro_video_url,
    course_total_length: course.course_total_length,
    courses_image: course.courses_image,
    course_short_description: course.course_short_description,
    lessons: course.lessons,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
});

module.exports = { formatCourse };
