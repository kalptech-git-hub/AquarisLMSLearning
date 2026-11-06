// const path = require("path");
// const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const crypto = require("crypto");
const { welcomeEmailTemplate, resetPasswordEmailTemplate } = require("../utils/emailTemplate");
const transporter = require("../utils/transporter");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

const {
  findUserByEmail,
  getUserById,
  getStudentCountModel,
  updateUserPhoto,
  getStudentRole,
  insertUser,
  getRoleByCode,
  saveResetToken,
  findUserByResetToken,
  updateUserPassword,
  updateUserProfile,
  updateUserLastLogin
} = require("../models/user.model");
const { validateUsername, validateFullName, validateEmail, validatePassword } = require("../utils/validation");

// exports.registerUser = async (req, res) => {
//   let { user_full_name, user_mobile_no, username, user_email, user_password
//   } = req.body;
//   const hasSpaces = /\s/;


//   console.log(req.body);

//   // if (!user_full_name || !user_mobile_no || !username || !user_email || !user_password) {
//   //   return res.status(400).json({
//   //     success: false,
//   //     message: "All fields are required"
//   //   });
//   // }

//   // // Username validation
//   // const usernameRegex = /^[a-zA-Z0-9_.]+$/;

//   // if (!username || typeof username !== "string") {
//   //   return res.status(400).json({ error: "Username is required" });
//   // }

//   // username = username.trim();

//   // if (username.length < 5 || username.length > 30) {
//   //   return res.status(400).json({
//   //     error: "Username must be between 5 and 30 characters",
//   //   });
//   // }

//   // if (/\s/.test(username)) {
//   //   return res.status(400).json({
//   //     error: "Username cannot contain spaces",
//   //   });
//   // }

//   // if (!usernameRegex.test(username)) {
//   //   return res.status(400).json({
//   //     error: "Username can only contain letters, numbers, underscores, and dots",
//   //   });
//   // }
//   // if (!/[a-zA-Z]/.test(username)) {
//   //   return res.status(400).json({
//   //     error: "Username must contain at least one letter",
//   //   });
//   // }


//   // if (!/^[a-zA-Z0-9]/.test(username) || !/[a-zA-Z0-9]$/.test(username)) {
//   //   return res.status(400).json({
//   //     error: "Username cannot start or end with an underscore or dot",
//   //   });
//   // }

//   // // Name validation
//   // const nameregex = /^[A-Za-z\s]+$/;

//   // if (!user_full_name || typeof user_full_name !== "string") {
//   //   return res
//   //     .status(400)
//   //     .json({ error: "Full name is required" });
//   // }
//   // user_full_name = user_full_name.trim();
//   // if (user_full_name.length < 2 || user_full_name.length > 50 || !nameregex.test(user_full_name)) {
//   //   return res
//   //     .status(400)
//   //     .json({ error: "Name must be min 2 and max 50 characters and only letters" });
//   // }
//   // if (/\s{2,}/.test(user_full_name)) {
//   //   return res
//   //     .status(400)
//   //     .json({ error: "Name cannot contain multiple consecutive spaces" });
//   // }

//   // // Email validation
//   // const emailregex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z0-9-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;
//   // if (!emailregex.test(user_email) || hasSpaces.test(user_email)) {
//   //   return res.status(400).json({ error: "Invalid email format" });
//   // }
//   // if (user_email.length > 100) { return res.status(400).json({ error: "email must not exceed 100 characters" }) }

//   // // Password validation
//   // const passwordRegex =
//   //   /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;
//   // if (user_password.length < 6 || user_password.length > 20) {
//   //   return res.status(400).json({
//   //     error: "Password must be between 6 and 20 characters",
//   //   });
//   // }
//   // if (!passwordRegex.test(user_password) || hasSpaces.test(user_password)) {
//   //   return res.status(400).json({
//   //     error:
//   //       "Password cannot contain spaces",
//   //   });
//   // }

