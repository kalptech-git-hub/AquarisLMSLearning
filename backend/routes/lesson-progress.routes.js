const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");


const {
  saveLessonProgress,
  markLessonComplete,
  getTrainingProgress,
  getTrainingStudentsProgress,
  getVideoSkipLogs,
  saveVideoSkipLog
} = require("../controllers/lesson-progress.controller");

/* SAVE PROGRESS */
router.post(
  "/save",
  authMiddleware,
  saveLessonProgress
);

/* LESSON COMPLETE */
router.post(
  "/complete",
  authMiddleware,
  markLessonComplete
);

/* SAVE VIDEO SKIP LOG */
router.post(
    "/skip",
    authMiddleware,
    saveVideoSkipLog
);

/* GET VIDEO SKIP LOGS */
router.get(
    "/skip/:lessonId",
    authMiddleware,
    getVideoSkipLogs
);

router.get(
  "/training/:trainingId",
  authMiddleware,
  getTrainingProgress
);

router.get(
  "/:trainingId/students",
  authMiddleware,
  adminOrInstructorMiddleware,
  getTrainingStudentsProgress
);

module.exports = router;