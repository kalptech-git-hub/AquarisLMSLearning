const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const db = require("../models/db");
//const fs = require("fs");
//const path = require("path");

const {
    checkCourseExists,
    checkTrainingTitleExists,
    insertTraining,
    getTrainingByIdModel,
    getCourseIdByTrainingId,
    updateCourseModel,
    updateTrainingModel,
    getTrainingThumbnail,
    updateTrainingThumbnail,
    deleteTrainingBooks,
    insertTrainingBooks,
    deleteTrainingInstructors,
    insertTrainingInstructors,
    updateTrainingCourse,
    updateTrainingStatusModel,
    fetchAllTrainingsForTrainingTable,
    checkTrainingHasLessonModel,
    publishTrainingModel,
    unpublishTrainingModel,
    startEnrollmentModel,
    stopEnrollmentModel
} = require("../models/training.model");

const {
    createNotificationRecord,
    emitNotification
} = require("../services/notification.service");

/* GET TRAINING BY ID - FOR EDIT - PRELOAD DATA */
exports.getTrainingById = async (req, res) => {

    try {

        const { trainingId } = req.params;

        const training = await getTrainingByIdModel(trainingId);

        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        return res.status(200).json({
            success: true,
            training
        });

    } catch (error) {

       //console.log("Get Training By Id Error:", error);
        console.log("Get Course By Id Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* CREATE TRAINING ONLY */
// exports.createTraining = async (req, res) => {

//     let connection;
//     let trainingThumbnailCloudFileId = null;
//     let transactionCommitted = false;

//     try {
//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         let {
//             course_id,
//             // training_title,
//             // training_description,
//             // training_duration_hours,
//             // training_mode,
//             // training_exam_name,
//             // training_exam_frequency,
//             // training_fee,
//             training,
//             books,
//             instructors
//         } = req.body;

//         course_id = Number(course_id);

//         training =
//             typeof training === "string"
//                 ? JSON.parse(training)
//                 : training;

//         books =
//             typeof books === "string"
//                 ? JSON.parse(books)
//                 : books || [];

//         instructors =
//             typeof instructors === "string"
//                 ? JSON.parse(instructors)
//                 : instructors || [];
//          // training_title = training_title?.trim();
//         // training_description = training_description?.trim();
//         // training_exam_name = training_exam_name?.trim();
//         // training_exam_frequency = training_exam_frequency?.trim();
//         const normalizeText = (value) => {
//             return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
//         };

//         const training_title = normalizeText(training.title);
//         const training_description = training.description?.trim();
//         const training_duration_hours = training.training_duration_hours;
//         const training_mode = training.training_mode;
//         const training_exam_name = normalizeText(training.examName);
//         const training_exam_frequency = normalizeText(training.examFrequency);
//         const training_fee = training.fee;

//         books = (books || []).map(b => ({
//             ...b,
//             name: normalizeText(b.name),
//             chapters: normalizeText(b.chapters)
//         }));

//         const training_start_date = (training.training_start_date || training.startDate) 
//             ? new Date(training.training_start_date || training.startDate) 
//             : null;
//         const training_end_date = (training.training_end_date || training.endDate) 
//             ? new Date(training.training_end_date || training.endDate) 
//             : null;

//        // const training_start_date = training.training_start_date || null;

//        // const training_end_date = training.training_end_date || null;

//         //---------------- Validation ----------------//

//         if (!course_id) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Course ID is required."
//             });
//         }

//         if (!training_title) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training title is required."
//             });
//         }

//         if (
//             training_title.length < 3 ||
//             training_title.length > 255
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training title must be between 3 and 255 characters."
//             });
//         }

//         if (
//             training_description &&
//             training_description.length > 2000
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training description must not exceed 2000 characters."
//             });
//         }

//         if (
//             !training_duration_hours ||
//             isNaN(training_duration_hours) ||
//             Number(training_duration_hours) <= 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid training duration is required."
//             });
//         }

//         const validModes = [
//             "ONLINE",
//             "OFFLINE",
//             "HYBRID"
//         ];

//         if (!validModes.includes(training_mode)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid training mode."
//             });
//         }

//         if (!training_start_date || isNaN(training_start_date.getTime())) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid training start date is required."
//             });
//         }

//         if (!training_end_date || isNaN(training_end_date.getTime())) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Valid training end date is required."
//             });
//         }

//         if (training_end_date < training_start_date) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training end date cannot be before start date."
//             });
//         }

//         if (
//             training_fee == null ||
//             isNaN(training_fee) ||
//             Number(training_fee) < 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid training fee."
//             });
//         }

//         //---------------- Course Exists ----------------//

//         const course = await checkCourseExists(
//             connection,
//             course_id
//         );

//         if (!course) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Course not found."
//             });
//         }

//         //---------------- Duplicate Training ----------------//

//         const existingTraining =
//             await checkTrainingTitleExists(
//                 connection,
//                 course_id,
//                 training_title
//             );

//         if (existingTraining) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training already exists for this course."
//             });
//         }

//         let trainingThumbnailUrl = null;
//         let trainingThumbnailCloudId = null;

//         //---------------- Thumbnail ----------------//

//         // if (req.file) {
//         //     courseDir = path.join(
//         //         __dirname,
//         //         `../uploads/courses/${course_id}`
//         //     );

//         //     fs.mkdirSync(courseDir, {
//         //         recursive: true
//         //     });

//         //     const newPath = path.join(
//         //         courseDir,
//         //         req.file.filename
//         //     );

//         //     fs.renameSync(
//         //         req.file.path,
//         //         newPath
//         //     );

//         //     uploadedThumbnailPath = newPath;

//         //     const thumbnailPath =
//         //         `/uploads/courses/${course_id}/${req.file.filename}`;

//         //     await updateTrainingThumbnail(
//         //         connection,
//         //         trainingId,
//         //         thumbnailPath
//         //     );
//         // }

//         if (req.file) {
//             const uploadResult = await new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                     {
//                         resource_type: "image",
//                         folder: "training_thumbnails"
//                     },
//                     (error, result) => {
//                         if (error) {
//                             return reject(error);
//                         }
//                         resolve(result);
//                     }
//                 );

//                 streamifier.createReadStream(req.file.buffer).pipe(stream);
//             });

//             trainingThumbnailUrl = uploadResult.secure_url;
//             trainingThumbnailCloudId = uploadResult.public_id;
//             trainingThumbnailCloudFileId = uploadResult.public_id;
//         }

//         //---------------- Insert Training ----------------//

//         const trainingId =
//             await insertTraining(
//                 connection,
//                 {
//                     course_id,
//                     training_title,
//                     training_description,
//                     training_duration_hours,
//                     training_mode,
//                     training_exam_name,
//                     training_exam_frequency,
//                     training_fee,
//                     training_start_date,
//                     training_end_date,
//                     training_thumbnail: trainingThumbnailUrl,
//                     training_thumbnail_cloud_id: trainingThumbnailCloudId,
//                     created_by: req.user.user_id,
//                     updated_by: req.user.user_id
//                 }
//             );

//         //---------------- Books ----------------//

//         if (books.length > 0) {

//             const normalizedBooks =
//                 books.map(book =>
//                     book.name.trim().toLowerCase()
//                 );

//             const duplicateBooks =
//                 normalizedBooks.filter(
//                     (book, index) =>
//                         normalizedBooks.indexOf(book) !== index
//                 );

//             if (duplicateBooks.length > 0) {

//                 return res.status(400).json({
//                     success: false,
//                     message:
//                         "Duplicate book names are not allowed."
//                 });

//             }

//             await insertTrainingBooks(
//                 connection,
//                 trainingId,
//                 books,
//                 req.user.user_id,
//                 req.user.user_id
//             );

//         }

//         //---------------- Instructors ----------------//

//         if (instructors.length > 0) {

//             await insertTrainingInstructors(
//                 connection,
//                 trainingId,
//                 instructors,
//                 req.user.user_id,
//                 req.user.user_id
//             );

//         }

//         await connection.commit();
//         transactionCommitted = true;

//         return res.status(201).json({
//             success: true,
//             message: "Training created successfully.",
//             trainingId
//         });

//     }
//     catch (error) {

//         if (trainingThumbnailCloudFileId && !transactionCommitted) {
//             try {
//                 await cloudinary.uploader.destroy(
//                     trainingThumbnailCloudFileId,
//                     { resource_type: "image" }
//                 );
//             } catch (cleanupError) {
//                 console.log("Create Training Cloudinary Cleanup Error:", cleanupError);
//             }
//         }

//         if (connection && !transactionCommitted) {
//             await connection.rollback();
//         }

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

exports.createTraining = async (req, res) => {

    let connection;
    let trainingThumbnailCloudFileId = null;
    let transactionCommitted = false;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        let {
            course_id,
            // training_title,
            // training_description,
            // training_duration_hours,
            // training_mode,
            // training_exam_name,
            // training_exam_frequency,
            // training_fee,
            training,
            books,
            instructors
        } = req.body;

        course_id = Number(course_id);

        training =
            typeof training === "string"
                ? JSON.parse(training)
                : training;

        books =
            typeof books === "string"
                ? JSON.parse(books)
                : books || [];

        instructors =
            typeof instructors === "string"
                ? JSON.parse(instructors)
                : instructors || [];
        // training_title = training_title?.trim();
        // training_description = training_description?.trim();
        // training_exam_name = training_exam_name?.trim();
        // training_exam_frequency = training_exam_frequency?.trim();
        const normalizeText = (value) => {
            return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
        };

        const training_title = normalizeText(training.title);
        const training_description = training.description?.trim();
        const training_duration_hours = training.training_duration_hours;
        const training_mode = training.training_mode;
        const training_exam_name = normalizeText(training.examName);
        const training_exam_frequency = normalizeText(training.examFrequency);
        const training_fee = training.fee;

        books = (books || []).map(b => ({
            ...b,
            name: normalizeText(b.name),
            chapters: normalizeText(b.chapters)
        }));

        const training_start_date = (training.training_start_date || training.startDate)
            ? new Date(training.training_start_date || training.startDate)
            : null;
        const training_end_date = (training.training_end_date || training.endDate)
            ? new Date(training.training_end_date || training.endDate)
            : null;

        // const training_start_date = training.training_start_date || null;

        // const training_end_date = training.training_end_date || null;

        //---------------- Validation ----------------//

        if (!course_id) {
            return res.status(400).json({
                success: false,
                //  message: "Training category ID is required."
                message: "Course category ID is required."
            });
        }

        if (!training_title) {
            return res.status(400).json({
                success: false,
            //  message: "Training title is required."
                message: "Course title is required."
            });
        }

        if (
            training_title.length < 3 ||
            training_title.length > 255
        ) {
            return res.status(400).json({
                success: false,
               // message: "Training title must be between 3 and 255 characters."
                message: "Course title must be between 3 and 255 characters."
            });
        }

        if (
            training_description &&
            training_description.length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Course description must not exceed 2000 characters."
            });
        }

        if (
            !training_duration_hours ||
            isNaN(training_duration_hours) ||
            Number(training_duration_hours) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid course duration is required."
            });
        }

        const validModes = [
            "ONLINE",
            "OFFLINE",
            "HYBRID"
        ];

        if (!validModes.includes(training_mode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course mode."
            });
        }

        if (!training_start_date || isNaN(training_start_date.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Valid course start date is required."
            });
        }

        if (!training_end_date || isNaN(training_end_date.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Valid course end date is required."
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDateOnly = new Date(training_start_date);
        startDateOnly.setHours(0, 0, 0, 0);

    // Start date validation is only required for courses that have not started yet.
        if (startDateOnly <= today) {
            return res.status(400).json({
                success: false,
                message: "Course start date cannot be before today."
            });
        }

        if (training_end_date <= training_start_date) {
            return res.status(400).json({
                success: false,
                message: "Course end date must be after start date."
            });
        }

        if (
            training_fee == null ||
            isNaN(training_fee) ||
            Number(training_fee) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid course fee."
            });
        }

        //---------------- Course Exists ----------------//

        const course = await checkCourseExists(
            connection,
            course_id
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                // message: "Course not found."
                message: "Course category not found."
            });
        }

        //---------------- Duplicate Training ----------------//

        const existingTraining =
            await checkTrainingTitleExists(
                connection,
                course_id,
                training_title
            );

        if (existingTraining) {
            return res.status(400).json({
                success: false,
                message: "Course already exists for this course category."
            });
        }

        let trainingThumbnailUrl = null;
        let trainingThumbnailCloudId = null;

        //---------------- Thumbnail ----------------//

        // if (req.file) {
        //     courseDir = path.join(
        //         __dirname,
        //         `../uploads/courses/${course_id}`
        //     );

        //     fs.mkdirSync(courseDir, {
        //         recursive: true
        //     });

        //     const newPath = path.join(
        //         courseDir,
        //         req.file.filename
        //     );

        //     fs.renameSync(
        //         req.file.path,
        //         newPath
        //     );

        //     uploadedThumbnailPath = newPath;

        //     const thumbnailPath =
        //         `/uploads/courses/${course_id}/${req.file.filename}`;

        //     await updateTrainingThumbnail(
        //         connection,
        //         trainingId,
        //         thumbnailPath
        //     );
        // }

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: "training_thumbnails"
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

            trainingThumbnailUrl = uploadResult.secure_url;
            trainingThumbnailCloudId = uploadResult.public_id;
            trainingThumbnailCloudFileId = uploadResult.public_id;
        }

        //---------------- Insert Training ----------------//

        const trainingId =
            await insertTraining(
                connection,
                {
                    course_id,
                    training_title,
                    training_description,
                    training_duration_hours,
                    training_mode,
                    training_exam_name,
                    training_exam_frequency,
                    training_fee,
                    training_start_date,
                    training_end_date,
                    training_thumbnail: trainingThumbnailUrl,
                    training_thumbnail_cloud_id: trainingThumbnailCloudId,
                    created_by: req.user.user_id,
                    updated_by: req.user.user_id
                }
            );

        //---------------- Books ----------------//

        if (books.length > 0) {

            const normalizedBooks =
                books.map(book =>
                    book.name.trim().toLowerCase()
                );

            const duplicateBooks =
                normalizedBooks.filter(
                    (book, index) =>
                        normalizedBooks.indexOf(book) !== index
                );

            if (duplicateBooks.length > 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Duplicate book names are not allowed."
                });

            }

            await insertTrainingBooks(
                connection,
                trainingId,
                books,
                req.user.user_id,
                req.user.user_id
            );

        }

        //---------------- Instructors ----------------//

        const notificationsToEmit = [];

        if (instructors.length > 0) {

            await insertTrainingInstructors(
                connection,
                trainingId,
                instructors,
                req.user.user_id,
                req.user.user_id
            );

            //---------------- Instructor Notifications ----------------//


            const [assignedInstructors] =
                await connection.execute(
                    `
                    SELECT
                        i.user_id
                    FROM tbl_training_instructors ti
                    INNER JOIN tbl_instructors i
                        ON ti.instructor_id = i.instructor_id
                    WHERE ti.training_id = ?
                `,
                    [trainingId]
                );


            for (const instructor of assignedInstructors) {

                const notification =
                    await createNotificationRecord(
                        connection,
                        {
                            user_id:
                                instructor.user_id,

                            notification_type:
                                "training_assigned",

                            title:
                                "New Course Assigned",

                            message:
                                `You have been assigned to teach "${training_title}".`,

                            training_id:
                                trainingId,

                            live_session_id: null,

                            enroll_id: null
                        }
                    );


                notificationsToEmit.push(
                    notification
                );

            }


        }

        //---------------- Commit Transaction ----------------//

        await connection.commit();
        transactionCommitted = true;

        //---------------- Emit Real-Time Instructor Notifications ----------------//

        const io = req.app.get("io");

        for (const notification of notificationsToEmit) {

            emitNotification(
                io,
                notification
            );

        }

        return res.status(201).json({
            success: true,
            //message: "Training created successfully.",
            message: "Course created successfully.",
            trainingId
        });

    }
    catch (error) {

        if (trainingThumbnailCloudFileId && !transactionCommitted) {
            try {
                await cloudinary.uploader.destroy(
                    trainingThumbnailCloudFileId,
                    { resource_type: "image" }
                );
            } catch (cleanupError) {
               // console.log("Create Training Cloudinary Cleanup Error:", cleanupError);
                console.log("Create Course Cloudinary Cleanup Error:", cleanupError);
            }
        }

        if (connection && !transactionCommitted) {
            await connection.rollback();
        }

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
    finally {

        if (connection)
            connection.release();

    }

};