//   // if (!passwordRegex.test(user_password)) {
//   //   return res.status(400).json({
//   //     error:
//   //       "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
//   //   });
//   // }


//   username = validateUsername(username);

//   user_full_name = validateFullName(user_full_name);

//   user_email = validateEmail(user_email);

//   validatePassword(user_password);


//   let connection;
//   let profilePhoto = "";
//   let profilePhotoCloudId = null;
//   let profileUploadCommitted = false;

//   try {

//     connection = await db.getConnection();

//     await connection.beginTransaction();

//     const studentRole = await getRoleByCode(connection, "STD");

//     if (!studentRole) {
//       throw new Error("Student role not found.");
//     }
//     // Create user
//     const userId = await insertUser(connection, {
//       user_full_name,
//       user_mobile_no,
//       username,
//       user_profile_photo: "",
//       user_email,
//       user_password,
//       role_id: studentRole.role_id,
//       created_by: 0,
//       updated_by: 0
//     });

//     // let profilePhoto = "";
//     // let profilePhotoCloudId = null;
//     // let profileUploadCommitted = false;

//     // if (req.file) {

//     //   const userDir = path.join(
//     //     __dirname,
//     //     `../uploads/users/${userId}`
//     //   );

//     //   fs.mkdirSync(userDir, { recursive: true });

//     //   const newPath = path.join(
//     //     userDir,
//     //     req.file.filename
//     //   );

//     //   fs.renameSync(req.file.path, newPath);

//     //   profilePhoto =
//     //     `/uploads/users/${userId}/${req.file.filename}`;

//     //   await updateUserPhoto(
//     //     connection,
//     //     userId,
//     //     profilePhoto
//     //   );

//     // }

//     if (req.file) {
//       const uploadResult = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           {
//             resource_type: "image",
//             folder: "user_profile_photos"
//           },
//           (error, result) => {
//             if (error) {
//               return reject(error);
//             }
//             resolve(result);
//           }
//         );

//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//       });

//       profilePhoto = uploadResult.secure_url;
//       profilePhotoCloudId = uploadResult.public_id;

//       await updateUserPhoto(
//         connection,
//         userId,
//         profilePhoto,
//         profilePhotoCloudId
//       );
//     }

//     profileUploadCommitted = true;

//     await connection.commit();

//     console.log("USER CREATED");

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       userId
//     });

//   } catch (error) {

//     if (profilePhotoCloudId && !profileUploadCommitted) {
//       try {
//         await cloudinary.uploader.destroy(profilePhotoCloudId, { resource_type: "image" });
//       } catch (cleanupError) {
//         console.error("Register User Cloudinary Cleanup Error:", cleanupError);
//       }
//     }

//     if (connection) {
//       await connection.rollback();
//     }
//     console.log("Create User Error:", error);

//     if (error.code === 'ER_DUP_ENTRY' || error.code === 'DUPLICATE_ENTRY') {
//       return res.status(400).json({ error: error.message });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
//   finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// };

