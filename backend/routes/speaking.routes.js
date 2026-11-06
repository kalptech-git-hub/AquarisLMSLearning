const express = require("express");
const router = express.Router();

const {
    getSpeakingExercisesByCourse,
    addSpeakingExercises,
    deleteSpeakingExercise,
    compareSpeakingAttempt,
    getSpeakingExercisesForStudent,
    getStudentSpeakingProgress,
    saveStudentSpeakingProgress,
    resetStudentSpeakingProgress
} = require("../controllers/speaking.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");

// Admin/Instructor - view exercises for a course (management view)
router.get(
    "/course/:courseId",
    authMiddleware,
    adminOrInstructorMiddleware,
    getSpeakingExercisesByCourse
);

// Admin - add/replace exercises for a course
router.post(
    "/course/:courseId",
    authMiddleware,
    adminMiddleware,
    addSpeakingExercises
);

// Admin - delete a single exercise
router.delete(
    "/:speakingExerciseId",
    authMiddleware,
    adminMiddleware,
    deleteSpeakingExercise
);

// Student - fetch active exercises for a course (practice screen)
router.get(
    "/course/student/:courseId",
    authMiddleware,
    getSpeakingExercisesForStudent
);

// Student - compare recognized speech against expected phrase
router.post(
    "/compare",
    authMiddleware,
    compareSpeakingAttempt
);

// Student - get saved progress for a course
router.get(
    "/progress/:courseId",
    authMiddleware,
    getStudentSpeakingProgress
);

// Student - save/update progress
router.post(
    "/progress",
    authMiddleware,
    saveStudentSpeakingProgress
);

// Student - reset progress (back to picker)
router.delete(
    "/progress/:courseId",
    authMiddleware,
    resetStudentSpeakingProgress
);

module.exports = router;