const express = require('express');
const auth = require('../../middleware/auth/auth');
const isAdmin = require('../../middleware/isAdmin');
const EventsController = require("../../controllers/events");

const router = express.Router();

// Create a new event
router.post('/event', auth, isAdmin, EventsController.postEvent);

// Update a event
router.patch('/event/:id', auth, isAdmin, EventsController.updateEvent);

// Delete a event
router.delete('/event/:id', auth, isAdmin, EventsController.deleteEvent);

// Add a reply to an event
router.post('/event-comment/:id', auth, EventsController.commentOnEvent);

module.exports = router;