exports.registerUser = async (req, res) => {
  let { user_full_name, user_mobile_no, username, user_email, user_password
  } = req.body;
  const hasSpaces = /\s/;


  console.log(req.body);


  username = validateUsername(username);

  user_full_name = validateFullName(user_full_name);

  user_email = validateEmail(user_email);

  validatePassword(user_password);


  let connection;
  let profilePhoto = "";
  let profilePhotoCloudId = null;
  let profileUploadCommitted = false;

  try {

    connection = await db.getConnection();

    await connection.beginTransaction();

    const studentRole = await getRoleByCode(connection, "STD");

    if (!studentRole) {
      throw new Error("Student role not found.");
    }
    // Create user
    const userId = await insertUser(connection, {
      user_full_name,
      user_mobile_no,
      username,
      user_profile_photo: "",
      user_email,
      user_password,
      role_id: studentRole.role_id,
      created_by: 0,
      updated_by: 0
    });

    // let profilePhoto = "";
    // let profilePhotoCloudId = null;
    // let profileUploadCommitted = false;

    // if (req.file) {

    //   const userDir = path.join(
    //     __dirname,
    //     `../uploads/users/${userId}`
    //   );

    //   fs.mkdirSync(userDir, { recursive: true });

    //   const newPath = path.join(
    //     userDir,
    //     req.file.filename
    //   );

    //   fs.renameSync(req.file.path, newPath);

    //   profilePhoto =
    //     `/uploads/users/${userId}/${req.file.filename}`;

    //   await updateUserPhoto(
    //     connection,
    //     userId,
    //     profilePhoto
    //   );

    // }

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "user_profile_photos"
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      profilePhoto = uploadResult.secure_url;
      profilePhotoCloudId = uploadResult.public_id;

      await updateUserPhoto(
        connection,
        userId,
        profilePhoto,
        profilePhotoCloudId
      );
    }

    // New line added
    await connection.commit();

    profileUploadCommitted = true;

    console.log("USER CREATED: ", userId);

    // Release DB connection before sending email
    connection.release();
    connection = null;

    // await connection.commit();

    // DB work is finished, now send email
    try {
      const createdAt = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user_email,
        subject: "Welcome to Nihongo LMS!",
        html: welcomeEmailTemplate({
          recipientName: user_full_name,
          username: username,
          email: user_email,
          password: user_password,
          role: "Student",
          date: createdAt,
          isUpdate: false,
          showPassword: true,
        })
      })

      console.log("Welcome email sent:", info.messageId);

    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }


    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId
    });

  } catch (error) {

    if (profilePhotoCloudId && !profileUploadCommitted) {
      try {
        await cloudinary.uploader.destroy(profilePhotoCloudId, { resource_type: "image" });
      } catch (cleanupError) {
        console.error("Register User Cloudinary Cleanup Error:", cleanupError);
      }
    }

    if (connection) {
      await connection.rollback();
    }
    console.log("Create User Error:", error);

    if (error.code === 'ER_DUP_ENTRY' || error.code === 'DUPLICATE_ENTRY') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.loginUser = async (req, res) => {
  try {

    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required"
      });
    }

    const hasSpaces = /\s/;

    const emailregex =
      /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;

    if (!emailregex.test(user_email) || hasSpaces.test(user_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const user = await findUserByEmail(user_email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Optional
    if (user.is_active !== 1) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive."
      });
    }

    const isMatch = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    await updateUserLastLogin(user.user_id);

    // JWT generation starts here
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
        role_code: user.role_code,
        company_id: user.company_id,
        username: user.username,
        user_email: user.user_email,
        user_full_name: user.user_full_name,
        user_mobile_no: user.user_mobile_no,
        user_profile_photo: user.user_profile_photo,
        user_profile_cloud_id: user.user_profile_cloud_id,
        address: user.address,
        enrolled_count: user.enrolled_count,
        created_on: user.created_at,
        qualification: user.qualification,
        experience: user.experience,
        biography: user.biography,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    // console.log(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        user_full_name: user.user_full_name,
        user_mobile_no: user.user_mobile_no,
        username: user.username,
        user_email: user.user_email,
        role_id: user.role_id,
        role_code: user.role_code,
        role_name: user.role_name,
        user_profile_photo: user.user_profile_photo,
        user_profile_cloud_id: user.user_profile_cloud_id,
        address: user.address,
        enrolled_count: user.enrolled_count,
        created_on: user.created_at,
        qualification: user.qualification,
        experience: user.experience,
        biography: user.biography,
        user_last_login: new Date().toISOString()
      }
    });

  } catch (error) {

    console.log("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

exports.getProfile = async (req, res) => {
  try {

    const user = await getUserById(req.user.user_id);

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
exports.forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This email is not registered."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await saveResetToken(user.user_id, token, expiry);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.user_email,
      subject: "Reset Your Password - Nihongo LMS",
      html: resetPasswordEmailTemplate({
        recipientName: user.user_full_name,
        resetLink
      })
    });

    res.status(200).json({
      success: true,
      message: "Reset link sent to your email."
    });

  } catch (error) {

    console.log("Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {

    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required"
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (6-20 chars)"
      });
    }

    const user = await findUserByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link"
      });
    }

    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired. Please request a new one."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await updateUserPassword(user.user_id, hashedPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in."
    });

  } catch (error) {

    console.log("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const roleCode = req.user.role_code;
  let connection;
  let profilePhotoUrl = null;
  let profilePhotoCloudId = null;
  let profileUpdateCommitted = false;

  try {
    const user_full_name = validateFullName(req.body.user_full_name);
    const username = validateUsername(req.body.username);
    const user_email = validateEmail(req.body.user_email);
    const user_mobile_no = String(req.body.user_mobile_no || "").trim();

    if (!/^[6-9]\d{9}$/.test(user_mobile_no)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9."
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "user_profile_photos"
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      profilePhotoUrl = uploadResult.secure_url;
      profilePhotoCloudId = uploadResult.public_id;
    }

    const normalizeText = (value) => {
      return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
    };

    const address = req.body.address ? normalizeText(req.body.address) : null;
    const qualification = req.body.qualification ? normalizeText(req.body.qualification) : null;
    const experience = req.body.experience ? normalizeText(req.body.experience) : null;
    const biography = req.body.biography ? String(req.body.biography).trim() : null;

    await updateUserProfile(connection, userId, {
      user_full_name,
      user_mobile_no,
      username,
      user_email,
      role_code: roleCode,
      address,
      qualification,
      experience,
      biography
    });

    if (req.file) {
      await updateUserPhoto(
        connection,
        userId,
        profilePhotoUrl,
        profilePhotoCloudId
      );
    }

    await connection.commit();
    profileUpdateCommitted = true;

    const updatedUser = await findUserByEmail(user_email);
    const token = jwt.sign(
      {
        user_id: updatedUser.user_id,
        role_id: updatedUser.role_id,
        role_code: updatedUser.role_code,
        username: updatedUser.username,
        company_id: updatedUser.company_id,
        user_email: updatedUser.user_email,
        user_full_name: updatedUser.user_full_name,
        user_mobile_no: updatedUser.user_mobile_no,
        user_profile_photo: updatedUser.user_profile_photo,
        user_profile_cloud_id: updatedUser.user_profile_cloud_id,
        address: updatedUser.address,
        enrolled_count: updatedUser.enrolled_count,
        created_on: updatedUser.created_at,
        qualification: updatedUser.qualification,
        experience: updatedUser.experience,
        biography: updatedUser.biography
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      token,
      user: {
        user_id: updatedUser.user_id,
        user_full_name: updatedUser.user_full_name,
        user_mobile_no: updatedUser.user_mobile_no,
        username: updatedUser.username,
        user_email: updatedUser.user_email,
        role_id: updatedUser.role_id,
        role_code: updatedUser.role_code,
        role_name: updatedUser.role_name,
        user_profile_photo: updatedUser.user_profile_photo,
        user_profile_cloud_id: updatedUser.user_profile_cloud_id,
        address: updatedUser.address,
        enrolled_count: updatedUser.enrolled_count,
        created_on: updatedUser.created_at,
        qualification: updatedUser.qualification,
        experience: updatedUser.experience,
        biography: updatedUser.biography
      }
    });
  } catch (error) {
    if (profilePhotoCloudId && !profileUpdateCommitted) {
      try {
        await cloudinary.uploader.destroy(profilePhotoCloudId, { resource_type: "image" });
      } catch (cleanupError) {
        console.log("Update Profile Cloudinary Cleanup Error:", cleanupError);
      }
    }

    if (connection) {
      await connection.rollback();
    }

    if (error.code === "DUPLICATE_ENTRY" || error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (
      error.message.includes("required") ||
      error.message.includes("Invalid") ||
      error.message.includes("must")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.log("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};