/* This is route is to fetch all the trainings, 
only on the training table, which is on admin dashboard */
exports.getAllTrainingsForTrainingTable = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;

    const trainings = await fetchAllTrainingsForTrainingTable(userId);

    return res.status(200).json({
      success: true,
      trainings,
    });

    // console.log(trainings);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      // message: "Failed to fetch Trainings.",
      message: "Failed to fetch courses.",
    });
  }
};

/* UPDATE TRAINING ONLY */
// exports.updateTraining = async (req, res) => {

//     let connection;
//     let uploadedThumbnailCloudFileId = null;
//     let oldThumbnailCloudFileId = null;
//     let transactionCommitted = false;

//     try {
//         connection = await db.getConnection();
//         await connection.beginTransaction();

//         const { trainingId } = req.params;

//         const existingThumbnail = await getTrainingThumbnail(
//             connection,
//             trainingId
//         );

//         let trainingThumbnailUrl =
//             existingThumbnail?.training_thumbnail || null;
//         let trainingThumbnailCloudId =
//             existingThumbnail?.training_thumbnail_cloud_id || null;

//         oldThumbnailCloudFileId = trainingThumbnailCloudId;

//         let {
//             // course,
//             course_id,
//             training, books, instructors } = req.body;

//         console.log(req.body);
//         console.log(req.file);

