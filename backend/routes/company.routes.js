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
} = require("../controllers/company.controller");


// Fetch courses for dropdown for enrolling employees
router.get("/courses", authMiddleware, companyAdminMiddleware, getCourses);

// Fetch all employees for the company
router.get("/employees", authMiddleware, companyAdminMiddleware, getEmployees);


// Super Admin - Get all companies
router.get("/", authMiddleware, adminMiddleware, getAllCompanies);


// Assign trainings to company
router.post("/:companyId/assign-trainings", authMiddleware, adminMiddleware, assignTrainingsToCompany);


// Create employee
router.post("/employees", authMiddleware, companyAdminMiddleware, userUpload.single("user_profile_photo"), createEmployee);


// Enroll employee in Courses
router.post("/enroll-employee", authMiddleware, companyAdminMiddleware, enrollEmployee);

module.exports = router;