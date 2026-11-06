const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const db = require("../models/db");
const fs = require("fs");

const {
    fetchLessonsByTopic,
    checkTopicExists,
    checkDuplicateLesson,
    getNextLessonOrder,
    insertLesson,
    insertLessonResource,
    getLessonById,
    getLessonByIdForEdit,
    getLessonResourceByLessonId,
    updateLessonResource,
    checkDuplicateLessonForUpdate,
    updateLesson,
    deleteLesson,
    reorderLessonDisplayOrder,
    getLessonResourceByLessonIdModel,
    deleteLessonResource,
    deleteQuizByLessonId
} = require("../models/lesson.model");

const {
    createQuiz: createQuizController,
    upsertQuizForLesson,
    //getQuizByLessonId
} = require("./quiz.controller");

const {
    getQuizByLessonId,
     getQuizQuestionsByQuizId,
    getQuestionOptionsByQuestionId
} = require("../models/quiz.model");

/* GET LESSONS BY TOPIC */
exports.getLessonsByTopic = async (req, res) => {

    try {

        const { topicId } = req.params;

        const lessons = await fetchLessonsByTopic(topicId);

        return res.status(200).json({
            success: true,
            lessons
        });

    } catch (error) {

        console.log("Get Lessons Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* GET LESSON BY ID FOR EDIT */
exports.getLessonById = async (req, res) => {

    let connection;

    try {

        const lessonId = Number(req.params.lessonId);

        if (!lessonId || isNaN(lessonId)) {

            return res.status(400).json({
                success: false,
                message: "Valid lesson ID is required."
            });

        }

        connection = await db.getConnection();

        const lesson = await getLessonByIdForEdit(connection, lessonId);

        if (!lesson) {

            return res.status(404).json({
                success: false,
                message: "Lesson not found."
            });

        }

        const response = {
            success: true,
            lesson
        };

        if (lesson.lesson_content_type === "text" || lesson.lesson_content_type === "file") {

            const resource = await getLessonResourceByLessonId(connection, lessonId);

            response.resource = resource ? {
                resource_id: resource.resource_id,
                resource_title: resource.resource_title,
                resource_type: resource.resource_type,
                resource_url: resource.resource_url,
                resource_cloud_file_id: resource.resource_cloud_file_id
            } : null;

        } else if (lesson.lesson_content_type === "quiz") {

            // Placeholder for quiz lesson edit preload logic.
            const quiz = await getQuizByLessonId(connection, lessonId); 
            if (quiz) {
              const questions = await getQuizQuestionsByQuizId(
                connection,
                quiz.quiz_id,
              );

              for (const question of questions) {
                const options = await getQuestionOptionsByQuestionId(
                  connection,
                  question.question_id,
                );

                question.options = options;
              }

              quiz.questions = questions;
            }

            response.quiz = quiz;

        }

        return res.status(200).json(response);

    } catch (error) {

        console.log("Get Lesson By ID Error:", error);

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

/* CREATE LESSON */
// exports.createLesson = async (req, res) => {

//     let connection;
//     let lesson_cloud_file_id = null;
//     let transactionCommitted = false;

//     try {

//         connection = await db.getConnection();

//         await connection.beginTransaction();

//         let {

//             topic_id,
//             lesson_title,
//             lesson_content_type,
//             // lesson_duration,
//             lesson_is_free_preview,
//             lesson_is_published

//         } = req.body;

//         lesson_title = lesson_title?.trim();
//         lesson_content_type = lesson_content_type?.trim().toLowerCase();

//         lesson_is_free_preview = lesson_is_free_preview === "true";

//         lesson_is_published = lesson_is_published === "true";

//         const topicId = Number(topic_id);
//         // const duration = Number(lesson_duration);

//         // ==========================
//         // VALIDATION
//         // ==========================

//         if (!topicId || isNaN(topicId)) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Valid topic ID is required."

//             });

//         }

//         if (!lesson_title) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Lesson title is required."

//             });

//         }

//         if (
//             lesson_title.length < 3 ||
//             lesson_title.length > 255
//         ) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Lesson title must be between 3 and 255 characters."

//             });

//         }

//         if (
//             !["video", "text", "quiz"].includes(
//                 lesson_content_type
//             )
//         ) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Invalid lesson content type."

//             });

//         }


//         // if (
//         //     isNaN(duration) ||
//         //     duration <= 0
//         // ) {
//         //     await connection.rollback();

//         //     return res.status(400).json({

//         //         success: false,
//         //         message: "Valid lesson duration is required."

//         //     });

//         // }

//         // ==========================
//         // CHECK TOPIC EXISTS
//         // ==========================


//         console.time("TOTAL");
//         console.time("CHECK_TOPIC");
//         const topic = await checkTopicExists(

//             connection,
//             topicId

//         );
//         console.timeEnd("CHECK_TOPIC");

//         if (!topic) {

//             await connection.rollback();

//             return res.status(404).json({

//                 success: false,
//                 message: "Topic not found."

//             });

//         }

//         // ==========================
//         // CHECK DUPLICATE LESSON
//         // ==========================
//         console.time("DUPLICATE_CHECK");
//         const duplicateLesson =
//             await checkDuplicateLesson(

//                 connection,
//                 topicId,
//                 lesson_title

//             );
//         console.timeEnd("DUPLICATE_CHECK");

//         if (duplicateLesson) {

//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Lesson already exists for this topic."

//             });

//         }

//         // ==========================
//         // GET NEXT ORDER
//         // ==========================

//         const lessonOrder =
//             await getNextLessonOrder(

//                 connection,
//                 topicId

//             );

//         // ==========================
//         // UPLOAD VIDEO TO CLOUDINARY
//         // ==========================

//         let lesson_video_url = null;
//         let lesson_duration = 0;

//         if (lesson_content_type === "video") {
//             if (!req.file) {
//                 await connection.rollback();

//                 return res.status(400).json({
//                     success: false,
//                     message: "Lesson video is required."
//                 });
//             }
//             console.log("File Size:", req.file.size / 1024 / 1024, "MB");
//             console.time("UPLOAD");

//             const uploadResult = await new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                     {
//                         resource_type: "video",
//                         folder: "lesson_videos"
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
//             console.timeEnd("UPLOAD");

//             lesson_video_url = uploadResult.secure_url;
//             lesson_cloud_file_id = uploadResult.public_id;

//             // Duration returned by Cloudinary is in seconds
//             lesson_duration = Math.ceil(uploadResult.duration);


//         }


//         // ==========================
//         // INSERT LESSON
//         // ==========================
//         console.time("INSERT");

//         const lessonId =
//             await insertLesson(
//                 connection,
//                 {
//                     topic_id: topicId,
//                     lesson_title,
//                     lesson_content_type,
//                     lesson_duration,
//                     lesson_video_url,
//                     lesson_cloud_file_id,

//                     lesson_order: lessonOrder,

//                     lesson_is_free_preview:
//                         lesson_is_free_preview ?? false,

//                     lesson_is_published:
//                         lesson_is_published ?? false,

//                     created_by: req.user.user_id,

//                     updated_by: req.user.user_id

//                 }

//             );
//         console.timeEnd("INSERT");
//         console.timeEnd("TOTAL");

//         await connection.commit();
//         transactionCommitted = true;

//         return res.status(201).json({

//             success: true,
//             message: "Lesson created successfully.",
//             lessonId

//         });

//     }

//     catch (error) {

//         if (lesson_cloud_file_id && !transactionCommitted) {
//             try {
//                 await cloudinary.uploader.destroy(
//                     lesson_cloud_file_id,
//                     { resource_type: "video" }
//                 );
//             } catch (cleanupError) {
//                 console.log("Create Lesson Cloudinary Cleanup Error:", cleanupError);
//             }
//         }

//         if (connection && !transactionCommitted) {

//             await connection.rollback();

//         }

//         console.log(
//             "Create Lesson Error:",
//             error
//         );

//         return res.status(500).json({

//             success: false,
//             message: "Server Error"

//         });

//     }

//     finally {

//         if (connection) {

//             connection.release();
//         }
//     }
// };

/* */
// exports.createLesson = async (req, res) => {

//     let connection;
//     let lesson_cloud_file_id = null;
//     let transactionCommitted = false;

//     try {

//         connection = await db.getConnection();

//         await connection.beginTransaction();

//         let {

//             topic_id,
//             lesson_title,
//             lesson_content_type,
//             // lesson_duration,
//             lesson_is_free_preview,
//             lesson_is_published

//         } = req.body;

//         lesson_title = lesson_title?.trim();
//         lesson_content_type = lesson_content_type?.trim().toLowerCase();

//         lesson_is_free_preview = lesson_is_free_preview === "true";

//         lesson_is_published = lesson_is_published === "true";

//         const topicId = Number(topic_id);
//         // const duration = Number(lesson_duration);

//         // ==========================
//         // VALIDATION
//         // ==========================

//         if (!topicId || isNaN(topicId)) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Valid topic ID is required."

//             });

//         }

//         if (!lesson_title) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Lesson title is required."

//             });

//         }

//         if (
//             lesson_title.length < 3 ||
//             lesson_title.length > 255
//         ) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Lesson title must be between 3 and 255 characters."

//             });

//         }

//         if (
//             !["video", "text", "quiz"].includes(
//                 lesson_content_type
//             )
//         ) {
//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Invalid lesson content type."

//             });

//         }


//         // if (
//         //     isNaN(duration) ||
//         //     duration <= 0
//         // ) {
//         //     await connection.rollback();

//         //     return res.status(400).json({

//         //         success: false,
//         //         message: "Valid lesson duration is required."

//         //     });

//         // }

//         // ==========================
//         // CHECK TOPIC EXISTS
//         // ==========================


//         console.time("TOTAL");
//         console.time("CHECK_TOPIC");
//         const topic = await checkTopicExists(

//             connection,
//             topicId

//         );
//         console.timeEnd("CHECK_TOPIC");

//         if (!topic) {

//             await connection.rollback();

//             return res.status(404).json({

//                 success: false,
//                 message: "Topic not found."

//             });

//         }

//         // ==========================
//         // CHECK DUPLICATE LESSON
//         // ==========================
//         console.time("DUPLICATE_CHECK");
//         const duplicateLesson =
//             await checkDuplicateLesson(

//                 connection,
//                 topicId,
//                 lesson_title

//             );
//         console.timeEnd("DUPLICATE_CHECK");

//         if (duplicateLesson) {

//             await connection.rollback();

//             return res.status(400).json({

//                 success: false,
//                 message: "Lesson already exists for this topic."

//             });

//         }

//         // ==========================
//         // GET NEXT ORDER
//         // ==========================

//         const lessonOrder =
//             await getNextLessonOrder(

//                 connection,
//                 topicId

//             );

//         // ==========================
//         // UPLOAD VIDEO TO CLOUDINARY
//         // ==========================

//         let lesson_video_url = null;
//         let lesson_duration = 0;

//         if (lesson_content_type === "video") {
//             if (!req.file) {
//                 await connection.rollback();

//                 return res.status(400).json({
//                     success: false,
//                     message: "Lesson video is required."
//                 });
//             }
//             console.log("File Size:", req.file.size / 1024 / 1024, "MB");
//             console.time("UPLOAD");

//             // const uploadResult = await new Promise((resolve, reject) => {
//             //     const stream = cloudinary.uploader.upload_stream(
//             //         {
//             //             resource_type: "video",
//             //             folder: "lesson_videos"
//             //         },
//             //         (error, result) => {
//             //             if (error) {
//             //                 return reject(error);
//             //             }
//             //             resolve(result);
//             //         }
//             //     );

//             //     streamifier.createReadStream(req.file.buffer).pipe(stream);
//             // });

//             const uploadResult = await cloudinary.uploader.upload(
//                 req.file.path,
//                 {
//                     resource_type: "video",
//                     folder: "lesson_videos",
//                     timeout: 600000
//                 }
//             );
//             console.timeEnd("UPLOAD");

//             lesson_video_url = uploadResult.secure_url;
//             lesson_cloud_file_id = uploadResult.public_id;

//             // Duration returned by Cloudinary is in seconds
//             lesson_duration = Math.ceil(uploadResult.duration);


//         }

//         // await connection.beginTransaction();

//         // ==========================
//         // INSERT LESSON
//         // ==========================
//         console.time("INSERT");

//         const lessonId =
//             await insertLesson(
//                 connection,
//                 {
//                     topic_id: topicId,
//                     lesson_title,
//                     lesson_content_type,
//                     lesson_duration,
//                     lesson_video_url,
//                     lesson_cloud_file_id,

//                     lesson_order: lessonOrder,

//                     lesson_is_free_preview:
//                         lesson_is_free_preview ?? false,

//                     lesson_is_published:
//                         lesson_is_published ?? false,

//                     created_by: req.user.user_id,

//                     updated_by: req.user.user_id

//                 }

//             );
//         console.timeEnd("INSERT");
//         console.timeEnd("TOTAL");

//         await connection.commit();
//         transactionCommitted = true;

//         return res.status(201).json({

//             success: true,
//             message: "Lesson created successfully.",
//             lessonId

//         });

//     }

//     catch (error) {

//         if (lesson_cloud_file_id && !transactionCommitted) {
//             try {
//                 await cloudinary.uploader.destroy(
//                     lesson_cloud_file_id,
//                     { resource_type: "video" }
//                 );
//             } catch (cleanupError) {
//                 console.log("Create Lesson Cloudinary Cleanup Error:", cleanupError);
//             }
//         }

//         if (connection && !transactionCommitted) {

//             await connection.rollback();

//         }

//         console.log(
//             "Create Lesson Error:",
//             error
//         );

//         return res.status(500).json({

//             success: false,
//             message: "Server Error"

//         });

//     }

//     finally {

//         // if (connection) {

//         //     connection.release();
//         // }

//         if (req.file?.path) {
//             try {
//                 fs.unlinkSync(req.file.path);
//             } catch (err) {
//                 console.log("File cleanup error:", err.message);
//             }
//         }

//         if (connection) {
//             connection.release();
//         }
//     }
// };

/* */
exports.createLesson = async (req, res) => {

    let connection;
    let lesson_cloud_file_id = null;
    let resource_cloud_file_id = null;
    let resource_cloudinary_type = null;
    let transactionCommitted = false;

    try {
      connection = await db.getConnection();

      // await connection.beginTransaction();

      let {
        topic_id,
        lesson_title,
        lesson_content_type,
        // lesson_duration,
        lesson_is_free_preview,
        lesson_is_published,
      } = req.body;

      lesson_title = lesson_title?.trim();
      lesson_content_type = lesson_content_type?.trim().toLowerCase();

      lesson_is_free_preview = lesson_content_type === "video" && lesson_is_free_preview === "true";

      lesson_is_published = lesson_is_published === "true";

      const topicId = Number(topic_id);
      // const duration = Number(lesson_duration);

      // ==========================
      // VALIDATION
      // ==========================

      if (!topicId || isNaN(topicId)) {
        // await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Valid module ID is required.",
        });
      }

      if (!lesson_title) {
        // await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Lesson title is required.",
        });
      }

      if (lesson_title.length < 3 || lesson_title.length > 255) {
        // await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Lesson title must be between 3 and 255 characters.",
        });
      }

      if (!["video", "text", "quiz", "live"].includes(lesson_content_type)) {
        // await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid lesson content type.",
        });
      }

      // if (
      //     isNaN(duration) ||
      //     duration <= 0
      // ) {
      //     await connection.rollback();

      //     return res.status(400).json({

      //         success: false,
      //         message: "Valid lesson duration is required."

      //     });

      // }

      // ==========================
      // CHECK TOPIC EXISTS
      // ==========================

      console.time("TOTAL");
      console.time("CHECK_TOPIC");
      const topic = await checkTopicExists(connection, topicId);
      console.timeEnd("CHECK_TOPIC");

      if (!topic) {
        // await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Module not found.",
        });
      }

      // ==========================
      // CHECK DUPLICATE LESSON
      // ==========================
      console.time("DUPLICATE_CHECK");
      const duplicateLesson = await checkDuplicateLesson(
        connection,
        topicId,
        lesson_title,
      );
      console.timeEnd("DUPLICATE_CHECK");

      if (duplicateLesson) {
        // await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Lesson already exists for this module.",
        });
      }

      // ==========================
      // GET NEXT ORDER
      // ==========================

      const lessonOrder = await getNextLessonOrder(connection, topicId);

      connection.release();
      connection = null;

      // ==========================
      // UPLOAD VIDEO TO CLOUDINARY
      // ==========================

      let lesson_video_url = null;
      let lesson_duration = 0;
      let resource_url = null;
      let resource_type_for_db = null;

      if (lesson_content_type === "video") {
        if (!req.file) {
          // await connection.rollback();

          return res.status(400).json({
            success: false,
            message: "Lesson video is required.",
          });
        }
        console.log("File Size:", req.file.size / 1024 / 1024, "MB");
        console.time("UPLOAD");

        // const uploadResult = await new Promise((resolve, reject) => {
        //     const stream = cloudinary.uploader.upload_stream(
        //         {
        //             resource_type: "video",
        //             folder: "lesson_videos"
        //         },
        //         (error, result) => {
        //             if (error) {
        //                 return reject(error);
        //             }
        //             resolve(result);
        //         }
        //     );

        //     streamifier.createReadStream(req.file.buffer).pipe(stream);
        // });

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "lesson_videos",
          timeout: 600000,
        });
        console.timeEnd("UPLOAD");

        lesson_video_url = uploadResult.secure_url;
        lesson_cloud_file_id = uploadResult.public_id;

        // Duration returned by Cloudinary is in seconds
        lesson_duration = Math.ceil(uploadResult.duration);
      }

      // ==========================
      // UPLOAD RESOURCE FOR TEXT LESSONS
      // ==========================

      if (lesson_content_type === "text") {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Lesson resource file is required.",
          });
        }

        console.log("File Size:", req.file.size / 1024 / 1024, "MB");
        console.time("UPLOAD");

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          folder: "lesson_resources",
          timeout: 600000,
        });
        console.timeEnd("UPLOAD");

        resource_url = uploadResult.secure_url;
        resource_cloud_file_id = uploadResult.public_id;
        resource_cloudinary_type = uploadResult.resource_type;

        // derive resource_type for DB from mimetype or extension
        const path = require("path");
        const ext = path.extname(req.file.originalname || "").toLowerCase();
        const mimetype = req.file.mimetype || "";

        if (
          mimetype.startsWith("image/") ||
          [".png", ".jpg", ".jpeg", ".gif"].includes(ext)
        ) {
          resource_type_for_db = "image";
        } else if (
          mimetype.startsWith("audio/") ||
          [".mp3", ".wav"].includes(ext)
        ) {
          resource_type_for_db = "audio";
        } else if (ext === ".pdf" || mimetype === "application/pdf") {
          resource_type_for_db = "pdf";
        } else {
          resource_type_for_db = "document";
        }
      }

      connection = await db.getConnection();

      await connection.beginTransaction();

      // ==========================
      // INSERT LESSON
      // ==========================
      console.time("INSERT");

      const lessonId = await insertLesson(connection, {
        topic_id: topicId,
        lesson_title,
        lesson_content_type,
        lesson_duration,
        lesson_video_url,
        lesson_cloud_file_id,

        lesson_order: lessonOrder,

        lesson_is_free_preview: lesson_is_free_preview ?? false,

        lesson_is_published: lesson_is_published ?? false,

        created_by: req.user.user_id,

        updated_by: req.user.user_id,
      });

      // if this is a quiz lesson, create a quiz record
      if (lesson_content_type === "quiz") {
        await createQuizController(
          connection,
          {
            ...req.body,
            lesson_id: lessonId,
            created_by: req.user.user_id,
            updated_by: req.user.user_id,
          },
          req.user.user_id,
        );
      }

      // If this is a text lesson and we uploaded a resource, insert resource record
      if (lesson_content_type === "text") {
        await insertLessonResource(connection, {
          lesson_id: lessonId,
          resource_title: lesson_title,
          resource_type: resource_type_for_db,
          resource_url: resource_url,
          resource_cloud_file_id: resource_cloud_file_id,
          created_by: req.user.user_id,
          updated_by: req.user.user_id,
        });
      }
      console.timeEnd("INSERT");
      console.timeEnd("TOTAL");

      await connection.commit();
      transactionCommitted = true;

      return res.status(201).json({
        success: true,
        message: "Lesson created successfully.",
        lessonId,
      });
    }

    catch (error) {

        if (lesson_cloud_file_id && !transactionCommitted) {
            try {
                await cloudinary.uploader.destroy(
                    lesson_cloud_file_id,
                    { resource_type: "video" }
                );
            } catch (cleanupError) {
                console.log("Create Lesson Cloudinary Cleanup Error:", cleanupError);
            }
        }

        if (resource_cloud_file_id && !transactionCommitted) {
            try {
                await cloudinary.uploader.destroy(
                    resource_cloud_file_id,
                    { resource_type: resource_cloudinary_type || "raw" }
                );
            } catch (cleanupError) {
                console.log("Create Lesson Resource Cloudinary Cleanup Error:", cleanupError);
            }
        }

        // if (connection && !transactionCommitted) {

        //     await connection.rollback();

        // }

        if (connection && !transactionCommitted) {
            try {
                await connection.rollback();
            } catch (err) {
                console.log(
                    "Rollback Error:",
                    err.message
                );
            }
        }

        console.log(
            "Create Lesson Error:",
            error
        );

        return res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

    finally {

        // if (connection) {

        //     connection.release();
        // }

        if (req.file?.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.log("File cleanup error:", err.message);
            }
        }

        if (connection) {
            connection.release();
        }
    }
};

