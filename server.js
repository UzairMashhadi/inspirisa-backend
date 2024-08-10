const express = require('express');
const connectDB = require('./config/db');
const blogRoutes = require('./routes/blogs');
const userRoutes = require('./routes/users');
const auth = require('./middleware/auth');

require('dotenv').config();

const app = express();
//db connect
connectDB();

app.use(express.json());

app.use('/api', userRoutes); // User routes
app.use('/api', blogRoutes); // Blog routes

// Apply authentication middleware to routes that require login
app.post('/api/blogs/:id/replies', auth, (req, res) => {
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
