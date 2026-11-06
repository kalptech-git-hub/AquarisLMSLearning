const express = require("express");

const router = express.Router();

const {
  createLiveSession,
  getLiveSession,
  updateLiveSession,
  deleteLiveSession,
  getUpcomingLiveSessions
} = require("../controllers/live-session.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");
const { studentMiddleware } = require("../middlewares/student.middleware");


// CREATE LIVE SESSION
router.post(
  "/",
  authMiddleware,
  adminOrInstructorMiddleware,
  createLiveSession
);


// GET UPCOMING LIVE SESSIONS FOR A STUDENT
router.get(
  "/upcoming",
  authMiddleware,
  studentMiddleware,
  getUpcomingLiveSessions
);


// GET LIVE SESSION BY LESSON
router.get(
  "/:lessonId",
  authMiddleware,
  adminOrInstructorMiddleware,
  getLiveSession
);


// UPDATE LIVE SESSION
router.put(
  "/:lessonId",
  authMiddleware,
  adminOrInstructorMiddleware,
  updateLiveSession
);


// DELETE LIVE SESSION
router.delete(
  "/:lessonId",
  authMiddleware,
  adminOrInstructorMiddleware,
  deleteLiveSession
);


module.exports = router;