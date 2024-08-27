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

const exitHandler = () => {
    console.log("Exiting gracefully...");

    if (server) {
        server.close((err) => {
            if (err) {
                console.error("Error while closing the server:", err);
                process.exit(1);
            }
            console.log("Server closed gracefully.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
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