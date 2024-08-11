const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const eventsRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Use CORS middleware
app.use(cors());

app.use(express.json());

// User routes
app.use('/api', userRoutes);

app.use('/api', eventsRoutes);

// Courses routes
app.use('/api', courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
