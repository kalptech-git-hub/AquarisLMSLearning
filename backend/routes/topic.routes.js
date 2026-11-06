//topic.routes.js
const express = require("express");
const router = express.Router();

const {
    createTopic,
    getTopicById,
    updateTopic,
    deleteTopic,
    listTopicsByTraining
} = require("../controllers/topic.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");

const restrictCompletedTraining = require("../middlewares/restrictCompletedTraining.middleware");

router.post(
    "/",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    createTopic
);

router.get(
    "/training/:trainingId",
    authMiddleware,
    adminOrInstructorMiddleware,
    listTopicsByTraining
);

router.get(
    "/:topicId",
    authMiddleware,
    adminOrInstructorMiddleware,
    getTopicById
);

router.put(
    "/:topicId",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    updateTopic
);


router.delete(
    "/:topicId",
    authMiddleware,
    adminOrInstructorMiddleware,
    restrictCompletedTraining,
    deleteTopic
);

module.exports = router;