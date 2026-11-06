// course.controller.js
const fs = require("fs");
const path = require("path");

const {
  fetchCourseById,
  insertCourse,
  editCourse,
  removeCourse,
  // updateCourseThumbnail,
  insertTraining,
  updateTrainingThumbnail,
  insertTrainingBooks,
  insertTrainingInstructors,
  getActiveCourseCountModel,
  getCourseByIdModel,
  updateCourseModel,
  getTrainingIdByCourseId,
  updateTrainingModel,
  getTrainingThumbnail,
  deleteTrainingBooks,
  deleteTrainingInstructors,
  getCourseDropdownModel,
  createCourseModel,
  getCoursesForCourseTableModel,
  updateCourseOnlyModel,
  getOnlyCourseByIdModel,
  checkCourseHasTrainingsModel,
  fetchAllTrainingsForLanding
} = require("../models/course.model");
const db = require("../models/db");

// CREATE COURSE ONLY
exports.createCourseOnly = async (req, res) => {
  try {

    let {
      course_code,
      course_name,
      course_level
    } = req.body;

    course_code = course_code?.trim();
    course_name = course_name?.trim();
    course_level = course_level?.trim();

    if (!course_code || !course_name || !course_level) {
      return res.status(400).json({
        success: false,
        // message: "Course information are required."
        message: "Course category information is required."
      });
    }

    if (course_code !== course_code.trim()) {
      return res.status(400).json({
        success: false,
        // message: "Course code cannot start or end with spaces."
        message: "Course category code cannot start or end with spaces."
      });
    }

    if (course_code.length > 10) {
      return res.status(400).json({
        success: false,
        // message: "Course code must not exceed 10 characters."
        message: "Course category code must not exceed 10 characters."
      });
    }

    const courseCodeRegex = /^[a-zA-Z0-9_\s-]+$/;
    const hasAlphanumeric = /[a-zA-Z0-9]/;
    if (!courseCodeRegex.test(course_code)) {
      return res.status(400).json({
        success: false,
        // message: "Course code can only contain letters, numbers, spaces, dashes (-), and underscores (_)."
        message: "Course category code can only contain letters, numbers, spaces, dashes (-), and underscores (_)."
      });
    }
    if (!hasAlphanumeric.test(course_code)) {
      return res.status(400).json({
        success: false,
        // message: "Course code must contain at lease one alphanumeric character."
        message: "Course category code must contain at least one alphanumeric character."
      });
    }

    if (course_name.length < 3 || course_name.length > 100) {
      return res.status(400).json({
        success: false,
        // message: "Course name must be betwen 3 and 100 characters."
        message: "Course category name must be between 3 and 100 characters."
      });
    }

    if (course_level.length > 100) {
      return res.status(400).json({
        success: false,
        // message: "Course level must not exceed 100 characters."
        message: "Course category level must not exceed 100 characters."
      });
    }

    const courseId = await createCourseModel({
      course_code,
      course_name,
      course_level,
      created_by: req.user.user_id,
      updated_by: req.user.user_id
    });

    console.log("Course Id: ", courseId);

    return res.status(201).json({
      success: true,
      // message: "Course created successfully.",
      message: "Course category created successfully.",
      courseId
    });

  } catch (error) {

    console.log(error);

    if (error.code === 'ER_DUP_ENTRY' || error.code === 'DUPLICATE_ENTRY') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// COURSE DROPDOWN - TO CREATE TRAINING 
exports.getCourseDropdown = async (req, res) => {

  try {

    const courses =
      await getCourseDropdownModel();

    return res.status(200).json({
      success: true,
      courses
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      // message: "Failed to fetch courses."
      message: "Failed to fetch course categories."
    });

  }

};

// GET ALL COURSES FOR COURSE TABLE
exports.getCoursesForCourseTable = async (req, res) => {
  try {

    const courses =
      await getCoursesForCourseTableModel();

    return res.status(200).json({
      success: true,
      courses
    });

  } catch (error) {

    console.log("Get Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};
/* We are fetching training through this controller
so because now training name has changed to courses
message in the status does not need to change. */
/* GET ALL COURSES */
exports.getAllTrainingsForLanding = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;

    // const courses = await fetchAllTrainingsForLanding(userId);
    const trainings = await fetchAllTrainingsForLanding(userId);

    return res.status(200).json({
      success: true,
      // courses,
      trainings,
    });

    // console.log(courses);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      // message: "Failed to fetch Trainings.",
      message: "Failed to fetch courses.",
    });
  }
};

/* GET COURSE BY ID - ONLY COURSE */
exports.getOnlyCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId || isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        // message: "Invalid course ID.",
        message: "Invalid course category ID.",
      });
    }

    const course = await getOnlyCourseByIdModel(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        // message: "Course not found.",
        message: "Course category not found.",
      });
    }

    // If this course already has trainings under it, the frontend
    // should render the edit form as fully locked..
    const hasTrainings = await checkCourseHasTrainingsModel(courseId);
    course.has_trainings = hasTrainings;

    return res.status(200).json({
      success: true,
      course,
    });

  } catch (error) {
    console.error("Get Course By ID Error:", error);

    return res.status(500).json({
      success: false,
      // message: "Failed to fetch course.",
      message: "Failed to fetch course category.",
    });
  }
};

