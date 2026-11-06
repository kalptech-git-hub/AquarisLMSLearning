const express = require("express");
const router = express.Router();

const {
    createEnrollment,
    getEnrollments,
    updateEnrollmentStatus,
    getAllStudentsEnrollments,
    getEnrollmentById,
    getEnrolledTrainingingDetails,
    getStudentsByTrainingId,
    getInstructorStudentEnrollments   
} = require("../controllers/enrollment.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const instructorMiddleware = require("../middlewares/instructor.middleware");
// const studentMiddleware = require("../middlewares/student.middleware");
const { studentMiddleware } = require("../middlewares/student.middleware");
const userUpload = require("../middlewares/userUpload.middleware");
const adminOrInstructorMiddleware = require("../middlewares/adminOrInstructor.middleware");

// STUDENT
// CREATE ENROLLMENT
router.post(
    "/",
    authMiddleware,
    studentMiddleware,
    userUpload.single("user_profile_photo"),
    createEnrollment
);

// GET STUDENT ENROLLMENTS - FOR STUDENT DASHBOARD
router.get(
    "/",
    authMiddleware,
    getEnrollments
);

// GET ENROLLED COURSE ALL DETAILS - TRAINING, COURSE NAME, INSTRUCTOR, BOOKS, TOPICS, LESSON.
// Calling it training cause- student has enrolled in the training not course.
router.get("/mylearning/details/:trainingId", authMiddleware, getEnrolledTrainingingDetails) 

// Students on instructor -> Manage courses adn topic management
router.get("/training/:trainingId/students", authMiddleware, adminOrInstructorMiddleware, getStudentsByTrainingId);

// INSTRUCTOR
// GET ALL STUDENT ENROLLMENTS FOR THIS INSTRUCTOR'S COURSES
router.get(
    "/instructor/students",
    authMiddleware,
    instructorMiddleware,
    getInstructorStudentEnrollments
);

// ADMIN
router.get("/admin", authMiddleware, adminMiddleware, getAllStudentsEnrollments);

router.get("/admin/:enrollId", authMiddleware, adminMiddleware, getEnrollmentById)

// Admin approves/rejects enrollment
router.put(
    "/:enrollId/status",
    authMiddleware,
    adminMiddleware,
    updateEnrollmentStatus
);

module.exports = router;