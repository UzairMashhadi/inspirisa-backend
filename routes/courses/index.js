const express = require('express');
const CoursesController = require('../../controllers/courses');
const isAdmin = require('../../middleware/isAdmin');
const router = express.Router();

// Get all courses
router.get('/courses', CoursesController.getAllCourses);

// Get a single course by ID
router.get('/course/:id', CoursesController.getSingleCourseById);

// Post a new course
router.post('/course', isAdmin, CoursesController.postCourse);

module.exports = router;