/* UPDATE COURSE ONLY */
exports.updateCourseOnly = async (req, res) => {
  try {
    const { courseId } = req.params;

     // Check whether this course already has any trainings
    const hasTrainings =
      await checkCourseHasTrainingsModel(courseId);

    if (hasTrainings) {
      return res.status(400).json({
        success: false,
        message:
          // "This course cannot be edited because trainings already exist under it."
          "This course category cannot be edited because courses already exist under it."
      });
    }

    let {
      course_code,
      course_name,
      course_level,
    } = req.body;

    course_code = course_code?.trim();
    course_name = course_name?.trim();
    course_level = course_level?.trim();

    // ---------------- Validation ----------------

    if (!course_code || !course_name || !course_level) {
      return res.status(400).json({
        success: false,
        // message: "Course information is required."
        message: "Course category information is required."
      });
    }

    if (course_code !== course_code.trim()) {
      return res.status(400).json({
        success: false,
        // message: "Course code cannot start or end with spaces."
        message: "Course category code cannot start or end with spaces."
      });
    }

    if (course_code.length > 10) {
      return res.status(400).json({
        success: false,
        // message: "Course code must not exceed 10 characters."
        message: "Course category code must not exceed 10 characters."
      });
    }

    const courseCodeRegex = /^[a-zA-Z0-9_\s-]+$/;
    const hasAlphanumeric = /[a-zA-Z0-9]/;

    if (!courseCodeRegex.test(course_code)) {
      return res.status(400).json({
        success: false,
        message:
          // "Course code can only contain letters, numbers, spaces, dashes (-), and underscores (_)."
          "Course category code can only contain letters, numbers, spaces, dashes (-), and underscores (_)."
      });
    }

    if (!hasAlphanumeric.test(course_code)) {
      return res.status(400).json({
        success: false,
        message:
          // "Course code must contain at least one alphanumeric character."
          "Course category code must contain at least one alphanumeric character."
      });
    }

    if (course_name.length < 3 || course_name.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          // "Course name must be between 3 and 100 characters."
          "Course category name must be between 3 and 100 characters."
      });
    }

    if (course_level.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          // "Course level must not exceed 100 characters."
          "Course category level must not exceed 100 characters."
      });
    }

    await updateCourseOnlyModel({
      courseId,
      course_code,
      course_name,
      course_level,
      updated_by: req.user.user_id,
    });

    return res.status(200).json({
      success: true,
      // message: "Course updated successfully."
      message: "Course category updated successfully."
    });

  } catch (error) {

    // console.log(error);
    console.log("ERROR:", error);
    console.log("CODE:", error.code);
    console.log("MESSAGE:", error.message);

    if (
      error.code === "ER_DUP_ENTRY" ||
      error.code === "DUPLICATE_ENTRY"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // if (error.code === "ER_DUP_ENTRY" || error.code === "DUPLICATE_ENTRY")
    // {

    //   if (error.message.includes("course_name")) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Course name already exists."
    //     });
    //   }

    //   if (error.message.includes("course_code")) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Course code already exists."
    //     });
    //   }
    // }

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



/* PREVIOUS USED - WHERE COURSE AND TRAINING WERE TOGETHER */
/* GET COURSE BY ID - COURSE, TRAINING, BOOKS, INSTRUCTORS */
// exports.getCourseById = async (req, res) => {

//   try {

//     const { courseId } = req.params;

//     const course = await getCourseByIdModel(courseId);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found."
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       course
//     });

//   } catch (error) {

//     console.log("Get Course By Id Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });

//   }

// };

/* CREATE COURSE - for combined - COURSE, TRAINING, INSTRUCTOR, BOOKS */
// exports.createCourse = async (req, res) => {

//   const connection = await db.getConnection();
//   let uploadedThumbnailPath = "";
//   let courseDir = "";

//   try {
//     await connection.beginTransaction();

//     let { course, training, books, instructors } = req.body;

//     // Parse JSON strings (multipart/form-data)
//     course = typeof course === "string" ? JSON.parse(course) : course;
//     training = typeof training === "string" ? JSON.parse(training) : training;
//     books = typeof books === "string" ? JSON.parse(books) : books;
//     instructors =
//       typeof instructors === "string"
//         ? JSON.parse(instructors)
//         : instructors;

//     console.log(course);
//     console.log(training);
//     console.log(books);
//     console.log(instructors);

//     // ==========================
//     // Course Validation
//     // ==========================

//     if (!course?.code || !course?.name || !course?.level) {
//       return res.status(400).json({
//         success: false,
//         message: "Course information is required."
//       });
//     }

//     if (course.code.length > 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Course code must not exceed 100 characters."
//       });
//     }

//     const courseCodeRegex = /^[a-zA-Z0-9_\s-]+$/;
//     const hasAlphanumeric = /[a-zA-Z0-9]/;
//     if (!courseCodeRegex.test(course.code)) {
//       return res.status(400).json({
//         success: false,
//         message: "Course code can only contain letters, numbers, spaces, dashes (-), and underscores (_)."
//       });
//     }
//     if (!hasAlphanumeric.test(course.code)) {
//       return res.status(400).json({
//         success: false,
//         message: "Course code must contain at least one alphanumeric character."
//       });
//     }

//     if (course.name.length < 3 || course.name.length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "Course name must be between 3 and 255 characters."
//       });
//     }

//     if (course.level.length > 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Course level must not exceed 100 characters."
//       });
//     }



//     // Training Validation
//     if (
//       !training?.title ||
//       !training?.description ||
//       training?.fee == null ||
//       training?.training_duration_hours == null ||
//       !training?.training_mode
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Training information is required."
//       });
//     }

//     if (training.title.length < 3 || training.title.length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "Training title must be between 3 and 255 characters."
//       });
//     }

//     if (training.description.length < 10) {
//       return res.status(400).json({
//         success: false,
//         message: "Training description is too short."
//       });
//     }

//     if (isNaN(training.fee) || Number(training.fee) < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid training fee."
//       });
//     }

//     if (
//       isNaN(training.training_duration_hours) ||
//       Number(training.training_duration_hours) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Duration must be greater than 0."
//       });
//     }

//     const validModes = ["ONLINE", "OFFLINE", "HYBRID"];

//     if (!validModes.includes(training.training_mode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid training mode."
//       });
//     }


//     // Books Validation
//     if (!Array.isArray(books) || books.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one book is required."
//       });
//     }

//     for (const book of books) {
//       if (!book.name) {
//         return res.status(400).json({
//           success: false,
//           message: "Book name is required."
//         });
//       }
//     }

//     // Instructor Validation
//     if (!Array.isArray(instructors) || instructors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select at least one instructor."
//       });
//     }

//     // Thumbnail Validation
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Course thumbnail is required."
//       });
//     }

//     // Database Logic (Next Step)

//     // const { courseId, trainingId } =
//     //   await insertCourse({
//     //     course,
//     //     training,
//     //     created_by: req.user.user_id,
//     //     updated_by: req.user.user_id
//     //   });

//     const courseId = await insertCourse(
//       connection,
//       course,
//       req.user.user_id,
//       req.user.user_id
//     );

//     const trainingId = await insertTraining(
//       connection,
//       courseId,
//       training,
//       req.user.user_id,
//       req.user.user_id
//     );

//     console.log("Course ID:", courseId);
//     console.log("Training ID:", trainingId);

//     let thumbnailPath = "";
//     // let uploadedThumbnailPath = "";
//     // let courseDir = "";

//     if (req.file) {

//       courseDir = path.join(
//         __dirname,
//         `../uploads/courses/${courseId}`
//       );

//       fs.mkdirSync(courseDir, {
//         recursive: true
//       });

//       const newPath = path.join(
//         courseDir,
//         req.file.filename
//       );

//       fs.renameSync(req.file.path, newPath);

//       uploadedThumbnailPath = newPath;

//       thumbnailPath =
//         `/uploads/courses/${courseId}/${req.file.filename}`;

//       await updateTrainingThumbnail(
//         connection,
//         trainingId,
//         thumbnailPath
//       );
//     }


//     await insertTrainingBooks(
//       connection,
//       trainingId,
//       books,
//       req.user.user_id,
//       req.user.user_id
//     );

//     await insertTrainingInstructors(
//       connection,
//       trainingId,
//       instructors,
//       req.user.user_id,
//       req.user.user_id
//     );

//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Course and Training created successfully.",
//       courseId,
//       trainingId
//     });

//   } catch (error) {
//     await connection.rollback();

//     // Delete uploaded thumbnail
//     if (
//       uploadedThumbnailPath &&
//       fs.existsSync(uploadedThumbnailPath)
//     ) {
//       fs.unlinkSync(uploadedThumbnailPath);
//     }

//     // Delete empty course folder
//     if (
//       courseDir &&
//       fs.existsSync(courseDir)
//     ) {
//       const files = fs.readdirSync(courseDir);

//       if (files.length === 0) {
//         fs.rmdirSync(courseDir);
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
//       message: "Server Error"
//     });
//   } finally {
//     connection.release();
//   }
// };

/* UPDATE COURSE - for combined - COURSE, TRAINING, INSTRUCTOR, BOOKS */
// exports.updateCourse = async (req, res) => {

//   const connection = await db.getConnection();

//   let uploadedThumbnailPath = "";
//   let courseDir = "";

//   try {

//     await connection.beginTransaction();

//     const { courseId } = req.params;

//     let { course, training, books, instructors } = req.body;

//     course =
//       typeof course === "string"
//         ? JSON.parse(course)
//         : course;

//     training =
//       typeof training === "string"
//         ? JSON.parse(training)
//         : training;

//     books =
//       typeof books === "string"
//         ? JSON.parse(books)
//         : books;

//     instructors =
//       typeof instructors === "string"
//         ? JSON.parse(instructors)
//         : instructors;

//     console.log(course);
//     console.log(training);
//     console.log(books);
//     console.log(instructors);

//     // ==========================
//     // Course Validation
//     // ==========================

//     if (!course?.code || !course?.name || !course?.level) {
//       return res.status(400).json({
//         success: false,
//         message: "Course information is required."
//       });
//     }

//     if (course.code.length > 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Course code must not exceed 100 characters."
//       });
//     }

//     if (course.name.length < 3 || course.name.length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "Course name must be between 3 and 255 characters."
//       });
//     }

//     if (course.level.length > 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Course level must not exceed 100 characters."
//       });
//     }

//     // Training Validation
//     if (
//       !training?.title ||
//       !training?.description ||
//       training?.fee == null ||
//       training?.training_duration_hours == null ||
//       !training?.training_mode
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Training information is required."
//       });
//     }

//     if (training.title.length < 3 || training.title.length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "Training title must be between 3 and 255 characters."
//       });
//     }

//     if (training.description.length < 10) {
//       return res.status(400).json({
//         success: false,
//         message: "Training description is too short."
//       });
//     }

//     if (isNaN(training.fee) || Number(training.fee) < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid training fee."
//       });
//     }

//     if (
//       isNaN(training.training_duration_hours) ||
//       Number(training.training_duration_hours) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Duration must be greater than 0."
//       });
//     }

//     const validModes = ["ONLINE", "OFFLINE", "HYBRID"];

//     if (!validModes.includes(training.training_mode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid training mode."
//       });
//     }


//     // Books Validation
//     if (!Array.isArray(books) || books.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one book is required."
//       });
//     }

//     for (const book of books) {
//       if (!book.name) {
//         return res.status(400).json({
//           success: false,
//           message: "Book name is required."
//         });
//       }
//     }

//     // Instructor Validation
//     if (!Array.isArray(instructors) || instructors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select at least one instructor."
//       });
//     }

//     await updateCourseModel(
//       connection,
//       courseId,
//       course,
//       req.user.user_id
//     );

//     const trainingId = await getTrainingIdByCourseId(
//       connection,
//       courseId
//     );

//     await updateTrainingModel(
//       connection,
//       trainingId,
//       training,
//       req.user.user_id
//     );

//     if (req.file) {

//       const oldThumbnail = await getTrainingThumbnail(
//         connection,
//         trainingId
//       );

//       // Delete old thumbnail if it exists
//       if (oldThumbnail) {

//         const oldThumbnailPath = path.join(
//           __dirname,
//           "..",
//           oldThumbnail
//         );

//         if (fs.existsSync(oldThumbnailPath)) {
//           fs.unlinkSync(oldThumbnailPath);
//         }
//       }

//       // Create course directory if it doesn't exist
//       courseDir = path.join(
//         __dirname,
//         `../uploads/courses/${courseId}`
//       );

//       fs.mkdirSync(courseDir, {
//         recursive: true
//       });

//       // Move uploaded thumbnail
//       const newPath = path.join(
//         courseDir,
//         req.file.filename
//       );

//       fs.renameSync(
//         req.file.path,
//         newPath
//       );

//       uploadedThumbnailPath = newPath;

//       // Save relative path in database
//       const thumbnailPath =
//         `/uploads/courses/${courseId}/${req.file.filename}`;

//       await updateTrainingThumbnail(
//         connection,
//         trainingId,
//         thumbnailPath
//       );

//     }

//     await deleteTrainingBooks(
//       connection,
//       trainingId
//     );

//     await insertTrainingBooks(
//       connection,
//       trainingId,
//       books,
//       req.user.user_id,
//       req.user.user_id
//     );

//     await deleteTrainingInstructors(
//       connection,
//       trainingId
//     );

//     await insertTrainingInstructors(
//       connection,
//       trainingId,
//       instructors,
//       req.user.user_id,
//       req.user.user_id
//     );

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Course and Training updated successfully."
//     });

//   } catch (error) {

//     await connection.rollback();

//     if (
//       uploadedThumbnailPath &&
//       fs.existsSync(uploadedThumbnailPath)
//     ) {
//       fs.unlinkSync(uploadedThumbnailPath);
//     }

//     if (error.message === "Course code already exists.") {
//       return res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }

//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   } finally {
//     connection.release();
//   }
// };









