const express = require('express');
const CoursesController = require('../../controllers/courses');
const isAdmin = require('../../middleware/isAdmin');
const auth = require('../../middleware/auth/auth');
const router = express.Router();

// Post a new course
router.post('/course', auth, isAdmin, CoursesController.postCourse);

// Update a course
router.patch('/course/:id', auth, isAdmin, CoursesController.updateCourse);

// Delete a course
router.delete('/course/:id', auth, isAdmin, CoursesController.deleteCourse);

// Update user course watch time to get progress
router.post('/update-watched-time', auth, CoursesController.updateCourseProgress);

module.exports = router;
