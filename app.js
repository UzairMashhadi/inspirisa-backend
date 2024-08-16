const express = require('express');
const cors = require('cors');
const eventsRoutes = require('./routes/events');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const publicRoutes = require('./routes');
const authMiddleware = require('./middleware/auth/authMiddleware');
const CustomError = require("./utils/CustomError");
const globalErrorHandler = require("./controllers/error/errorController");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/api', authRoutes);

// User routes
app.use('/api', authMiddleware, usersRoutes);

// Events routes
app.use('/api', authMiddleware, eventsRoutes);

// Courses routes
app.use('/api', authMiddleware, coursesRoutes);

// Public
app.use('/api', publicRoutes);

app.get("/api/test", (req, res) => {
    res.status(200).json({ message: "Server is working fine!" });
});

app.all("*", (req, res, next) => {
    const err = new CustomError(
        `Can't find ${req.originalUrl} on the server!`,
        404
    );
    next(err);
});

app.use(globalErrorHandler);
// Error handler (last middleware)

module.exports = app;