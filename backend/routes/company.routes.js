const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.moddleware");
const companyAdminMiddleware = require("../middlewares/companyAdmin.middleware");
const userUpload = require("../middlewares/userUpload.middleware");

const {
  createEmployee,
} = require("../controllers/company.controller");

// Apply authentication and company admin authorization to all company routes
router.use(authMiddleware, companyAdminMiddleware);

// Employees
router.post("/employees", userUpload.single("user_profile_photo"), createEmployee);


module.exports = router;