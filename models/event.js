const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    image_url: String,
    video_url: String,
    title: String,
    description: String,
    tags: [String],
    event_start: {
        start_date: Date,
        start_time: String,
    },
    event_end: {
        end_date: Date,
        end_time: String,
    },
    images_url_array: [String],
    organizer: {
        name: String,
        email: String,
        website_url: String,
    },
    replies: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        createdAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
