const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUrl = process.env.DATABASE_URL;
        if (mongoUrl) {

            await mongoose.connect(`${mongoUrl}`, {
                // Removed deprecated options
            });
            console.log('MongoDB connected');
        }
    } catch (err) {
        console.error("ERROR-->", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
