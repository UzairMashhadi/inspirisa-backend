const express = require('express');
const auth = require('../../middleware/auth/auth');
const isAdmin = require('../../middleware/isAdmin');
const EventsController = require("../../controllers/events");

const router = express.Router();

router.post('/event', auth, isAdmin, EventsController.postEvent);

router.patch('/event/:id', auth, isAdmin, EventsController.updateEvent);

router.delete('/event/:id', auth, isAdmin, EventsController.deleteEvent);

router.post('/event-comment/:id', auth, EventsController.commentOnEvent);

router.post('/event-rating', auth, EventsController.rateEvent);

module.exports = router;
