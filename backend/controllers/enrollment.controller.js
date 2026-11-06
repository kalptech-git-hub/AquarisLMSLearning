const db = require("../models/db");
//const fs = require("fs");
//const path = require("path");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

const {
    insertEnrollment,
    getEnrollmentsModel,
    checkEnrollmentExists,
    checkTrainingExists,
    checkUserActive,
    updateEnrollmentStatusModel,
    getAllStudentsEnrollmentsModel,
    getEnrollmentByIdModel,
    getEnrolledTrainingingDetailsModel,
    getStudentsByTrainingIdModel,
    getTrainingCompletionPercentage,
    getEnrollmentDetailsForNotification,
    getInstructorStudentEnrollmentsModel
} = require("../models/enrollment.model");

const { updateUserPhoto } = require("../models/user.model");

const {
    getActiveAdmins
} = require("../models/notification.model");

const {
    sendNotification,
    emitNotification,
    createNotificationRecord
} = require("../services/notification.service");

const transporter = require("../utils/transporter");

const {
  enrollmentApprovedEmailTemplate,
  enrollmentRejectedEmailTemplate
} = require("../utils/emailTemplate.js");

/* STUDENT */
/* CREATE ENROLLMENT */
// exports.createEnrollment = async (req, res) => {

//     console.log(req.user);

//     let connection;

//     try {
//       connection = await db.getConnection();

//       await connection.beginTransaction();

//       const trainingId = Number(req.body.training_id);

//       const { enroll_postal_address, enroll_qualification } = req.body;

// <<<<<<< Updated upstream
//       if (!trainingId) {
//         return res.status(400).json({
//           success: false,
//           message: "Training ID is required.",
// =======
//         const {
//             enroll_postal_address,
//             enroll_qualification
//         } = req.body;

//         if (!trainingId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training ID is required."
//             });
//         }

//         const userActive = await checkUserActive(
//             connection,
//             req.user.user_id
//         );

//         if (!userActive) {
//             return res.status(403).json({
//                 success: false,
//                 message: "User is inactive."
//             });
//         }

//         const training = await checkTrainingExists(
//             connection,
//             trainingId
//         );

//         if (!training) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Training not found."
//             });
//         }

//         const alreadyEnrolled =
//             await checkEnrollmentExists(
//                 connection,
//                 req.user.user_id,
//                 trainingId
//             );

//         if (alreadyEnrolled) {

//             return res.status(400).json({
//                 success: false,
//                 message: "Already enrolled."
//             });

//         }

//         const enrollId = await insertEnrollment(
//             connection,
//             {
//                 user_id: req.user.user_id,
//                 training_id: trainingId,
//                 enroll_postal_address,
//                 enroll_qualification,
//                 created_by: req.user.user_id,
//                 updated_by: req.user.user_id
//             }
//         );

//         if (req.file) {
//             const userDir = path.join(
//                 __dirname,
//                 `../uploads/users/${req.user.user_id}`
//             );

//             fs.mkdirSync(userDir, { recursive: true });

//             const destination = path.join(userDir, req.file.filename);
//             fs.renameSync(req.file.path, destination);

//             await updateUserPhoto(
//                 connection,
//                 req.user.user_id,
//                 `/uploads/users/${req.user.user_id}/${req.file.filename}`
//             );
//         }

//         const pendingNotifications = [];

//         // -----------------------------------------
//         // FIND ADMINS
//         // -----------------------------------------

//         const admins = await getActiveAdmins(
//             connection
//         );

//         // -----------------------------------------
//         // IO
//         // -----------------------------------------

//         // const io = req.app.get("io");

//         // -----------------------------------------
//         // CREATE ADMIN NOTIFICATIONS
//         // -----------------------------------------

//         // for (const admin of admins) {

//         //     await sendNotification(
//         //         connection,
//         //         io,
//         //         {
//         //             user_id: admin.user_id,

//         //             notification_type: "ENROLLMENT_CREATED",

