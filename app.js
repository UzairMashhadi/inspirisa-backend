const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const eventsRoutes = require('./routes/events');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const publicRoutes = require('./routes');
const uploadRoutes = require('./routes/upload');
const stripeRoutes = require('./routes/stripe');
const authMiddleware = require('./middleware/auth/authMiddleware');
const CustomError = require("./utils/CustomError");
const globalErrorHandler = require("./controllers/error/errorController");

const app = express();
var bodyParser = require('body-parser');
const isAdmin = require('./middleware/isAdmin');
const auth = require('./middleware/auth/auth');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Auth routes
app.use('/api', authRoutes);

app.use("/api/media", auth, isAdmin, uploadRoutes);

// Stripe routes
app.use('/api/stripe', auth, authMiddleware, stripeRoutes);

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

// Error handler (last middleware)
app.use(globalErrorHandler);

module.exports = app;