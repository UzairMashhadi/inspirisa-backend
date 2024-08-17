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

// Update a course
router.patch('/course/:id', isAdmin, CoursesController.updateCourse);

// Delete a course
router.delete('/course/:id', isAdmin, CoursesController.deleteCourse);

module.exports = router;