//         //             notification_title:
//         //                 "New Enrollment Request",

//         //             notification_message:
//         //                 `${req.user.user_name || "A student"} has submitted a new enrollment request.`,

//         //             enroll_id: enrollId,

//         //             training_id: trainingId
//         //         }
//         //     );

//         // }

//         for (const admin of admins) {

//             const notification =
//                 await createNotificationRecord(
//                     connection,
//                     {
//                         user_id: admin.user_id,

//                         notification_type:
//                             "ENROLLMENT_CREATED",

//                         title:
//                             "New Enrollment Request",

//                         message:
//                             `${req.user.user_full_name || "A student"} has submitted a new enrollment request.`,

//                         enroll_id: enrollId,

//                         training_id: trainingId
//                     }
//                 );

//             pendingNotifications.push(notification);
//         }

//         await connection.commit();

//         const io = req.app.get("io");

//         for (const notification of pendingNotifications) {

//             emitNotification(
//                 io,
//                 notification
//             );

//         }

//         return res.status(201).json({
//             success: true,
//             message: "Enrollment created successfully.",
//             enrollId
// >>>>>>> Stashed changes
//         });
//       }

//       const userActive = await checkUserActive(connection, req.user.user_id);

//       if (!userActive) {
//         return res.status(403).json({
//           success: false,
//           message: "User is inactive.",
//         });
//       }

//       const training = await checkTrainingExists(connection, trainingId);

//       if (!training) {
//         return res.status(404).json({
//           success: false,
//           message: "Training not found.",
//         });
//       }

//       // Check whether training has already started
//       if (
//         training.training_start_date &&
//         new Date(training.training_start_date) <= new Date()
//       ) {

//         await connection.rollback();

//         return res.status(400).json({
//           success: false,
//           message:
//             "Enrollment is closed because this training has already started.",
//         });
//       }

//       const alreadyEnrolled = await checkEnrollmentExists(
//         connection,
//         req.user.user_id,
//         trainingId,
//       );

//       if (alreadyEnrolled) {
//         return res.status(400).json({
//           success: false,
//           message: "Already enrolled.",
//         });
//       }

//       const enrollId = await insertEnrollment(connection, {
//         user_id: req.user.user_id,
//         training_id: trainingId,
//         enroll_postal_address,
//         enroll_qualification,
//         created_by: req.user.user_id,
//         updated_by: req.user.user_id,
//       });

//       if (req.file) {
//         const userDir = path.join(
//           __dirname,
//           `../uploads/users/${req.user.user_id}`,
//         );

//         fs.mkdirSync(userDir, { recursive: true });

//         const destination = path.join(userDir, req.file.filename);
//         fs.renameSync(req.file.path, destination);

//         await updateUserPhoto(
//           connection,
//           req.user.user_id,
//           `/uploads/users/${req.user.user_id}/${req.file.filename}`,
//         );
//       }

//       await connection.commit();

//       return res.status(201).json({
//         success: true,
//         message: "Enrollment created successfully.",
//         enrollId,
//       });
//     }
//     catch (error) {

//         if (connection)
//             await connection.rollback();

//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });

//     }
//     finally {

//         if (connection)
//             connection.release();

//     }

// };

/* */
// exports.createEnrollment = async (req, res) => {

//     console.log(req.user);

//     let connection;
//     let uploadedProfileCloudId = null;
//     let transactionCommitted = false;

//     try {

//         connection = await db.getConnection();

//         await connection.beginTransaction();

//         const trainingId = Number(req.body.training_id);

//         const {
//             enroll_postal_address,
//             enroll_qualification
//         } = req.body;


//         // -----------------------------------------
//         // VALIDATE TRAINING ID
//         // -----------------------------------------

//         if (!trainingId) {

//             await connection.rollback();

//             return res.status(400).json({
//                 success: false,
//                 message: "Training ID is required."
//             });

//         }


//         // -----------------------------------------
//         // CHECK USER ACTIVE
//         // -----------------------------------------

