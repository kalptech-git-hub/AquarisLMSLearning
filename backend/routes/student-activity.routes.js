//student-activity.routes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");

const {
    logActivity,
    getActivity,
    getRecentLearning
} = require("../controllers/student-activity.controller");

// Log today's activity
router.post(
    "/ping",
    authMiddleware,
    logActivity
);

// Get activity history for the heatmap + streaks
router.get(
    "/",
    authMiddleware,
    getActivity
);

// Recently viewed lesson per course (Continue Learning)
router.get(
    "/recent-learning",
    authMiddleware,
    getRecentLearning
);

module.exports = router;