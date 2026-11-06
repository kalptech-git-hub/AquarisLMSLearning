const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");


const {
  saveLessonProgress,
  markLessonComplete,
  getTrainingProgress,
  getTrainingStudentsProgress
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