// <<<<<<< Updated upstream
//       const enrollId = await insertEnrollment(connection, {
//         user_id: req.user.user_id,
//         training_id: trainingId,
//         enroll_postal_address,
//         enroll_qualification,
//         created_by: req.user.user_id,
//         updated_by: req.user.user_id,
//       });

//     //   if (req.file) {
//     //     const userDir = path.join(
//     //       __dirname,
//     //       `../uploads/users/${req.user.user_id}`,
//     //     );

//     //     fs.mkdirSync(userDir, { recursive: true });

//     //     const destination = path.join(userDir, req.file.filename);
//     //     fs.renameSync(req.file.path, destination);

//     //     await updateUserPhoto(
//     //       connection,
//     //       req.user.user_id,
//     //       `/uploads/users/${req.user.user_id}/${req.file.filename}`,
//     //     );
//     //   }

//     if (req.file) {
//       const uploadResult = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           {
//             resource_type: "image",
//             folder: "user_profiles",
//           },
//           (error, result) => {
//             if (error) {
//               return reject(error);
//             }

//             resolve(result);
//           },
//         );

//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//       });

//       uploadedProfileCloudId = uploadResult.public_id;

//       await updateUserPhoto(
//         connection,
//         req.user.user_id,
//         uploadResult.secure_url,
//         uploadResult.public_id,
//       );
//     }

//       await connection.commit();
//       transactionCommitted = true;
// =======
//         const userActive = await checkUserActive(
//             connection,
//             req.user.user_id
//         );

//         if (!userActive) {

//             await connection.rollback();

//             return res.status(403).json({
//                 success: false,
//                 message: "User is inactive."
//             });

//         }


//         // -----------------------------------------
//         // CHECK TRAINING EXISTS
//         // -----------------------------------------

//         const training = await checkTrainingExists(
//             connection,
//             trainingId
//         );

//         if (!training) {

//             await connection.rollback();

//             return res.status(404).json({
//                 success: false,
//                 message: "Training not found."
//             });

//         }


//         // -----------------------------------------
//         // CHECK WHETHER TRAINING HAS ALREADY STARTED
//         // -----------------------------------------

//         if (
//             training.training_start_date &&
//             new Date(training.training_start_date) <= new Date()
//         ) {

//             await connection.rollback();

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Enrollment is closed because this training has already started."
//             });

//         }


//         // -----------------------------------------
//         // CHECK EXISTING ENROLLMENT
//         // -----------------------------------------

//         const alreadyEnrolled = await checkEnrollmentExists(
//             connection,
//             req.user.user_id,
//             trainingId
//         );

//         if (alreadyEnrolled) {

//             await connection.rollback();

//             return res.status(400).json({
//                 success: false,
//                 message: "Already enrolled."
//             });

//         }


//         // -----------------------------------------
//         // CREATE ENROLLMENT
//         // -----------------------------------------

//         const enrollId = await insertEnrollment(
//             connection,
//             {
//                 user_id: req.user.user_id,
//                 training_id: trainingId,
//                 enroll_postal_address,
//                 enroll_qualification,
//                 created_by: req.user.user_id,
//                 updated_by: req.user.user_id
//             }
//         );


//         // -----------------------------------------
//         // UPDATE USER PHOTO
//         // -----------------------------------------

//         if (req.file) {

//             const userDir = path.join(
//                 __dirname,
//                 `../uploads/users/${req.user.user_id}`
//             );

//             fs.mkdirSync(userDir, {
//                 recursive: true
//             });

//             const destination = path.join(
//                 userDir,
//                 req.file.filename
//             );

//             fs.renameSync(
//                 req.file.path,
//                 destination
//             );

//             await updateUserPhoto(
//                 connection,
//                 req.user.user_id,
//                 `/uploads/users/${req.user.user_id}/${req.file.filename}`
//             );

//         }


//         // -----------------------------------------
//         // FIND ACTIVE ADMINS
//         // -----------------------------------------

