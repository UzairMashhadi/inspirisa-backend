const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');
const eventsRoutes = require('./routes/events');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const publicRoutes = require('./routes');
const authMiddleware = require('./middleware/auth/authMiddleware');

require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Use CORS middleware
app.use(cors());

app.use(express.json());

app.use(errorHandler);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
