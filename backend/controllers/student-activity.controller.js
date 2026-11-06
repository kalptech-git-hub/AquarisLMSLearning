//student-activity.controller.js
const {
    logActivityModel,
    getActivityByUserModel,
    getRecentLearningForStudent
} = require("../models/student-activity.model");

/* DETERMINE HEATMAP INTENSITY LEVEL FROM RAW ACTIVITY COUNT */
const getLevel = (count) => {

    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;

    return 3;

};


const buildFullRange = (rows, days) => {

    const byDate = {};

    rows.forEach((row) => {
        byDate[row.activity_date] = row.activity_count;
    });

    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {

        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const iso = date.toISOString().split("T")[0];
        const count = byDate[iso] || 0;

        result.push({
            date: iso,
            count,
            level: getLevel(count)
        });

    }

    return result;

};


const computeStreaks = (days) => {

    let longest = 0;
    let running = 0;

    days.forEach((day) => {

        if (day.level > 0) {
            running += 1;
            longest = Math.max(longest, running);
        } else {
            running = 0;
        }

    });

    let current = 0;

    for (let i = days.length - 1; i >= 0; i--) {

        if (days[i].level > 0) {
            current += 1;
        } else {
            break;
        }

    }

    const totalDays = days.filter(
        (d) => d.level > 0
    ).length;

    return { current, longest, totalDays };

};


exports.logActivity = async (req, res) => {

    try {

        await logActivityModel(req.user.user_id);

        return res.status(200).json({
            success: true,
            message: "Activity logged."
        });

    } catch (error) {

        console.log("Log Activity Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


exports.getActivity = async (req, res) => {

    try {

        const days = parseInt(req.query.days) || 91;

        const rows = await getActivityByUserModel(
            req.user.user_id,
            days
        );

        const fullRange = buildFullRange(rows, days);
        const streaks = computeStreaks(fullRange);

        return res.status(200).json({
            success: true,
            days: fullRange,
            streaks
        });

    } catch (error) {

        console.log("Get Activity Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


/*  RECENTLY VIEWED LESSON PER COURSE (for "My Learning") */
exports.getRecentLearning = async (req, res) => {

    try {

        const courses = await getRecentLearningForStudent(
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            courses
        });

    } catch (error) {

        console.log("Get Recent Learning Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};