const express = require('express');
const Course = require('../../models/course');
const { formatCourse } = require('../../utils/helper');
const router = express.Router();

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses.map(formatCourse));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single course by ID
router.get('/course/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(formatCourse(course));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a new course
router.post('/course', async (req, res) => {
    const { category, course_title, course_price, course_intro_video_url, course_total_length, courses_image, course_short_description, lessons } = req.body;

    try {
        const course = new Course({
            category,
            course_title,
            course_price,
            course_intro_video_url,
            course_total_length,
            courses_image,
            course_short_description,
            lessons
        });

        await course.save();
        res.status(201).json(formatCourse(course));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
