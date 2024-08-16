const http = require("http");
const app = require("./app");
const connectDB = require('./config/db');

const server = http.Server(app);

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

const unexpectedErrorHandler = (error) => {
    console.log(error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    if (server) {
        server.close();
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
