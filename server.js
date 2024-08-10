const express = require('express');
const cors = require('cors'); // Import the cors package
const connectDB = require('./config/db');
const eventsRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Use CORS middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'X-Auth-Token'
    ]
}));

app.use(express.json());

// User routes
app.use('/api', userRoutes);

// Events routes
app.use('/api', eventsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