//         // course =
//         //     typeof course === "string"
//         //         ? JSON.parse(course)
//         //         : course;

//         training =
//             typeof training === "string"
//                 ? JSON.parse(training)
//                 : training;

//         books =
//             typeof books === "string"
//                 ? JSON.parse(books)
//                 : books;

//         instructors =
//             typeof instructors === "string"
//                 ? JSON.parse(instructors)
//                 : instructors;

//         // console.log(course);
//         console.log(training);
//         console.log(books);
//         console.log(instructors);

//         // ==========================
//         // Course Validation
//         // ==========================

//         // if (!course?.code || !course?.name || !course?.level) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "Course information is required."
//         //     });
//         // }

//         // if (course.code.length > 100) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "Course code must not exceed 100 characters."
//         //     });
//         // }

//         // if (course.name.length < 3 || course.name.length > 255) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "Course name must be between 3 and 255 characters."
//         //     });
//         // }

//         // if (course.level.length > 100) {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "Course level must not exceed 100 characters."
//         //     });
//         // }

//         const normalizeText = (value) => {
//             return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
//         };

//         if (training) {
//             training = {
//                 ...training,
//                 title: normalizeText(training.title),
//                 description: training.description?.trim(),
//                 examName: normalizeText(training.examName),
//                 examFrequency: normalizeText(training.examFrequency)
//             };
//         }

