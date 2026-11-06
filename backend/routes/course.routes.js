const express = require("express");
const router = express.Router();

const {
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseDropdown,
  createCourseOnly,
  getCoursesForCourseTable,
  updateCourseOnly,
  getOnlyCourseById,
  getAllTrainingsForLanding,
} = require("../controllers/course.controller");
const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const upload = require("../middlewares/upload.middleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuth.middleware");

// COURSE CREATION ONLY
router.post("/createCourse", authMiddleware, adminMiddleware, createCourseOnly);

// COURSE DROPDOWN - TO CREATE TRAINING
router.get("/dropdown", authMiddleware, adminMiddleware, getCourseDropdown);

// GET ALL COURSES FOR COURSE TABLE
router.get("/getCoursesForCourseTable", authMiddleware, adminMiddleware, getCoursesForCourseTable)

// COURSE BY ID - PRELOAD DATA DOR EDIT
router.get("/:courseId", authMiddleware, adminMiddleware, getOnlyCourseById);

// ONLY COURSE EDIT - COURSE BY ID 
router.put("/:courseId", authMiddleware, adminMiddleware, updateCourseOnly);

// ONLY COURSE DELETE - JUST KEEPING THE ROUTE.
// router.delete("/:id", authMiddleware, adminMiddleware, deleteCourse);

// Public Routes - USED ON LANDING, TRAINING TABLE, TRAINING DETAILS
// This route is to fetch all the Training, name is chanaged to Courses now.
router.get("/", optionalAuthMiddleware, getAllTrainingsForLanding);



// GET COURSE BY ID
// router.get("/:courseId", authMiddleware, adminMiddleware, getCourseById);

// CREATE COURSE - Admin Routes
// router.post("/", authMiddleware, adminMiddleware, upload.single("training_thumbnail"), createCourse);

// EDIT COURSE 
// router.put("/:courseId", authMiddleware, adminMiddleware, upload.single("training_thumbnail"), updateCourse);




// router.delete("/:id", authMiddleware, adminMiddleware, deleteCourse);



module.exports = router;