const express = require("express");
const router = express.Router();

const {
    createTraining,
    getTrainingById,
    updateTraining,
    updateTrainingStatus,
    getAllTrainingsForTrainingTable,
    publishTraining,
    unpublishTraining,
    startEnrollment,
    stopEnrollment
} = require("../controllers/training.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");
const upload = require("../middlewares/upload.middleware");


// New for getTrainingById - for edit- preload data
router.get("/:trainingId", authMiddleware, adminOrInstructorMiddleware, getTrainingById);

// New for create training 
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("training_thumbnail"),
    createTraining
);

/* This is route is to fetch all the trainings, 
only on the training table, which is on admin dashboard */
router.get("/", authMiddleware, adminMiddleware, getAllTrainingsForTrainingTable);


// New for update training
router.put("/:trainingId", authMiddleware, adminMiddleware, upload.single("training_thumbnail"), updateTraining);

router.patch(
    "/:trainingId/status",
    authMiddleware,
    adminMiddleware,
    updateTrainingStatus
);

router.put(
    "/:trainingId/publish",
    authMiddleware,
    adminOrInstructorMiddleware,
    publishTraining
);

router.put(
    "/:trainingId/unpublish",
    authMiddleware,
    adminOrInstructorMiddleware,
    unpublishTraining
);

router.put("/:trainingId/start-enrollment", authMiddleware, adminOrInstructorMiddleware, startEnrollment);

router.put("/:trainingId/stop-enrollment", authMiddleware, adminOrInstructorMiddleware, stopEnrollment);

module.exports = router;