//         books = (books || []).map(b => ({
//             ...b,
//             name: normalizeText(b.name),
//             chapters: normalizeText(b.chapters)
//         }));

//         // Training Validation
//         if (
//             !training?.title ||
//             !training?.description ||
//             training?.fee == null ||
//             training?.training_duration_hours == null ||
//             !training?.training_mode
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training information is required."
//             });
//         }

//         if (training.title.length < 3 || training.title.length > 255) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training title must be between 3 and 255 characters."
//             });
//         }

//         if (training.description.length < 10) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training description is too short."
//             });
//         }

//         if (isNaN(training.fee) || Number(training.fee) < 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid training fee."
//             });
//         }

//         if (
//             isNaN(training.training_duration_hours) ||
//             Number(training.training_duration_hours) <= 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Duration must be greater than 0."
//             });
//         }

//         const validModes = ["ONLINE", "OFFLINE", "HYBRID"];

//         if (!validModes.includes(training.training_mode)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid training mode."
//             });
//         }

//         if (!training.training_start_date || !training.training_end_date) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training start and end dates are required."
//             });
//         }

//         if (new Date(training.training_end_date) < new Date(training.training_start_date)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Training end date cannot be before start date."
//             });
//         }

//         // Books Validation
//         if (!Array.isArray(books) || books.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "At least one book is required."
//             });
//         }

//         for (const book of books) {
//             if (!book.name) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Book name is required."
//                 });
//             }
//         }

//         // Instructor Validation
//         if (!Array.isArray(instructors) || instructors.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please select at least one instructor."
//             });
//         }

//         // await updateCourseModel(
//         //   connection,
//         //   courseId,
//         //   course,
//         //   req.user.user_id
//         // );

//         // const trainingId = await getTrainingIdByCourseId(
//         //   connection,
//         //   courseId
//         // );

//         // const courseId =
//         //     await getCourseIdByTrainingId(
//         //         connection,
//         //         trainingId
//         //     );

//         // await updateCourseModel(
//         //     connection,
//         //     courseId,
//         //     course,
//         //     req.user.user_id
//         // );

//         let currentCourseId =
//             await getCourseIdByTrainingId(
//                 connection,
//                 trainingId
//             );

//         const finalCourseId =
//             course_id || currentCourseId;

//         if (course_id) {
//             await updateTrainingCourse(
//                 connection,
//                 trainingId,
//                 course_id,
//                 req.user.user_id
//             );
//         }

//         // if (req.file) {
//         //     const oldThumbnail = await getTrainingThumbnail(
//         //         connection,
//         //         trainingId
//         //     );

//         //     if (oldThumbnail) {
//         //         const oldThumbnailPath = path.join(
//         //             __dirname,
//         //             "..",
//         //             oldThumbnail.training_thumbnail
//         //         );

//         //         if (fs.existsSync(oldThumbnailPath)) {
//         //             fs.unlinkSync(oldThumbnailPath);
//         //         }
//         //     }

//         //     courseDir = path.join(
//         //         __dirname,
//         //         `../uploads/courses/${finalCourseId}`
//         //     );

//         //     fs.mkdirSync(courseDir, {
//         //         recursive: true
//         //     });

//         //     const newPath = path.join(
//         //         courseDir,
//         //         req.file.filename
//         //     );

//         //     fs.renameSync(
//         //         req.file.path,
//         //         newPath
//         //     );

//         //     uploadedThumbnailPath = newPath;

//         //     const thumbnailPath =
//         //         `/uploads/courses/${finalCourseId}/${req.file.filename}`;

//         //     await updateTrainingThumbnail(
//         //         connection,
//         //         trainingId,
//         //         thumbnailPath
//         //     );
//         // }

//         if (req.file) {
//             const uploadResult = await new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                     {
//                         resource_type: "image",
//                         folder: "training_thumbnails"
//                     },
//                     (error, result) => {
//                         if (error) {
//                             return reject(error);
//                         }
//                         resolve(result);
//                     }
//                 );

