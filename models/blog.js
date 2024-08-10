const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
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

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
