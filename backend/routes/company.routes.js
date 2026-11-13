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
} = require("../controllers/company.controller");

// Super Admin - Get all companies
router.get("/", authMiddleware, adminMiddleware, getAllCompanies);

// Employees
router.get("/employees", authMiddleware, companyAdminMiddleware,getEmployees);
router.post("/employees", authMiddleware, companyAdminMiddleware, userUpload.single("user_profile_photo"), createEmployee);

// Courses
router.get("/courses", authMiddleware, companyAdminMiddleware, getCourses);
router.post("/enroll-employee", authMiddleware, companyAdminMiddleware, enrollEmployee);

module.exports = router;