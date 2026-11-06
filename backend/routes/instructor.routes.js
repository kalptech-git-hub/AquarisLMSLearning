const express = require("express");
const router = express.Router();

const {
   getInstructor,
   createInstructor,
   getActiveInstructors,
   getInstructorById,
   updateInstructor,
   getStudentsByTrainingId,
   getMyStudentCount,
   getInstructorCourses
} = require("../controllers/instructor.controller");

const upload = require("../middlewares/userUpload.middleware")

const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const instructorMiddleware = require("../middlewares/instructor.middleware");


// Route
router.get("/", authMiddleware, adminMiddleware, getInstructor);

// CREATE INSTRUCTOR ROUTE
router.post("/", authMiddleware, adminMiddleware, upload.single("user_profile_photo"), createInstructor);

// Get only active instructors
router.get("/active", authMiddleware, adminMiddleware, getActiveInstructors);

// GET TOTAL STUDENTS FOR LOGGED-IN INSTRUCTOR — must come before "/:userId"
router.get("/me/student-count", authMiddleware, getMyStudentCount);

// GET THE COURSES WHICH ARE ASSIGNED TO INSTRUCTOR
router.get("/instructorCourses", authMiddleware, instructorMiddleware, getInstructorCourses);

// GET INSTRUCTOR BY USER ID - FETCH INFO FOR EDIT 
router.get("/:userId", authMiddleware, adminMiddleware, getInstructorById);


//UPDATE INSTRUCTOR 
router.put("/:userId", authMiddleware, adminMiddleware, upload.single("user_profile_photo"), updateInstructor);




module.exports = router;
