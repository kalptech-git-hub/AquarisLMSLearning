const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getStudentCount,
  forgotPassword,
  resetPassword
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.moddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const upload = require("../middlewares/userUpload.middleware");


router.post("/register", upload.single("user_profile_photo"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("user_profile_photo"), updateProfile);


// PUT /api/users/profile

module.exports = router;