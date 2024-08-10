const express = require('express');
const Blog = require('../models/blog');
const router = express.Router();

// Get all blogs
router.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({}, 'image_url video_url title description id createdAt updatedAt');
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get blog details
router.get('/blog/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a reply to a blog (requires login)
router.post('/blog/:id/replies', async (req, res) => {
    const { userId, comment } = req.body; // Ensure `userId` is provided in the request body
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        blog.replies.push({ user: userId, comment });
        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new blog
router.post('/blog', async (req, res) => {
    const { image_url, video_url, title, description, tags, event_start, event_end, images_url, organizer } = req.body;
    try {
        const newBlog = new Blog({
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

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
