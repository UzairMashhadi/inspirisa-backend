const express = require('express');
const auth = require('../../middleware/auth/auth');
const isAdmin = require('../../middleware/isAdmin');
const EventsController = require("../../controllers/events");

const router = express.Router();

// Get all events
router.get('/events', EventsController.getAllEvents);

// Get event details
router.get('/event/:id', EventsController.getSingleEventById);

// Create a new event
router.post('/event', isAdmin, EventsController.postEvent);

// Add a reply to an event
router.post('/event-comment/:id', auth, EventsController.commentOnEvent);

module.exports = router;
