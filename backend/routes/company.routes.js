const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");
const companyAdminMiddleware = require("../middlewares/companyAdmin.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const userUpload = require("../middlewares/userUpload.middleware");

const {
  createEmployee,
  getEmployees,
  getCourses,
  enrollEmployee,
  getAllCompanies,
  assignTrainingsToCompany,
  getCompanyById,
  getEmployeeVideoActivity,
  getEmployeeTrainingProgress,
  createCompany,
} = require("../controllers/company.controller");


// Fetch courses for dropdown for enrolling employees
router.get("/courses", authMiddleware, companyAdminMiddleware, getCourses);

// Fetch all employees for the company
router.get("/employees", authMiddleware, companyAdminMiddleware, getEmployees);

router.get(
  "/employees/:userId/training-progress",
  authMiddleware,
  companyAdminMiddleware,
  getEmployeeTrainingProgress
);

// Fetch employee video logs-
router.get("/employees/:userId/video-activity", authMiddleware, companyAdminMiddleware, getEmployeeVideoActivity);


// Super Admin - Get all companies
router.get("/", authMiddleware, adminMiddleware, getAllCompanies);

// GET COMPANY BY ID
router.get("/:companyId", authMiddleware, adminMiddleware, getCompanyById);

// Create company and company admin account
router.post("/create", authMiddleware, adminMiddleware, createCompany);

// Assign trainings to company
router.post("/:companyId/assign-trainings", authMiddleware, adminMiddleware, assignTrainingsToCompany);


// Create employee
router.post("/employees", authMiddleware, companyAdminMiddleware, userUpload.single("user_profile_photo"), createEmployee);


// Enroll employee in Courses
router.post("/enroll-employee", authMiddleware, companyAdminMiddleware, enrollEmployee);

module.exports = router;