//                 streamifier.createReadStream(req.file.buffer).pipe(stream);
//             });

//             uploadedThumbnailCloudFileId = uploadResult.public_id;
//             trainingThumbnailUrl = uploadResult.secure_url;
//             trainingThumbnailCloudId = uploadResult.public_id;
//         }

//         await updateTrainingModel(
//             connection,
//             trainingId,
//             {
//                 ...training,
//                 training_thumbnail: trainingThumbnailUrl,
//                 training_thumbnail_cloud_id: trainingThumbnailCloudId
//             },
//             req.user.user_id
//         );

//         const normalizedBooks = books.map(book =>
//             book.name.trim().toLowerCase()
//         );

//         const duplicateBooks = normalizedBooks.filter(
//             (book, index) => normalizedBooks.indexOf(book) !== index
//         );

//         if (duplicateBooks.length > 0) {
//             await connection.rollback();

//             return res.status(400).json({
//                 success: false,
//                 message: "Duplicate book names are not allowed."
//             });
//         }

//         await deleteTrainingBooks(
//             connection,
//             trainingId
//         );

//         await insertTrainingBooks(
//             connection,
//             trainingId,
//             books,
//             req.user.user_id,
//             req.user.user_id
//         );

//         await deleteTrainingInstructors(
//             connection,
//             trainingId
//         );

//         await insertTrainingInstructors(
//             connection,
//             trainingId,
//             instructors,
//             req.user.user_id,
//             req.user.user_id
//         );

//         await connection.commit();
//         transactionCommitted = true;

//         if (
//             uploadedThumbnailCloudFileId &&
//             oldThumbnailCloudFileId &&
//             uploadedThumbnailCloudFileId !== oldThumbnailCloudFileId
//         ) {
//             try {
//                 await cloudinary.uploader.destroy(
//                     oldThumbnailCloudFileId,
//                     { resource_type: "image" }
//                 );
//             } catch (cleanupError) {
//                 console.log("Update Training Cloudinary Cleanup Error:", cleanupError);
//             }
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Course and Training updated successfully."
//         });

//     } catch (error) {

//         if (uploadedThumbnailCloudFileId && !transactionCommitted) {
//             try {
//                 await cloudinary.uploader.destroy(
//                     uploadedThumbnailCloudFileId,
//                     { resource_type: "image" }
//                 );
//             } catch (cleanupError) {
//                 console.log("Update Training Cloudinary Cleanup Error:", cleanupError);
//             }
//         }

//         if (connection && !transactionCommitted) {
//             await connection.rollback();
//         }

//         if (error.message === "Course code already exists.") {
//             return res.status(400).json({
//                 success: false,
//                 message: error.message
//             });
//         }

//         if (error.code === "ER_DUP_ENTRY") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Duplicate book names are not allowed for the same training."
//             });
//         }

//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });
//     } finally {
//         if (connection) {
//             connection.release();
//         }
//     }
// };

