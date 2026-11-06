const jwt = require("jsonwebtoken");

const express = require('express');
const http = require("http");
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require("./models/db");

const { Server } = require("socket.io");

const lmsSocket = require("./sockets/lmsSocket");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

// DB connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dateStrings: true
});

connection.connect((err) => {
    if (err) console.error("MySQL connection error: ", err);
    else console.log("Connected to MySQL Database");
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL, // Your Vite frontend
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Socket connection
// io.on("connection", (socket) => {

//     console.log("Socket connected:", socket.id);


//     socket.on("join-user-room", (userId) => {

//         if (!userId) {
//             return;
//         }

//         socket.join(`user:${userId}`);

//         console.log(
//             `User ${userId} joined notification room`
//         );
//     });


//     socket.on("disconnect", () => {

//         console.log(
//             "Socket disconnected:",
//             socket.id
//         );

//     });

// });

// Socket authentication
io.use((socket, next) => {

    try {

        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (err, decoded) => {

                if (err) {
                    return next(
                        new Error("Authentication error: Invalid token")
                    );
                }

                socket.user = decoded;

                next();
            }
        );

    } catch (err) {

        next(new Error("Unauthorized"));

    }

});


// Register LMS socket events
lmsSocket(io, app);


// Make io accessible inside routes
app.set("io", io);




// Routes
// app.use("/api/registration", require("./routes/registration.route"));
app.use("/api/users", require("./routes/user.route"));
app.use("/api/instructors", require("./routes/instructor.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/enrollments", require("./routes/enrollment.routes"));
app.use("/api/lessons", require("./routes/lesson.routes"));
app.use("/api/lessons-progress", require("./routes/lesson-progress.routes"));
app.use("/api/lessons-contents", require("./routes/lesson-content.routes"));
app.use("/api/topics", require("./routes/topic.routes"));
app.use("/api/trainings", require("./routes/training.routes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/quizzes", require("./routes/quiz.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/live-sessions", require("./routes/live-session.routes"));
app.use("/api/dictionary", require("./routes/dictionary.routes"));
// app.use("/api/company", require("./routes/company.routes"));

const speakingRoutes = require("./routes/speaking.routes");
app.use("/api/speaking", speakingRoutes);

// Server static react files
const buildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(buildPath));

const studentActivityRoutes = require("./routes/student-activity.routes");
app.use("/api/students/activity", studentActivityRoutes);

// Catch-all route for React
// app.get("*", (req, res) => {
//     res.sendFile(path.join(buildPath, 'index.html'));
// });

app.use((req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// Error Handle
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});