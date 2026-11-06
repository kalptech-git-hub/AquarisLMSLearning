// instructor.controller.js
const path = require("path");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

const { welcomeEmailTemplate, resetPasswordEmailTemplate, welcomeEmailTemplateInstructor } = require("../utils/emailTemplate");


const {
  getInstructorModel,
  insertInstructor,
  getActiveInstructorModel,
  getInstructorByUserId,
  checkUsernameExistsExceptUser,
  checkEmailExistsExceptUser,
  checkMobileExistsExceptUser,
  updateUser,
  updateUserPassword,
  updateInstructorModel,
  getStudentsByTrainingIdModel,
  getTotalStudentsForInstructorModel,
  fetchInstructorCourses
} = require("../models/instructor.model");
const { getRoleByCode, insertUser, updateUserPhoto } = require("../models/user.model");
const { validateUsername, validateFullName, validateEmail, validatePassword } = require("../utils/validation");
const transporter = require("../utils/transporter");

/* GET INSTRUCTORS */
exports.getInstructor = async (req, res) => {
  try {

    const instructors = await getInstructorModel();

    return res.status(200).json({
      success: true,
      data: instructors
    });

  } catch (error) {

    console.log("Get Instructor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

/* CREATE INSTRUCTOR */
// exports.createInstructor = async (req, res) => {
//   let {
//     user_full_name,
//     user_mobile_no,
//     username,
//     user_email,
//     user_password,

//     ins_bio,
//     ins_qualification,
//     ins_experience

//   } = req.body;

//   console.log(req.body);

//   // VALIDATIONS
//   // const hasSpaces = /\s/;

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
//   let uploadedProfilePhotoPath = "";
//   let userDir = "";

//   try {
//     connection = await db.getConnection();

//     await connection.beginTransaction();

//     // Get Instructor Role
//     const instructorRole = await getRoleByCode(connection, "INS");

//     if (!instructorRole) {
//       throw new Error("Instructor role not found");
//     }
//     // Create User
//     const userId = await insertUser(
//       connection,
//       {
//         user_full_name,
//         user_mobile_no,
//         username,
//         user_profile_photo: "",
//         user_email,
//         user_password,
//         role_id: instructorRole.role_id,
//         created_by: req.user.user_id,
//         updated_by: req.user.user_id
//       }
//     );

//     // Upload Photo (Cloudinary)
//     let profilePhoto = "";
//     let profilePhotoCloudId = null;

//     if (req.file) {
//       const uploadResult = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { resource_type: "image", folder: "user_profile_photos" },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         );

//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//       });

//       profilePhoto = uploadResult.secure_url;
//       profilePhotoCloudId = uploadResult.public_id;

//       await updateUserPhoto(connection, userId, profilePhoto, profilePhotoCloudId);
//     }

//     // Create Instructor
//     await insertInstructor(
//       connection,
//       {
//         user_id: userId,
//         ins_bio,
//         ins_qualification,
//         ins_experience,
//         created_by: req.user.user_id,
//         updated_by: req.user.user_id
//       }
//     );

//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Instructor created successfully."
//     });

//   } catch (error) {
//     if (connection) {
//       await connection.rollback();
//     }

//     // Delete uploaded profile photo
//     if (
//       uploadedProfilePhotoPath &&
//       fs.existsSync(uploadedProfilePhotoPath)
//     ) {
//       fs.unlinkSync(uploadedProfilePhotoPath);
//     }

//     // Delete empty user folder
//     if (
//       userDir &&
//       fs.existsSync(userDir)
//     ) {
//       const files = fs.readdirSync(userDir);

//       if (files.length === 0) {
//         fs.rmdirSync(userDir);
//       }
//     }


//     console.log(error);

//     if (error.code === 'ER_DUP_ENTRY' || error.code === 'DUPLICATE_ENTRY') {
//       return res.status(400).json({
//         success: false,
//         error: error.message
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create instructor."
//     });

//   } finally {
//     if (connection) {
//       connection.release();
//     }

//   }

// };

exports.createInstructor = async (req, res) => {
  let {
    user_full_name,
    user_mobile_no,
    username,
    user_email,
    user_password,

    ins_bio,
    ins_qualification,
    ins_experience

  } = req.body;

  console.log(req.body);

  //Validations
  username = validateUsername(username);

  user_full_name = validateFullName(user_full_name);

  user_email = validateEmail(user_email);

  validatePassword(user_password);

  let connection;
  // let uploadedProfilePhotoPath = "";
  // let userDir = "";
  let profilePhoto = "";
  let profilePhotoCloudId = null;
  let profileUploadCommitted = false;

  try {
    connection = await db.getConnection();

    await connection.beginTransaction();

    // Get Instructor Role
    const instructorRole = await getRoleByCode(connection, "INS");

    if (!instructorRole) {
      throw new Error("Instructor role not found");
    }
    // Create User
    const userId = await insertUser(
      connection,
      {
        user_full_name,
        user_mobile_no,
        username,
        user_profile_photo: "",
        user_email,
        user_password,
        role_id: instructorRole.role_id,
        created_by: req.user.user_id,
        updated_by: req.user.user_id
      }
    );

    // Upload Photo (Cloudinary)
    // let profilePhoto = "";
    // let profilePhotoCloudId = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "user_profile_photos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      profilePhoto = uploadResult.secure_url;
      profilePhotoCloudId = uploadResult.public_id;

      await updateUserPhoto(connection, userId, profilePhoto, profilePhotoCloudId);
    }

    // Create Instructor
    await insertInstructor(
      connection,
      {
        user_id: userId,
        ins_bio,
        ins_qualification,
        ins_experience,
        created_by: req.user.user_id,
        updated_by: req.user.user_id
      }
    );

    await connection.commit();
    profileUploadCommitted = true;

    console.log("INSTRUCTOR CREATED:", userId);

    // Release DB connection BEFORE sending email
    connection.release();
    connection = null;


    // Send welcome email AFTER successful DB commit
    try {

      const createdAt = new Date().toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }
      );

      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user_email,
        subject: "Welcome to Nihongo LMS!",
        // html: welcomeEmailTemplate({
        html: welcomeEmailTemplateInstructor({
          recipientName: user_full_name,
          username: username,
          email: user_email,
          password: user_password,
          role: "Instructor",
          date: createdAt,
          isUpdate: false,
          showPassword: true
        })
      });

      console.log(
        "Instructor welcome email sent:",
        info.messageId
      );

    } catch (emailError) {

      console.error(
        "Instructor welcome email failed:",
        emailError
      );

      // Do NOT rollback.
      // Instructor has already been created.
    }

    return res.status(201).json({
      success: true,
      message: "Instructor created successfully.",
      userId
    });

  } catch (error) {

    console.error(
      "Create Instructor Error:",
      error
    );

    // if (connection) {
    //   await connection.rollback();
    // }

    // Rollback DB transaction
    if (connection) {

      try {
        await connection.rollback();
      } catch (rollbackError) {

        console.error(
          "Instructor rollback error:",
          rollbackError
        );
      }
    }

    // Delete Cloudinary photo if transaction failed
    if (
      profilePhotoCloudId &&
      !profileUploadCommitted
    ) {

      try {

        await cloudinary.uploader.destroy(
          profilePhotoCloudId,
          {
            resource_type: "image"
          }
        );

      } catch (cleanupError) {

        console.error(
          "Instructor Cloudinary cleanup error:",
          cleanupError
        );
      }
    }

    // Delete uploaded profile photo
    // if (
    //   uploadedProfilePhotoPath &&
    //   fs.existsSync(uploadedProfilePhotoPath)
    // ) {
    //   fs.unlinkSync(uploadedProfilePhotoPath);
    // }

    // Delete empty user folder
    // if (
    //   userDir &&
    //   fs.existsSync(userDir)
    // ) {
    //   const files = fs.readdirSync(userDir);

    //   if (files.length === 0) {
    //     fs.rmdirSync(userDir);
    //   }
    // }


    if (error.code === 'ER_DUP_ENTRY' || error.code === 'DUPLICATE_ENTRY') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create instructor."
    });

  } finally {
    if (connection) {
      connection.release();
    }

  }

};

