const {
    getDashboardStatsModel,
    getInstructorDashboardStatsModel,
    getTopCoursesByEnrollmentsModel,
} = require("../models/dashboard.model");

// =======================
// ADMIN DASHBOARD STATS
// =======================
exports.getDashboardStats = async (req, res) => {
    try {
        const dashboardStats = await getDashboardStatsModel();

        return res.status(200).json({
            success: true,
            data: dashboardStats,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =======================
// INSTRUCTOR DASHBOARD STATS
// =======================
exports.getInstructorDashboardStats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const dashboardStats =
            await getInstructorDashboardStatsModel(userId);

        return res.status(200).json({
            success: true,
            data: dashboardStats,
        });
    } catch (error) {
        console.error("Instructor Dashboard Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =======================
// TOP COURSES
// =======================
exports.getTopCoursesByEnrollments = async (req, res) => {
    try {
        const courses = await getTopCoursesByEnrollmentsModel();

        return res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Top Courses Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};