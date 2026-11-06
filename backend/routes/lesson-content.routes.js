const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");
const lessonContentUpload = require("../middlewares/lessonContentUpload.middleware");

const restrictCompletedTraining = require("../middlewares/restrictCompletedTraining.middleware");

const {
    createLessonContent,
    getLessonContents,
    updateLessonContent,
    deleteLessonContent,
    getContentById,
} = require("../controllers/lesson-content.controller");


// Create lesson content
router.post(
    "/:lessonId/contents",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    lessonContentUpload.single("content_file"),
    createLessonContent
);

// To display contents for that video lesson
router.get(
    "/:lessonId/contents",
    authMiddleware,
    getLessonContents
);

// Preload content data for edit
router.get(
    "/contents/:contentId",
    authMiddleware,
    adminOrInstructorMiddleware,
    getContentById
)

// Edit content
router.put(
    "/contents/:contentId",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    lessonContentUpload.single("content_file"),
    updateLessonContent
);

// Delete content
router.delete(
    "/contents/:contentId",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    deleteLessonContent
);

module.exports = router;