exports.updateTraining = async (req, res) => {

    let connection;
    let uploadedThumbnailCloudFileId = null;
    let oldThumbnailCloudFileId = null;
    let transactionCommitted = false;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const { trainingId } = req.params;

      const existingTraining = await getTrainingByIdModel(trainingId);

      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          //  message: "Training not found."
          message: "Course not found.",
        });
      }

      const isPublished = existingTraining.publish_status === "PUBLISHED";

      if (existingTraining.training_status === "COMPLETED") {
        return res.status(400).json({
          success: false,
          //  message: "A completed training cannot be modified."
          message: "A completed course cannot be modified.",
        });
      }

      const existingStartDateOnly = existingTraining.training_start_date
        ? new Date(existingTraining.training_start_date)
        : null;

      let trainingHasStarted = false;

      if (existingStartDateOnly) {
        const todayOnly = new Date();
        todayOnly.setHours(0, 0, 0, 0);
        existingStartDateOnly.setHours(0, 0, 0, 0);
        trainingHasStarted = existingStartDateOnly <= todayOnly;
      }

      const existingThumbnail = await getTrainingThumbnail(
        connection,
        trainingId,
      );

      let trainingThumbnailUrl = existingThumbnail?.training_thumbnail || null;
      let trainingThumbnailCloudId =
        existingThumbnail?.training_thumbnail_cloud_id || null;

      oldThumbnailCloudFileId = trainingThumbnailCloudId;

      let {
        // course,
        course_id,
        training,
        books,
        instructors,
      } = req.body;

      // course =
      //     typeof course === "string"
      //         ? JSON.parse(course)
      //         : course;

      training = typeof training === "string" ? JSON.parse(training) : training;

      books = typeof books === "string" ? JSON.parse(books) : books;

      instructors =
        typeof instructors === "string" ? JSON.parse(instructors) : instructors;

      // ==========================
      // Published Course Restriction
      // ==========================
      const normalizeDateValue = (value) => {
        if (value === null || value === undefined || value === "") {
          return null;
        }

        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
          return value.trim();
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
          return String(value).trim();
        }

        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      };

      const sameValue = (newValue, oldValue, type = "string") => {
        if (newValue === undefined) {
          return true;
        }

        if (type === "date") {
          return normalizeDateValue(newValue) === normalizeDateValue(oldValue);
        }

        if (type === "number") {
          return Number(newValue) === Number(oldValue);
        }

        return String(newValue ?? "").trim() === String(oldValue ?? "").trim();
      };

      if (isPublished) {
        const restrictedFieldChecks = [
          {
            newValue: training?.title,
            oldValue: existingTraining.training_title,
            type: "string",
          },
          {
            newValue: training?.description,
            oldValue: existingTraining.training_description,
            type: "string",
          },
          {
            newValue: training?.examName,
            oldValue: existingTraining.training_exam_name,
            type: "string",
          },
          {
            newValue: training?.examFrequency,
            oldValue: existingTraining.training_exam_frequency,
            type: "string",
          },
          {
            newValue: training?.fee,
            oldValue: existingTraining.training_fee,
            type: "number",
          },
          {
            newValue: training?.training_start_date,
            oldValue: existingTraining.training_start_date,
            type: "date",
          },
          {
            newValue: training?.training_duration_hours,
            oldValue: existingTraining.training_duration_hours,
            type: "number",
          },
          
        ];

        const hasRestrictedChanges = restrictedFieldChecks.some(
          ({ newValue, oldValue, type }) =>
            !sameValue(newValue, oldValue, type),
        );

        const courseCategoryChanged =
          course_id !== undefined &&
          String(course_id) !== String(existingTraining.course_id);

        const thumbnailChanged = !!req.file;

        if (hasRestrictedChanges || courseCategoryChanged || thumbnailChanged) {
          return res.status(400).json({
            success: false,
            message:
              "A published course cannot be modified. Only end date, books and instructors can be updated.",
          });
        }
      }

      // console.log(course);

      // ==========================
      // Course Validation
      // ==========================

      // if (!course?.code || !course?.name || !course?.level) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "Course information is required."
      //     });
      // }

      // if (course.code.length > 100) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "Course code must not exceed 100 characters."
      //     });
      // }

      // if (course.name.length < 3 || course.name.length > 255) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "Course name must be between 3 and 255 characters."
      //     });
      // }

      // if (course.level.length > 100) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "Course level must not exceed 100 characters."
      //     });
      // }

      const normalizeText = (value) => {
        return typeof value === "string"
          ? value.replace(/\s+/g, " ").trim()
          : value;
      };

      if (training) {
        training = {
          ...training,
          title: normalizeText(training.title),
          description: training.description?.trim(),
          examName: normalizeText(training.examName),
          examFrequency: normalizeText(training.examFrequency),
        };
      }

      books = (books || []).map((b) => ({
        ...b,
        name: normalizeText(b.name),
        chapters: normalizeText(b.chapters),
      }));

      // Training Validation
      if (
        !training?.title ||
        !training?.description ||
        training?.fee == null ||
        training?.training_duration_hours == null ||
        !training?.training_mode
      ) {
        return res.status(400).json({
          success: false,
          //message: "Training information is required."
          message: "Course information is required.",
        });
      }

      if (training.title.length < 3 || training.title.length > 255) {
        return res.status(400).json({
          success: false,
          // message: "Training title must be between 3 and 255 characters."
          message: "Course title must be between 3 and 255 characters.",
        });
      }

      if (training.description.length < 10) {
        return res.status(400).json({
          success: false,
          //    message: "Training description is too short."
          message: "Course description is too short.",
        });
      }

      if (isNaN(training.fee) || Number(training.fee) < 0) {
        return res.status(400).json({
          success: false,
          //  message: "Invalid training fee."
          message: "Invalid course fee.",
        });
      }

      if (
        isNaN(training.training_duration_hours) ||
        Number(training.training_duration_hours) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Duration must be greater than 0.",
        });
      }

      const validModes = ["ONLINE", "OFFLINE", "HYBRID"];

      if (!validModes.includes(training.training_mode)) {
        return res.status(400).json({
          success: false,
          //   message: "Invalid training mode."
          message: "Invalid course mode.",
        });
      }

      if (!training.training_start_date || !training.training_end_date) {
        return res.status(400).json({
          success: false,
          //     message: "Training start and end dates are required."
          message: "Course start and end dates are required.",
        });
      }

      let canEditPastStartDate = false;

      if (trainingHasStarted && !isPublished) {
        const [[{ approvedEnrollmentCount }]] = await connection.query(
          `
              SELECT COUNT(*) AS approvedEnrollmentCount
              FROM tbl_enrollments
              WHERE training_id = ?
              AND enroll_status = 'A'
          `,
          [trainingId]
        );

        canEditPastStartDate = Number(approvedEnrollmentCount) === 0;
      }

      if (trainingHasStarted && !canEditPastStartDate) {
        // Start date is locked once training has begun 
        training.training_start_date = existingTraining.training_start_date;
      }

      const validStatuses = ["ACTIVE", "COMPLETED"];

      if (
        training.training_status &&
        !validStatuses.includes(training.training_status)
      ) {
        return res.status(400).json({
          success: false,
          //message: "Invalid training status."
          message: "Invalid course status.",
        });
      }

      if (training.training_status === "COMPLETED" && !isPublished) {
  return res.status(400).json({
    success: false,
    message: "Only published courses can be marked as completed.",
  });
}

