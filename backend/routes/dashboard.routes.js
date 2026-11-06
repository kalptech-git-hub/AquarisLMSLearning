const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const {
    getDashboardStats,
    getInstructorDashboardStats,
    getTopCoursesByEnrollments,
} = require("../controllers/dashboard.controller");

// ==========================
// ADMIN DASHBOARD STATS
// ==========================
router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getDashboardStats
);

// ==========================
// TOP COURSES
// ==========================
router.get(
    "/top-courses",
    authMiddleware,
    adminMiddleware,
    getTopCoursesByEnrollments
);

// ==========================
// INSTRUCTOR DASHBOARD STATS
// ==========================
router.get(
    "/instructor/stats",
    authMiddleware,
    getInstructorDashboardStats
);

module.exports = router;