const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
dotenv.config();

/**
 * Middleware
 */
app.use(cors());
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET
    })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

/**
 * Routes
 */
const apiBaseRoute = require("./api");
app.use("/api", apiBaseRoute);

/**
 * Error handlers
 */
app.use(function(req, res, next) {
    //Forward 404 request to handlers
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    if (err.status == 404) {
        res.status(404).json({
            success: false,
            message: "endpoint not found"
        });
    } else {
        next(err);
    }
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        success: false,
        message: err.message || "Internal server error"
    });
    console.log(err);
});

/**
 * Mongoose setup
 */
mongoose.connect(
    process.env.MONGO_URL,
    function(err) {
        if (err) throw err;
    }
);
mongoose.connection.on(
    "error",
    console.error.bind(console, "connection error:")
);

server.listen(process.env.PORT || 3000, err => {
    if (err) {
        console.log("Error binding to port:");
        console.log(err);
    } else {
        console.log(`Server listening on port: ${process.env.PORT || 3000}`);
    }
});