//  a course that hasn't started yet can't be "completed".
if (training.training_status === "COMPLETED") {
  const referenceStartDate = existingTraining.training_start_date
    ? new Date(existingTraining.training_start_date)
    : null;

  if (referenceStartDate) {
    referenceStartDate.setHours(0, 0, 0, 0);
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);

    if (referenceStartDate > todayCheck) {
      return res.status(400).json({
        success: false,
        message: "This course hasn't started yet and cannot be marked as completed.",
      });
    }
  }
}


      // normalize is_active to 0/1
      training.is_active = training.is_active ? 1 : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(`${training.training_start_date}T00:00:00+05:30`);
      startDate.setHours(0, 0, 0, 0);

      if (!trainingHasStarted && startDate <= today) {
        return res.status(400).json({
          success: false,
          //  message: "Training start date cannot be before today."
          message: "Course start date cannot be before today.",
        });
      }

      const trainingStartDate = new Date(
        `${training.training_start_date}T00:00:00+05:30`,
      );

      const trainingEndDate = new Date(
        `${training.training_end_date}T00:00:00+05:30`,
      );
      if (trainingEndDate <= trainingStartDate) {
        return res.status(400).json({
          success: false,
          //  message: "Training end date must be after start date."
          message: "Course end date must be after start date.",
        });
      }

      // Books Validation
      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one book is required.",
        });
      }

      for (const book of books) {
        if (!book.name) {
          return res.status(400).json({
            success: false,
            message: "Book name is required.",
          });
        }
      }

      // Instructor Validation
      if (!Array.isArray(instructors) || instructors.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one instructor.",
        });
      }

      // await updateCourseModel(
      //   connection,
      //   courseId,
      //   course,
      //   req.user.user_id
      // );

      // const trainingId = await getTrainingIdByCourseId(
      //   connection,
      //   courseId
      // );

      // const courseId =
      //     await getCourseIdByTrainingId(
      //         connection,
      //         trainingId
      //     );

      // await updateCourseModel(
      //     connection,
      //     courseId,
      //     course,
      //     req.user.user_id
      // );

    //   let currentCourseId = await getCourseIdByTrainingId(
    //     connection,
    //     trainingId,
    //   );

   //   const finalCourseId = course_id || currentCourseId;

      if (course_id) {
        await updateTrainingCourse(
          connection,
          trainingId,
          course_id,
          req.user.user_id,
        );
      }

      // if (req.file) {
      //     const oldThumbnail = await getTrainingThumbnail(
      //         connection,
      //         trainingId
      //     );

      //     if (oldThumbnail) {
      //         const oldThumbnailPath = path.join(
      //             __dirname,
      //             "..",
      //             oldThumbnail.training_thumbnail
      //         );

      //         if (fs.existsSync(oldThumbnailPath)) {
      //             fs.unlinkSync(oldThumbnailPath);
      //         }
      //     }

      //     courseDir = path.join(
      //         __dirname,
      //         `../uploads/courses/${finalCourseId}`
      //     );

      //     fs.mkdirSync(courseDir, {
      //         recursive: true
      //     });

      //     const newPath = path.join(
      //         courseDir,
      //         req.file.filename
      //     );

      //     fs.renameSync(
      //         req.file.path,
      //         newPath
      //     );

      //     uploadedThumbnailPath = newPath;

      //     const thumbnailPath =
      //         `/uploads/courses/${finalCourseId}/${req.file.filename}`;

      //     await updateTrainingThumbnail(
      //         connection,
      //         trainingId,
      //         thumbnailPath
      //     );
      // }

      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "training_thumbnails",
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

        uploadedThumbnailCloudFileId = uploadResult.public_id;
        trainingThumbnailUrl = uploadResult.secure_url;
        trainingThumbnailCloudId = uploadResult.public_id;
      }

      await updateTrainingModel(
        connection,
        trainingId,
        {
          ...training,
          training_thumbnail: trainingThumbnailUrl,
          training_thumbnail_cloud_id: trainingThumbnailCloudId,
        },
        req.user.user_id,
      );

      const normalizedBooks = books.map((book) =>
        book.name.trim().toLowerCase(),
      );

      const duplicateBooks = normalizedBooks.filter(
        (book, index) => normalizedBooks.indexOf(book) !== index,
      );

      if (duplicateBooks.length > 0) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Duplicate book names are not allowed.",
        });
      }

      await deleteTrainingBooks(connection, trainingId);

      await insertTrainingBooks(
        connection,
        trainingId,
        books,
        req.user.user_id,
        req.user.user_id,
      );

      // Get currently assigned instructors BEFORE replacing them
      const [oldInstructorRows] = await connection.execute(
        `
                SELECT instructor_id
                FROM tbl_training_instructors
                WHERE training_id = ?
                AND is_active = 1
            `,
        [trainingId],
      );

      const oldInstructorIds = oldInstructorRows.map((row) =>
        Number(row.instructor_id),
      );

      /* New Instructor Selection */
      const newInstructorIds = instructors.map((instructorId) =>
        Number(instructorId),
      );

      /* Find Newly Assigned Instructors */
      const newlyAssignedInstructorIds = newInstructorIds.filter(
        (instructorId) => !oldInstructorIds.includes(instructorId),
      );

      await deleteTrainingInstructors(connection, trainingId);

      await insertTrainingInstructors(
        connection,
        trainingId,
        instructors,
        req.user.user_id,
        req.user.user_id,
      );

      /* Create Notifications */
      const notificationsToEmit = [];

      if (newlyAssignedInstructorIds.length > 0) {
        const placeholders = newlyAssignedInstructorIds
          .map(() => "?")
          .join(",");

        const [newInstructors] = await connection.execute(
          `
                SELECT
                    i.instructor_id,
                    i.user_id
                FROM tbl_instructors i
                WHERE i.instructor_id IN (${placeholders})
            `,
          newlyAssignedInstructorIds,
        );

        for (const instructor of newInstructors) {
          const notification = await createNotificationRecord(connection, {
            user_id: instructor.user_id,

            notification_type: "training_assigned",

            title:
              //  "New Training Assigned",
              "New Course Assigned",

            message: `You have been assigned to teach "${training.title}".`,

            training_id: Number(trainingId),

            live_session_id: null,

            enroll_id: null,
          });

          notificationsToEmit.push(notification);
        }
      }

      /* Commit Transaction */
      await connection.commit();
      transactionCommitted = true;

      /* Emit Real-Time Notifications */
      const io = req.app.get("io");

      for (const notification of notificationsToEmit) {
        emitNotification(io, notification);
      }

      if (
        uploadedThumbnailCloudFileId &&
        oldThumbnailCloudFileId &&
        uploadedThumbnailCloudFileId !== oldThumbnailCloudFileId
      ) {
        try {
          await cloudinary.uploader.destroy(oldThumbnailCloudFileId, {
            resource_type: "image",
          });
        } catch (cleanupError) {
          // console.log("Update Training Cloudinary Cleanup Error:", cleanupError);
          console.log("Update Course Cloudinary Cleanup Error:", cleanupError);
        }
      }

      return res.status(200).json({
        success: true,
        //message: "Course and Training updated successfully."
        message: "Course Category and Course updated successfully.",
      });
    } catch (error) {

        if (uploadedThumbnailCloudFileId && !transactionCommitted) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedThumbnailCloudFileId,
                    { resource_type: "image" }
                );
            } catch (cleanupError) {
               // console.log("Update Training Cloudinary Cleanup Error:", cleanupError);
                console.log("Update Course Cloudinary Cleanup Error:", cleanupError);
            }
        }

        if (connection && !transactionCommitted) {
            await connection.rollback();
        }

        if (error.message === "Course categorycode already exists.") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                success: false,
               // message: "Duplicate book names are not allowed for the same training."
               message: "Duplicate book names are not allowed for the same course."
            });
        }

        console.log(error);

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



