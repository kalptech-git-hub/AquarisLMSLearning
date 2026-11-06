const express = require("express");
const router = express.Router();

const { createQuiz, getQuizByLesson, startQuizAttempt, getQuizForAttempt, submitQuizAttempt, getAttemptResult, getQuizAttemptHistory, deleteQuiz } = require("../controllers/quiz.controller");
const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");

const restrictCompletedTrainingMiddleware = require("../middlewares/restrictCompletedTraining.middleware");

router.post(
    "/",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTrainingMiddleware,
    createQuiz
);

router.get(
    "/lesson/:lessonId",
    authMiddleware,
    getQuizByLesson
);

router.post(
    "/:quizId/attempts",
    authMiddleware,
    startQuizAttempt
);

router.get(
    "/attempts/:attemptId",
    authMiddleware,
    getQuizForAttempt
);

router.post(
    "/attempts/:attemptId/submit",
    authMiddleware,
    submitQuizAttempt
);

router.get(
    "/attempts/:attemptId/result",
    authMiddleware,
    getAttemptResult
);

router.get(
    "/:quizId/attempts/history",
    authMiddleware,
    getQuizAttemptHistory
);

router.delete(
    "/:quizId",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTrainingMiddleware,
    deleteQuiz
);

module.exports = router;