/* GET ACTIVE INSTRUCTORS */
exports.getActiveInstructors = async (req, res) => {
  try {

    const instructors = await getActiveInstructorModel();

    return res.status(200).json({
      success: true,
      instructors
    });

  } catch (error) {

    console.log("Get Active Instructor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

/* GET TOTAL STUDENTS TAUGHT - FOR LOGGED-IN INSTRUCTOR'S OWN PROFILE */
exports.getMyStudentCount = async (req, res) => {

  try {

    const totalStudents =
      await getTotalStudentsForInstructorModel(req.user.user_id);

    return res.status(200).json({
      success: true,
      totalStudents
    });

  } catch (error) {

    console.log("Get Instructor Student Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

/* GET INSTRUCTOR BY USER ID - FETCH EXISTING INSTRUCTOR DATA TO EDIT */
exports.getInstructorById = async (req, res) => {

  const { userId } = req.params;

  let connection;

  try {

    connection = await db.getConnection();

    const instructor =
      await getInstructorByUserId(
        connection,
        userId
      );

    if (!instructor) {

      return res.status(404).json({

        success: false,
        message: "Instructor not found."

      });

    }

    return res.status(200).json({

      success: true,
      data: instructor

    });

  }
  catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,
      message: "Failed to fetch instructor."

    });

  }
  finally {

    if (connection) {

      connection.release();

    }

  }

};

// GET THE COURSES WHICH ARE ASSIGNED TO INSTRUCTOR
exports.getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const courses = await fetchInstructorCourses(userId);

    return res.status(200).json({
      success: true,
      courses,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses.",
    });
  }
};

/* UPDATE INSTRUCTOR */
exports.updateInstructor = async (req, res) => {

  const { userId } = req.params;

  let {
    user_full_name,
    user_mobile_no,
    username,
    user_email,
    user_password,

    ins_bio,
    ins_qualification,
    ins_experience,

    is_active

  } = req.body;

  //console.log(req.user);

  user_full_name = validateFullName(user_full_name);

  username = validateUsername(username);

  user_email = validateEmail(user_email);

  // Optional while updating
  validatePassword(
    user_password,
    {
      required: false
    }
  );

  if (
    is_active !== "0" &&
    is_active !== "1"
  ) {

    return res.status(400).json({

      success: false,
      message: "Invalid status."

    });

  }

  is_active = Number(is_active);

  let connection;

  let uploadedProfilePhotoPath = "";
  let userDir = "";

  try {

    connection = await db.getConnection();

    await connection.beginTransaction();

    const instructor = await getInstructorByUserId(
      connection,
      userId
    );

    if (!instructor) {

      await connection.rollback();

      return res.status(404).json({

        success: false,
        message: "Instructor not found."

      });

    }

    const usernameExists =
      await checkUsernameExistsExceptUser(

        connection,
        username,
        userId

      );

    if (usernameExists) {

      await connection.rollback();

      return res.status(400).json({

        success: false,
        message: "Username already exists."

      });

    }

    const emailExists =
      await checkEmailExistsExceptUser(

        connection,
        user_email,
        userId

      );

    if (emailExists) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Email already exists."
      });

    }

    const mobileExists = await checkMobileExistsExceptUser(
      connection,
      user_mobile_no,
      userId
    );

    if (mobileExists) {
      await connection.rollback();

      return res.status(400).json({

        success: false,
        message: "Mobile number already exists."

      });

    }

    await updateUser(connection, userId, {
      user_full_name,
      user_mobile_no,
      username,
      user_email,
      is_active,
      updated_by: req.user.userId
    }
    );

    if (user_password) {
      await updateUserPassword(
        connection,
        userId,
        user_password,
        req.user.userId
      );
    }

    if (req.file) {
      // If previous photo stored in Cloudinary, delete it
      if (instructor.user_profile_cloud_id) {
        try {
          await cloudinary.uploader.destroy(instructor.user_profile_cloud_id, { resource_type: "image" });
        } catch (err) {
          console.log("Failed to delete old cloudinary instructor photo:", err);
        }
      } else if (instructor.user_profile_photo) {
        // legacy local file
        const oldPhotoPath = path.join(__dirname, "..", instructor.user_profile_photo);
        if (fs.existsSync(oldPhotoPath)) {
          try { fs.unlinkSync(oldPhotoPath); } catch (e) { console.log(e); }
        }
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "user_profile_photos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      const newProfileUrl = uploadResult.secure_url;
      const newProfileCloudId = uploadResult.public_id;

      await updateUserPhoto(connection, userId, newProfileUrl, newProfileCloudId);

    } else if (req.body.remove_photo === "1" && instructor.user_profile_photo) {

      // remove either cloudinary or local
      if (instructor.user_profile_cloud_id) {
        try {
          await cloudinary.uploader.destroy(instructor.user_profile_cloud_id, { resource_type: "image" });
        } catch (err) { console.log(err); }
      } else {
        const oldPhotoPath = path.join(__dirname, "..", instructor.user_profile_photo);
        if (fs.existsSync(oldPhotoPath)) {
          try { fs.unlinkSync(oldPhotoPath); } catch (e) { console.log(e); }
        }
      }

      await updateUserPhoto(connection, userId, "", null);
    }

    await updateInstructorModel(
      connection,
      userId,
      {
        ins_bio,
        ins_qualification,
        ins_experience,
        is_active,
        updated_by: req.user.userId
      }

    );

    await connection.commit();

    // Return the committed record so the frontend can synchronize open panels.
    const updatedInstructor = await getInstructorByUserId(
      connection,
      userId
    );

    return res.status(200).json({

      success: true,
      message: "Instructor updated successfully.",
      data: updatedInstructor

    });

  } catch (error) {

    if (connection) {

      await connection.rollback();

    }

    // Delete newly uploaded photo if update failed
    if (
      uploadedProfilePhotoPath &&
      fs.existsSync(uploadedProfilePhotoPath)
    ) {

      fs.unlinkSync(uploadedProfilePhotoPath);

    }

    console.log(error);

    return res.status(500).json({

      success: false,
      message: "Failed to update instructor."

    });

  } finally {

    if (connection) {

      connection.release();

    }

  }

};

