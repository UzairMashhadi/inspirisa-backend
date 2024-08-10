const express = require('express');
const Event = require('../../models/event');
const router = express.Router();
const auth = require('../../middleware/auth/auth');

// Get all events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find({}, 'image_url video_url title description id createdAt updatedAt');
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get event details
router.get('/event/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new event
router.post('/event', async (req, res) => {
    const { image_url, video_url, title, description, tags, event_start, event_end, images_url, organizer } = req.body;
    try {
        const newEvent = new Event({
            image_url,
            video_url,
            title,
            description,
            tags,
            event_start,
            event_end,
            images_url,
            organizer
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Apply authentication middleware to routes that require login
router.post('/events/:id/replies', auth, async (req, res) => {
    try {
        const { userId, comment } = req.body;
        // Assuming `Event` is the model for events and it has a `replies` array
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Add reply to the event
        event.replies.push({ user: userId, comment });
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
