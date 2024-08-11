const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    url: { type: String, required: true },
}, { timestamps: true });

const topicSchema = new mongoose.Schema({
    topic_title: { type: String, required: true },
    topic_length: { type: Number },
    topic_video_url: { type: String },
    topic_documents: [documentSchema]
}, { timestamps: true });

const lessonSchema = new mongoose.Schema({
    lesson_title: { type: String, required: true },
    topics: [topicSchema]
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    category: { type: String, required: true },
    course_title: { type: String, required: true },
    course_price: { type: Number, required: true },
    course_intro_video_url: { type: String },
    course_total_length: { type: String },
    courses_image: [{ type: String }],
    course_short_description: { type: String },
    lessons: [lessonSchema],
    is_course_paid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