/* UPDATE TRAINING STATUS */
exports.updateTrainingStatus = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        const trainingId = Number(req.params.trainingId);
        const { training_status } = req.body;

        if (!trainingId) {
            return res.status(400).json({
                success: false,
             //   message: "Training ID is required."
             message: "Course ID is required."
            });
        }

        const allowedStatus = [
            "ACTIVE",
            "COMPLETED"
        ];

        if (!allowedStatus.includes(training_status)) {
            return res.status(400).json({
                success: false,
                //message: "Invalid training status."
                message: "Invalid course status."
            });
        }

        if (training_status === "COMPLETED") {
    const existingTraining = await getTrainingByIdModel(trainingId);

    if (!existingTraining) {
        return res.status(404).json({
            success: false,
            message: "Course not found."
        });
    }

    if (existingTraining.publish_status !== "PUBLISHED") {
        return res.status(400).json({
            success: false,
            message: "Only published courses can be marked as completed."
        });
    }

    //— same start-date guard as updateTraining
    if (existingTraining.training_start_date) {
        const referenceStartDate = new Date(existingTraining.training_start_date);
        referenceStartDate.setHours(0, 0, 0, 0);
        const todayCheck = new Date();
        todayCheck.setHours(0, 0, 0, 0);

        if (referenceStartDate > todayCheck) {
            return res.status(400).json({
                success: false,
                message: "This course hasn't started yet and cannot be marked as completed."
            });
        }
    }
}

        const result = await updateTrainingStatusModel(
            connection,
            trainingId,
            training_status,
            req.user.user_id
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
               // message: "Training not found."
                message: "Course not found."
            });
        }

        return res.status(200).json({
            success: true,
            //message: `Training marked as ${training_status}.`
            message: `Course marked as ${training_status}.`
        });

    } catch (error) {

        console.log(
           // "Update Training Status Error:",
           "Update Course Status Error:",
            error
        );

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
{/* was:
exports.publishTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;

        // Check whether at least one lesson exists
        const canPublish = await checkTrainingHasLessonModel(trainingId);

        if (!canPublish) {
            return res.status(400).json({
                success: false,
                message: "Cannot publish course. Add at least one lesson first."
            });
        }

        // Publish training
        await publishTrainingModel(trainingId);

        return res.status(200).json({
            success: true,
            message: "Course published successfully."
        });

    } catch (error) {
        console.error("Publish course error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to publish course."
        });
    }
};
*/}

exports.publishTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;

        // Check whether at least one lesson exists
        const canPublish = await checkTrainingHasLessonModel(trainingId);

        if (!canPublish) {
            return res.status(400).json({
                success: false,
                message: "Cannot publish course. Add at least one lesson first."
            });
        }

       
        const training = await getTrainingByIdModel(trainingId);

        if (!training) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        if (training.training_start_date) {
            const startDateOnly = new Date(training.training_start_date);
            startDateOnly.setHours(0, 0, 0, 0);

            const todayOnly = new Date();
            todayOnly.setHours(0, 0, 0, 0);

            if (startDateOnly <= todayOnly) {
                return res.status(400).json({
                    success: false,
                    message: "This course's start date has already passed. Please update the start date before publishing — once published, the start date cannot be edited."
                });
            }
        }

        // Publish training
        await publishTrainingModel(trainingId);

        return res.status(200).json({
            success: true,
            message: "Course published successfully."
        });

    } catch (error) {
        console.error("Publish course error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to publish course."
        });
    }
};

exports.unpublishTraining = async (req, res) => {
    try {
        const { trainingId } = req.params;

        await unpublishTrainingModel(trainingId);

        return res.status(200).json({
            success: true,
            message: "Course unpublished successfully."
        });

    } catch (error) {
        console.error("Unpublish course error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to unpublish course."
        });
    }
};

// START ENROLLMENT
exports.startEnrollment = async (req, res) => {
    try {
        const { trainingId } = req.params;

        const training = await getTrainingByIdModel(trainingId);

        if (!training) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        if (training.publish_status !== "PUBLISHED") {
            return res.status(400).json({
                message: "Only published courses can have enrollment opened."
            });
        }

        const now = new Date();
        const startDate = new Date(training.training_start_date);

        if (now >= startDate) {
            return res.status(400).json({
                message: "Enrollment cannot be opened after the training has started."
            });
        }

        await startEnrollmentModel(trainingId);

        return res.status(200).json({
            message: "Enrollment opened successfully."
        });

    } catch (error) {
        console.error("Start enrollment error:", error);

        return res.status(500).json({
            message: "Failed to open enrollment.",
            error: error.message
        });
    }
};


// STOP ENROLLMENT
exports.stopEnrollment = async (req, res) => {
    try {
        const { trainingId } = req.params;

        const training = await getTrainingByIdModel(trainingId);

        if (!training) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        if (training.publish_status !== "PUBLISHED") {
            return res.status(400).json({
                message: "Only published courses can have enrollment stopped."
            });
        }

        await stopEnrollmentModel(trainingId);

        return res.status(200).json({
            message: "Enrollment stopped successfully."
        });

    } catch (error) {
        console.error("Stop enrollment error:", error);

        return res.status(500).json({
            message: "Failed to stop enrollment.",
            error: error.message
        });
    }
};