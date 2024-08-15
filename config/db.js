const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            // Removed deprecated options
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error("ERROR-->", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
