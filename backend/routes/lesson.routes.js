const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    createLesson,
    getLessonsByTopic,
    getLessonById,
    updateLesson,
    deleteLesson,
    getLessonResource
} = require("../controllers/lesson.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");
const lessonUpload = require("../middlewares/lessonUpload.middleware");

const restrictCompletedTraining = require("../middlewares/restrictCompletedTraining.middleware");

const uploadLesson = (req, res, next) => {
    lessonUpload.single("lesson_video")(req, res, (err) => {

        if (err instanceof multer.MulterError) {

            if (err.code === "LIMIT_FILE_SIZE") {

                return res.status(400).json({
                    success: false,
                    message: "File size exceeds the maximum allowed limit of 80 MB."
                });

            }

        }

        if (err) {

            return res.status(400).json({
                success: false,
                message: err.message
            });

        }

        next();

    });
};

// CREATE LESSON
router.post(
    "/",
    authMiddleware,
    adminOrInstructorMiddleware,
    uploadLesson,
    restrictCompletedTraining,
    // lessonUpload.single("lesson_video"),
    createLesson
);

// GET Lessons by Topic - curriculum display
router.get(
    "/topic/:topicId",
    authMiddleware,
    adminOrInstructorMiddleware,
    getLessonsByTopic
);


// GET LESSON BY ID FOR EDIT
router.get(
    "/:lessonId",
    authMiddleware,
    adminOrInstructorMiddleware,
    getLessonById
);

// GET RESOURCE/FILE LESSON - FOR VIEW in lesson player.
router.get(
    "/:lessonId/resource",
    authMiddleware,
    getLessonResource

);

// UPDATE LESSON
router.put(
    "/:lessonId",
    authMiddleware,
    adminOrInstructorMiddleware,
    uploadLesson,
    restrictCompletedTraining,
    //lessonUpload.single("lesson_video"),
    updateLesson
);

// DELETE LESSON
router.delete(
    "/:lessonId",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    deleteLesson
);

module.exports = router;