// GET RESOURCE/FILE LESSON - FOR VIEW
exports.getLessonResource = async (
    req,
    res
) => {

    try {

        const { lessonId } = req.params;

        const resource =
            await getLessonResourceByLessonIdModel(
                lessonId
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: resource
        });

    } catch (error) {

        console.log(
            "Get Lesson Resource Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch resource"
        });

    }

};

//UPDATE LESSON
exports.updateLesson = async (req, res) => {

    let connection;
    let uploadedCloudFileId = null;
    let oldCloudFileId = null;
    let uploadedResourceCloudFileId = null;
    let oldResourceCloudFileId = null;
    let resourceCloudinaryType = null;
    let resourceTypeForDb = null;
    let transactionCommitted = false;
    let oldLessonType = null;

    try {

        const lessonId = Number(req.params.lessonId);

        if (!lessonId || isNaN(lessonId)) {

            return res.status(400).json({
                success: false,
                message: "Valid lesson ID is required."
            });

        }

        connection = await db.getConnection();

        const existingLesson =
            await getLessonById(
                connection,
                lessonId
            );

        if (!existingLesson) {

            return res.status(404).json({
                success: false,
                message: "Lesson not found."
            });

        }

        let {
            lesson_title,
            lesson_content_type,
            lesson_is_free_preview,
            lesson_is_published
        } = req.body;

        lesson_title = lesson_title?.trim() || existingLesson.lesson_title;
        lesson_content_type = lesson_content_type?.trim().toLowerCase() || existingLesson.lesson_content_type;

        lesson_is_free_preview = lesson_content_type === "video" && (req.body.lesson_is_free_preview === undefined
            ? existingLesson.lesson_is_free_preview
            : lesson_is_free_preview === "true");

        lesson_is_published = req.body.lesson_is_published === undefined
            ? existingLesson.lesson_is_published
            : lesson_is_published === "true";

        let lesson_video_url = existingLesson.lesson_video_url;
        let lesson_cloud_file_id = existingLesson.lesson_cloud_file_id;
        let lesson_duration = existingLesson.lesson_duration;
        let resourceUrl = null;
        let resourceCloudFileId = null;
        let resourceType = null;

        oldCloudFileId = existingLesson.lesson_cloud_file_id;
        oldLessonType = existingLesson.lesson_content_type; 

        const existingResource = lesson_content_type === "text"
            ? await getLessonResourceByLessonId(connection, lessonId)
            : null;

        resourceUrl = existingResource?.resource_url || null;
        resourceCloudFileId = existingResource?.resource_cloud_file_id || null;
        resourceType = existingResource?.resource_type || null;

        if (existingResource) {
            oldResourceCloudFileId = existingResource.resource_cloud_file_id;
        }


        if (req.file) {

            console.log("File Size:", req.file.size / 1024 / 1024, "MB");

            if (lesson_content_type === "video") {

                console.time("UPLOAD");

                const uploadResult = await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        resource_type: "video",
                        folder: "lesson_videos",
                        timeout: 600000
                    }
                );

                console.timeEnd("UPLOAD");

                uploadedCloudFileId = uploadResult.public_id;
                lesson_video_url = uploadResult.secure_url;
                lesson_cloud_file_id = uploadedCloudFileId;
                lesson_duration = Math.ceil(uploadResult.duration);

            } else if (lesson_content_type === "text") {

                console.time("UPLOAD");

                const uploadResult = await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        resource_type: "auto",
                        folder: "lesson_resources",
                        timeout: 600000
                    }
                );

                console.timeEnd("UPLOAD");

                uploadedResourceCloudFileId = uploadResult.public_id;
                resourceCloudinaryType = uploadResult.resource_type;
                resourceUrl = uploadResult.secure_url;

                const path = require("path");
                const ext = path.extname(req.file.originalname || "").toLowerCase();
                const mimetype = req.file.mimetype || "";

                if (mimetype.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
                    resourceTypeForDb = "image";
                } else if (mimetype.startsWith("audio/") || [".mp3", ".wav"].includes(ext)) {
                    resourceTypeForDb = "audio";
                } else if (ext === ".pdf" || mimetype === "application/pdf") {
                    resourceTypeForDb = "pdf";
                } else {
                    resourceTypeForDb = "document";
                }

                resourceType = resourceTypeForDb;
                resourceCloudFileId = uploadedResourceCloudFileId;
            }

        }

       
        await connection.beginTransaction();

        await updateLesson(
            connection,
            lessonId,
            {
                lesson_title,
                lesson_content_type,
                lesson_duration,
                lesson_video_url,
                lesson_cloud_file_id,
                lesson_is_free_preview,
                lesson_is_published,
                updated_by: req.user.user_id
            }
        );

        if (lesson_content_type === "quiz") {
          await upsertQuizForLesson(
            connection,
            lessonId,
            req.body,
            req.user.user_id,
          );
        }

        if (lesson_content_type === "text") {

            if (existingResource) {

                await updateLessonResource(
                    connection,
                    lessonId,
                    {
                        resource_title: lesson_title,
                        resource_type: resourceType || resourceTypeForDb || existingResource.resource_type,
                        resource_url: resourceUrl || existingResource.resource_url,
                        resource_cloud_file_id: resourceCloudFileId || existingResource.resource_cloud_file_id,
                        updated_by: req.user.user_id
                    }
                );

            } else if (req.file && uploadedResourceCloudFileId) {

                await insertLessonResource(
                    connection,
                    {
                        lesson_id: lessonId,
                        resource_title: lesson_title,
                        resource_type: resourceType || resourceTypeForDb,
                        resource_url: resourceUrl,
                        resource_cloud_file_id: resourceCloudFileId,
                        created_by: req.user.user_id,
                        updated_by: req.user.user_id
                    }
                );

            }

        }
   
        // if lesson changed from text to video or quiz, delete the resource if it exists
        if (
          oldLessonType === "text" &&
          lesson_content_type !== "text" &&
          existingResource
        ) {
          await deleteLessonResource(connection, lessonId);
        }

        if (oldLessonType === "quiz" && lesson_content_type !== "quiz") {
          await deleteQuizByLessonId(connection, lessonId);
        }

        await connection.commit();
        transactionCommitted = true;

        if (
          oldLessonType === "video" &&
          lesson_content_type !== "video" &&
          oldCloudFileId
        ) {
          try {
            await cloudinary.uploader.destroy(oldCloudFileId, {
              resource_type: "video",
            });
          } catch (err) {
            console.log(err);
          }
        }

        if (
          oldLessonType === "text" &&
          lesson_content_type !== "text" &&
          oldResourceCloudFileId
        ) {
          try {
            await cloudinary.uploader.destroy(oldResourceCloudFileId, {
              resource_type: "raw",
            });
          } catch (err) {
            console.log(err);
          }
        }
        

        if (
            uploadedCloudFileId &&
            oldCloudFileId &&
            uploadedCloudFileId !== oldCloudFileId
        ) {
            try {
                await cloudinary.uploader.destroy(
                    oldCloudFileId,
                    { resource_type: "video" }
                );
            } catch (cleanupError) {
                console.log("Update Lesson Cloudinary Cleanup Error:", cleanupError);
            }
        }

        if (
            uploadedResourceCloudFileId &&
            oldResourceCloudFileId &&
            uploadedResourceCloudFileId !== oldResourceCloudFileId
        ) {
            try {
                await cloudinary.uploader.destroy(
                    oldResourceCloudFileId,
                    { resource_type: resourceCloudinaryType || "raw" }
                );
            } catch (cleanupError) {
                console.log("Update Lesson Resource Cloudinary Cleanup Error:", cleanupError);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Lesson updated successfully."
        });

    } catch (error) {
        if (uploadedCloudFileId && !transactionCommitted) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedCloudFileId,
                    { resource_type: "video" }
                );
            } catch (cleanupError) {
                console.log("Update Lesson Cloudinary Cleanup Error:", cleanupError);
            }
        }

        if (uploadedResourceCloudFileId && !transactionCommitted) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedResourceCloudFileId,
                    { resource_type: resourceCloudinaryType || "raw" }
                );
            } catch (cleanupError) {
                console.log("Update Lesson Resource Cloudinary Cleanup Error:", cleanupError);
            }
        }

        if (connection && !transactionCommitted) {
            try {
                await connection.rollback();
            } catch (err) {
                console.log(
                    "Rollback Error:",
                    err.message
                );
            }
        }

        console.log("Update Lesson Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    } finally {

        if (req.file?.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.log(
                    "File cleanup error:",
                    err.message
                );
            }
        }

        if (connection) {
            connection.release();
        }
    }
};

//DELETE LESSON
exports.deleteLesson = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const lessonId = Number(req.params.lessonId);

        const lesson = await getLessonById(
            connection,
            lessonId
        );

        if (!lesson) {

            await connection.rollback();

            return res.status(404).json({

                success: false,
                message: "Lesson not found."

            });

        }

        const topicId = lesson.topic_id;

        // Delete from Cloudinary (optional)
        if (lesson.lesson_cloud_file_id) {

            await cloudinary.uploader.destroy(

                lesson.lesson_cloud_file_id,

                {

                    resource_type: "video"

                }

            );

        }

        await deleteLesson(
            connection,
            lessonId
        );

        await reorderLessonDisplayOrder(
            connection,
            topicId
        );

        await connection.commit();

        return res.status(200).json({

            success: true,
            message: "Lesson deleted successfully."

        });

    }

    catch (error) {

        if (connection)
            await connection.rollback();

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