//         const admins = await getActiveAdmins(
//             connection
//         );


//         // -----------------------------------------
//         // STORE NOTIFICATIONS
//         // -----------------------------------------

//         const pendingNotifications = [];

//         for (const admin of admins) {

//             const notification =
//                 await createNotificationRecord(
//                     connection,
//                     {
//                         user_id: admin.user_id,

//                         notification_type:
//                             "ENROLLMENT_CREATED",

//                         title:
//                             "New Enrollment Request",

//                         message:
//                             `${req.user.user_full_name || "A student"} has submitted a new enrollment request for "${training.training_title}".`,

//                         enroll_id: enrollId,

//                         training_id: trainingId
//                     }
//                 );

//             pendingNotifications.push(notification);

//         }


//         // -----------------------------------------
//         // COMMIT TRANSACTION
//         // -----------------------------------------

//         await connection.commit();


//         // -----------------------------------------
//         // EMIT REAL-TIME NOTIFICATIONS
//         // -----------------------------------------

//         const io = req.app.get("io");

//         for (const notification of pendingNotifications) {

//             emitNotification(
//                 io,
//                 notification
//             );

//         }


//         // -----------------------------------------
//         // RESPONSE
//         // -----------------------------------------

//         return res.status(201).json({
//             success: true,
//             message: "Enrollment created successfully.",
//             enrollId
//         });
// >>>>>>> Stashed changes

//     }
//     catch (error) {

// <<<<<<< Updated upstream
//         // if (connection)
//         //     await connection.rollback();
// =======
//         if (connection) {
//             await connection.rollback();
//         }
// >>>>>>> Stashed changes

//         // console.log(error);

//         // return res.status(500).json({
//         //     success: false,
//         //     message: "Server Error"
//         // });

//             if (uploadedProfileCloudId && !transactionCommitted) {
//               try {
//                 await cloudinary.uploader.destroy(uploadedProfileCloudId, {
//                   resource_type: "image",
//                 });
//               } catch (cleanupError) {
//                 console.log(
//                   "Create Enrollment Cloudinary Cleanup Error:",
//                   cleanupError,
//                 );
//               }
//             }

//             if (connection && !transactionCommitted) {
//               await connection.rollback();
//             }

//             console.log(error);

//             return res.status(500).json({
//               success: false,
//               message: "Server Error",
//             });

//     }
//     finally {

//         if (connection) {
//             connection.release();
//         }

//     }

// };

exports.createEnrollment = async (req, res) => {

    console.log(req.user);

    let connection;
    let uploadedProfileCloudId = null;
    let transactionCommitted = false;

    try {
        connection = await db.getConnection();

        await connection.beginTransaction();

        const trainingId = Number(req.body.training_id);

        const { enroll_postal_address, enroll_qualification } = req.body;

        // -----------------------------------------
        // VALIDATE TRAINING ID
        // -----------------------------------------

        if (!trainingId) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                // message: "Training ID is required."
                message: "Course ID is required.",
            });
        }

        // -----------------------------------------
        // CHECK USER ACTIVE
        // -----------------------------------------

        const userActive = await checkUserActive(connection, req.user.user_id);

        if (!userActive) {
            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "User is inactive.",
            });
        }

        // -----------------------------------------
        // CHECK TRAINING EXISTS
        // -----------------------------------------

        const training = await checkTrainingExists(connection, trainingId);

        if (!training) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                // message: "Training not found."
                message: "Course not found.",
            });
        }

        // -----------------------------------------
        // CHECK ENROLLMENT STATUS
        // -----------------------------------------

        if (training.publish_status !== "PUBLISHED") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Enrollment is not open for this course.",
            });
        }

        if (training.enrollment_status !== "OPEN") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Enrollment is currently closed for this course.",
            });
        }
        // -----------------------------------------
        // CHECK WHETHER TRAINING HAS ALREADY STARTED
        // -----------------------------------------

        if (
            training.training_start_date &&
            new Date(training.training_start_date) <= new Date()
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    // "Enrollment is closed because this training has already started."
                    "Enrollment is closed because this course has already started.",
            });
        }

        // -----------------------------------------
        // CHECK EXISTING ENROLLMENT
        // -----------------------------------------

        const alreadyEnrolled = await checkEnrollmentExists(
            connection,
            req.user.user_id,
            trainingId,
        );

        if (alreadyEnrolled) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Already enrolled.",
            });
        }

        // -----------------------------------------
        // CREATE ENROLLMENT
        // -----------------------------------------

        const enrollId = await insertEnrollment(connection, {
            user_id: req.user.user_id,
            training_id: trainingId,
            enroll_postal_address,
            enroll_qualification,
            created_by: req.user.user_id,
            updated_by: req.user.user_id,
        });

        // -----------------------------------------
        // UPDATE USER PROFILE PHOTO
        // -----------------------------------------

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: "user_profiles",
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(result);
                    },
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            uploadedProfileCloudId = uploadResult.public_id;

            await updateUserPhoto(
                connection,
                req.user.user_id,
                uploadResult.secure_url,
                uploadResult.public_id,
            );
        }

        // -----------------------------------------
        // FIND ACTIVE ADMINS
        // -----------------------------------------

        const admins = await getActiveAdmins(connection);

        // -----------------------------------------
        // STORE NOTIFICATIONS
        // -----------------------------------------

        const pendingNotifications = [];

        for (const admin of admins) {
            const notification = await createNotificationRecord(connection, {
                user_id: admin.user_id,

                notification_type: "ENROLLMENT_CREATED",

                title: "New Enrollment Request",

                message:
                    // `${req.user.user_full_name || "A student"} has submitted a new enrollment request for "${training.training_title}".`,
                    // `${req.user.user_full_name || "A student"} has submitted a new enrollment request for "${training.training_title || training.title}".`,
                    `${req.user.user_full_name || "A student"} has submitted a new enrollment request for course "${training.training_title || training.title}".`,

                enroll_id: enrollId,

                training_id: trainingId,
            });

            pendingNotifications.push(notification);
        }

        // -----------------------------------------
        // COMMIT TRANSACTION
        // -----------------------------------------

        await connection.commit();

        transactionCommitted = true;

        // -----------------------------------------
        // EMIT REAL-TIME NOTIFICATIONS
        // -----------------------------------------

        const io = req.app.get("io");

        for (const notification of pendingNotifications) {
            emitNotification(io, notification);
        }

        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        return res.status(201).json({
            success: true,
            message: "Enrollment created successfully.",
            enrollId,
        });
    }
    catch (error) {

        console.log(error);


        // -----------------------------------------
        // ROLLBACK DATABASE TRANSACTION
        // -----------------------------------------

        if (connection && !transactionCommitted) {

            try {
                await connection.rollback();
            }
            catch (rollbackError) {
                console.log(
                    "Create Enrollment Rollback Error:",
                    rollbackError
                );
            }

        }


        // -----------------------------------------
        // CLEANUP CLOUDINARY UPLOAD
        // -----------------------------------------

        if (
            uploadedProfileCloudId &&
            !transactionCommitted
        ) {

            try {

                await cloudinary.uploader.destroy(
                    uploadedProfileCloudId,
                    {
                        resource_type: "image"
                    }
                );

            }
            catch (cleanupError) {

                console.log(
                    "Create Enrollment Cloudinary Cleanup Error:",
                    cleanupError
                );

            }

        }


        return res.status(500).json({
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

/* GET STUDENT ENROLLMENTS - FOR STUDENT DASHBOARD */
exports.getEnrollments = async (req, res) => {

    try {

        const enrollments =
            await getEnrollmentsModel(
                req.user.user_id
            );

        // NEW — compute weighted overall progress across all courses
        const totalLessons = enrollments.reduce(
            (sum, e) => sum + Number(e.total_lessons || 0),
            0
        );

        const completedLessons = enrollments.reduce(
            (sum, e) => sum + Number(e.completed_lessons || 0),
            0
        );

        const overallProgressPercent =
            totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;
        // END NEW

        return res.status(200).json({
            success: true,
            enrollments,
            overview: {                    // NEW key, enrollments unchanged
                totalLessons,
                completedLessons,
                overallProgressPercent
            }
        });

    } catch (error) {

        console.log("Get Enrollment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// exports.getEnrollments = async (req, res) => {

//     try {

//         const userId = req.user.user_id;

//         const enrollments =
//             await getEnrollmentsModel(userId);

//         for (const enrollment of enrollments) {

//             const progress =
//                 await getTrainingCompletionPercentage(
//                     userId,
//                     enrollment.training_id
//                 );

//             enrollment.progress_percent =
//                 progress.progressPercent;

//         }

//         return res.status(200).json({
//             success: true,
//             enrollments
//         });

//     } catch (error) {

//         console.log("Get Enrollment Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });

//     }

// };

/* GET ENROLLED COURSE ALL DETAILS - TRAINING, COURSE NAME, INSTRUCTOR, BOOKS, TOPICS, LESSON.
Calling it training cause- student has enrolled in the training not course. */
exports.getEnrolledTrainingingDetails = async (
    req,
    res
) => {
    try {
        const { trainingId } = req.params;
        const userId = req.user.user_id;

        const trainingDetails =
            await getEnrolledTrainingingDetailsModel(
                trainingId,
                userId
            );

        return res.status(200).json({
            success: true,
            training: trainingDetails,
        });

    } catch (error) {

        console.log(
            "Get Training Details Error:",
            error
        );

        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            success: false,
            errorType: error.errorType || "SERVER_ERROR",
            message:
                error.message ||
                "Failed to fetch course details",
            trainingTitle: error.trainingTitle || null,
        });
    }
};

// Students on instructor -> Manage courses
exports.getStudentsByTrainingId = async (req, res) => {
    try {
        const { trainingId } = req.params;

        if (!trainingId || isNaN(trainingId)) {
            return res.status(400).json({
                success: false,
                // message: "Valid training ID is required."
                message: "Valid course ID is required."
            });
        }

        const students =
            await getStudentsByTrainingIdModel(trainingId);

        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch students."
        });
    }
};

/* GET STUDENT ENROLLMENTS FOR THE LOGGED-IN INSTRUCTOR  */
exports.getInstructorStudentEnrollments = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // find this user's instructor_id
        const [instructorRows] = await db.query(
            `
            SELECT instructor_id
            FROM tbl_instructors
            WHERE user_id = ?
            AND CAST(is_active AS UNSIGNED) = 1
            LIMIT 1
            `,
            [userId]
        );

        if (instructorRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instructor profile not found."
            });
        }

        const instructorId = instructorRows[0].instructor_id;

        const enrollments =
            await getInstructorStudentEnrollmentsModel(instructorId);

        return res.status(200).json({
            success: true,
            enrollments
        });

    } catch (error) {
        console.log("Get Instructor Student Enrollments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


/* ADMIN */
/* GET ALL STUDENT ENROLLMENTS - ADMIN */
exports.getAllStudentsEnrollments = async (req, res) => {

    try {

        const enrollments =
            await getAllStudentsEnrollmentsModel();

        return res.status(200).json({
            success: true,
            enrollments
        });

    } catch (error) {

        console.log("Get All Enrollments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* GET ENROLLMENT BY ID - ADMIN */
exports.getEnrollmentById = async (req, res) => {

    try {

        const enrollId = Number(req.params.enrollId);

        if (!enrollId) {
            return res.status(400).json({
                success: false,
                message: "Enrollment ID is required."
            });
        }

        const enrollment = await getEnrollmentByIdModel(enrollId);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });
        }

        return res.status(200).json({
            success: true,
            enrollment
        });

    } catch (error) {

        console.log("Get Enrollment By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* UPDATE STATUS - APPROVED/REJECT */
exports.updateEnrollmentStatus = async (req, res) => {

    let connection;
    let transactionCommitted = false;

    try {

        connection = await db.getConnection();
        await connection.beginTransaction();

        const enrollId = Number(req.params.enrollId);

        const { enroll_status } = req.body;

        if (!enrollId) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Enrollment ID is required."
            });
        }

        const allowedStatus = ["A", "R"];

        if (!allowedStatus.includes(enroll_status)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Enrollment status must be A or R."
            });
        }

        // -----------------------------------------
        // GET ENROLLMENT DETAILS
        // -----------------------------------------

        const enrollment =
            await getEnrollmentDetailsForNotification(
                connection,
                enrollId
            );

        if (!enrollment) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });

        }

        const updated = await updateEnrollmentStatusModel(
            connection,
            enrollId,
            enroll_status,
            req.user.user_id
        );

        if (!updated) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Enrollment not found."
            });
        }

        // -----------------------------------------
        // CREATE STUDENT NOTIFICATION
        // -----------------------------------------

        let notificationType;
        let notificationTitle;
        let notificationMessage;

        if (enroll_status === "A") {

            notificationType = "ENROLLMENT_APPROVED";
            notificationTitle = "Enrollment Approved";

            notificationMessage =
                `Your enrollment request for course "${enrollment.training_title}" has been approved.`;

        } else {

            notificationType = "ENROLLMENT_REJECTED";
            notificationTitle = "Enrollment Rejected";

            notificationMessage =
                `Your enrollment request for course "${enrollment.training_title}" has been rejected.`;

        }

        const notification = await createNotificationRecord(
            connection,
            {
                user_id: enrollment.user_id,

                notification_type: notificationType,

                title: notificationTitle,

                message: notificationMessage,

                enroll_id: enrollment.enroll_id,

                training_id: enrollment.training_id
            }
        );

        // -----------------------------------------
        // COMMIT TRANSACTION
        // -----------------------------------------

        await connection.commit();

        transactionCommitted = true;

        // -----------------------------------------
        // EMIT REAL-TIME NOTIFICATION
        // -----------------------------------------

        const io = req.app.get("io");

        emitNotification(io, notification);

        // -----------------------------------------
        // SEND EMAIL NOTIFICATION
        // -----------------------------------------

        try {

            if (enroll_status === "A") {

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: enrollment.user_email,
                    subject: `Enrollment Approved - ${enrollment.training_title}`,
                    html: enrollmentApprovedEmailTemplate({
                        recipientName: enrollment.user_full_name,
                        trainingTitle: enrollment.training_title
                    })
                });

                console.log(
                    `Enrollment approval email sent to ${enrollment.user_email}`
                );

            } else if (enroll_status === "R") {

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: enrollment.user_email,
                    subject: `Enrollment Rejected - ${enrollment.training_title}`,
                    html: enrollmentRejectedEmailTemplate({
                        recipientName: enrollment.user_full_name,
                        trainingTitle: enrollment.training_title
                    })
                });

                console.log(
                    `Enrollment rejection email sent to ${enrollment.user_email}`
                );

            }

        } catch (emailError) {

            console.log(
                `Failed to send enrollment status email to ${enrollment.user_email}:`,
                emailError.message
            );

        }

        return res.status(200).json({
            success: true,
            // message: "Enrollment status updated successfully."
            message:
                enroll_status === "A"
                    ? "Enrollment approved successfully."
                    : "Enrollment rejected successfully."
        });

    } catch (error) {

        console.log("Update Enrollment Status Error:", error);

        // -----------------------------------------
        // ROLLBACK
        // -----------------------------------------

        if (connection && !transactionCommitted) {

            try {
                await connection.rollback();
            }
            catch (rollbackError) {

                console.log(
                    "Update Enrollment Status Rollback Error:",
                    rollbackError
                );

            }

        }

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        if (connection)
            connection.release();

    }

};