const {
  createLiveSession,
  getLiveSessionByLessonId,
  updateLiveSession,
  cancelLiveSession,
  deleteLiveSession,
  getLessonForLiveSession,
  getEnrolledStudentsForLiveSession,
  getUpcomingLiveSessionsForStudent
} = require("../models/live-session.model");


const transporter = require("../utils/transporter");

const {
  liveSessionCreatedEmailTemplate,
  liveSessionUpdatedEmailTemplate,
  liveSessionDeletedEmailTemplate
} = require("../utils/emailTemplate.js");

const db = require("../models/db"); // database connection pool
const {
  createNotificationRecord,
  emitNotification,
} = require("../services/notification.service");

// CREATE LIVE SESSION
// exports.createLiveSession = async (req, res) => {
//   try {
//     const {
//       lesson_id,
//       meeting_platform,
//       meeting_link,
//       meeting_password,
//       start_time,
//       end_time,
//     } = req.body;

//     // Basic validation
//     if (!lesson_id || !meeting_platform || !meeting_link || !start_time) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Lesson, meeting platform, meeting link and start time are required",
//       });
//     }

//     // Validate platform
//     if (!["zoom", "google_meet"].includes(meeting_platform)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid meeting platform",
//       });
//     }

//     // Validate meeting link URL
//     const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/i;
//     if (!urlPattern.test(meeting_link.trim())) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid meeting URL",
//       });
//     }

//     // Check lesson
//     const lesson = await getLessonForLiveSession(lesson_id);

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         message: "Lesson not found",
//       });
//     }

//     // Lesson must be live
//     if (lesson.lesson_content_type !== "live") {
//       return res.status(400).json({
//         success: false,
//         message: "Live session can only be created for a live lesson",
//       });
//     }

//     // Check duplicate live session
//     const existingSession = await getLiveSessionByLessonId(lesson_id);

//     if (existingSession) {
//       return res.status(409).json({
//         success: false,
//         message: "Live session already exists for this lesson",
//       });
//     }

//     // Validate end time
//     if (end_time && new Date(end_time) <= new Date(start_time)) {
//       return res.status(400).json({
//         success: false,
//         message: "End time must be after start time",
//       });
//     }

//     const liveSessionId = await createLiveSession({
//       lesson_id,
//       meeting_platform,
//       meeting_link,
//       meeting_password,
//       start_time,
//       end_time,
//       created_by: req.user.user_id,
//       updated_by: req.user.user_id,
//     });

//     const students = await getEnrolledStudentsForLiveSession(
//       lesson.training_id,
//     );

//     const io = req.app.get("io");

//     for (const student of students) {

//       try {

//         const connection = await db.getConnection();

//         await connection.beginTransaction();
//         // ==============================
//         // CREATE NOTIFICATION RECORD
//         // ==============================

//         const notification =
//           await createNotificationRecord(
//             connection,
//             {
//               user_id: student.user_id,

//               notification_type: "LIVE_SESSION",

//               title: "Live Session Scheduled",

//               message:
//                 `A live session for "${lesson.lesson_title}" has been scheduled for ${new Date(
//                   start_time
//                 ).toLocaleString("en-IN")}.`,

//               live_session_id: liveSessionId,

//               training_id: lesson.training_id,

//               enroll_id: null
//             }
//           );


//         // ==============================
//         // EMIT SOCKET NOTIFICATION
//         // ==============================

//         if (io) {

//           emitNotification(
//             io,
//             notification
//           );

//         }


//         console.log(
//           `Live session notification sent to user ${student.user_id}`
//         );


//       } catch (studentError) {

//         console.log(
//           `Failed processing notification for student ${student.user_id}:`,
//           studentError.message
//         );

//       }

//     }


//     // Send emails to enrolled students
//     for (const student of students) {
//       try {
//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: student.user_email,
//           subject: `Live Lecture Scheduled - ${lesson.lesson_title}`,
//           html: liveSessionCreatedEmailTemplate({
//             recipientName: student.user_full_name,
//             lessonTitle: lesson.lesson_title,
//             meetingPlatform: meeting_platform,
//             meetingLink: meeting_link,
//             meetingPassword: meeting_password,
//             startTime: new Date(start_time).toLocaleString("en-IN"),
//             endTime: end_time
//               ? new Date(end_time).toLocaleString("en-IN")
//               : null,
//           }),
//         });

//         console.log(`Create email sent to ${student.user_email}`);
//       } catch (emailError) {
//         console.log(
//           `Failed to send create email to ${student.user_email}:`,
//           emailError.message,
//         );
//       }
//     }

//     const liveSession = await getLiveSessionByLessonId(lesson_id);

//     return res.status(201).json({
//       success: true,
//       message: "Live session created successfully",
//       live_session_id: liveSessionId,
//       live_session: liveSession,
//     });
//   } catch (error) {

//     console.log("Create Live Session Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

exports.createLiveSession = async (req, res) => {

  let connection;
  let transactionCommitted = false;
  try {
    // GET DATABASE CONNECTION
    connection = await db.getConnection();

    await connection.beginTransaction();

    const {
      lesson_id,
      meeting_platform,
      meeting_link,
      meeting_password,
      start_time,
      end_time,
    } = req.body;

    // Basic validation
    if (!lesson_id || !meeting_platform || !meeting_link || !start_time) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Lesson, meeting platform, meeting link and start time are required",
      });
    }

    // Validate platform
    if (!["zoom", "google_meet"].includes(meeting_platform)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid meeting platform",
      });
    }

    // Validate meeting link URL
    const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/i;
    if (!urlPattern.test(meeting_link.trim())) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Please enter a valid meeting URL",
      });
    }

    // Check lesson
    const lesson = await getLessonForLiveSession(lesson_id);

    if (!lesson) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Lesson must be live
    if (lesson.lesson_content_type !== "live") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Live session can only be created for a live lesson",
      });
    }

    // Check duplicate live session
    const existingSession = await getLiveSessionByLessonId(lesson_id);

    if (existingSession) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Live session already exists for this lesson",
      });
    }

    // Validate end time
    if (end_time && new Date(end_time) <= new Date(start_time)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }
    console.log("CREATE LIVE SESSION");
    console.log("lesson_id:", lesson_id);
    console.log("training_id:", lesson.training_id);


    const liveSessionId = await createLiveSession(connection, {
      lesson_id,
      meeting_platform,
      meeting_link,
      meeting_password,
      start_time,
      end_time,
      created_by: req.user.user_id,
      updated_by: req.user.user_id,
    });

    console.log("NEW LIVE SESSION ID:", liveSessionId);

    const students = await getEnrolledStudentsForLiveSession(
      connection,
      lesson.training_id
    );

    console.log("STUDENTS:", students.length);
    const pendingNotifications = [];


    for (const student of students) {
      const formattedDate = new Date(start_time).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });


      // ==============================
      // CREATE NOTIFICATION RECORD
      // ==============================


      const notification = await createNotificationRecord(
        connection,
        {
          user_id: student.user_id,

          notification_type: "LIVE_SESSION",

          title: "Live Session Scheduled",

          // message:
          //   `A live session for "${lesson.lesson_title}" has been scheduled for ${new Date(
          //     start_time
          //   ).toLocaleString("en-IN")}.`,

          // message:
          //   `A live session for "${lesson.lesson_title}" has been scheduled for the training "${lesson.training_title}" on ${new Date(
          //     start_time
          //   ).toLocaleString("en-IN")}.`,

          message: `${lesson.lesson_title} • ${formattedDate}`,


          live_session_id: liveSessionId,

          training_id: lesson.training_id,

          enroll_id: null
        }
      );

      const notificationWithDetails = {
        ...notification,
        lesson_title: lesson.lesson_title,
        training_title: lesson.training_title,
        session_start_time: start_time
      };

      // pendingNotifications.push(notification);
      pendingNotifications.push(notificationWithDetails);

    }

    /* COMMIT DATABASE TRANSACTION */
    await connection.commit();
    transactionCommitted = true;

    /* EMIT SOCKET NOTIFICATIONS ONLY AFTER DATABASE COMMIT */
    const io = req.app.get("io");

    if (io) {
      for (const notification of pendingNotifications) {
        try {
          emitNotification(io, notification);
          console.log(`Live session notification sent to user ${notification.user_id}`);
        } catch (socketError) {
          console.log(`Failed to emit notification to user ${notification.user_id}:`, socketError.message);
        }
      }
    }



    // Send emails to enrolled students
    for (const student of students) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.user_email,
          subject: `Live Lecture Scheduled - ${lesson.lesson_title}`,
          html: liveSessionCreatedEmailTemplate({
            recipientName: student.user_full_name,
            trainingTitle: lesson.training_title,
            lessonTitle: lesson.lesson_title,
            meetingPlatform: meeting_platform,
            meetingLink: meeting_link,
            meetingPassword: meeting_password,
            startTime: new Date(start_time).toLocaleString("en-IN"),
            endTime: end_time
              ? new Date(end_time).toLocaleString("en-IN")
              : null,
          }),
        });

        console.log(`Create email sent to ${student.user_email}`);
      } catch (emailError) {
        console.log(
          `Failed to send create email to ${student.user_email}:`,
          emailError.message,
        );
      }
    }

    const liveSession = await getLiveSessionByLessonId(lesson_id);

    return res.status(201).json({
      success: true,
      message: "Live session created successfully",
      live_session_id: liveSessionId,
      live_session: liveSession,
    });
  } catch (error) {

    console.log("Create Live Session Error:", error);

    // ========================================= 
    // ROLLBACK TRANSACTION 
    // ========================================= 
    if (connection && !transactionCommitted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.log("Create Live Session Rollback Error:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
  finally {
    // ========================================= 
    // RELEASE DATABASE CONNECTION 
    // ========================================= 
    if (connection) {
      connection.release();
    }
  }
};

// GET LIVE SESSION
exports.getLiveSession = async (req, res) => {
  try {

    const { lessonId } = req.params;

    const liveSession = await getLiveSessionByLessonId(lessonId);

    if (!liveSession) {
      return res.status(404).json({
        success: false,
        message: "Live session not found"
      });
    }

    return res.status(200).json({
      success: true,
      live_session: liveSession
    });

  } catch (error) {

    console.log("Get Live Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// GET UPCOMING LIVE SESSIONS FOR THE AUTHENTICATED STUDENT
exports.getUpcomingLiveSessions = async (req, res) => {
  try {
    const sessions = await getUpcomingLiveSessionsForStudent(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.log("Get Upcoming Live Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// UPDATE LIVE SESSION
// exports.updateLiveSession = async (req, res) => {
//   try {

//     const { lessonId } = req.params;

//     const {
//       meeting_platform,
//       meeting_link,
//       meeting_password,
//       start_time,
//       end_time
//     } = req.body;


//     if (
//       !meeting_platform ||
//       !meeting_link ||
//       !start_time
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Meeting platform, meeting link and start time are required"
//       });
//     }


//     if (!["zoom", "google_meet"].includes(meeting_platform)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid meeting platform"
//       });
//     }

//     // Validate meeting link URL
//     const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/i;
//     if (!urlPattern.test(meeting_link.trim())) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid meeting URL",
//       });
//     }


//     const existingSession = await getLiveSessionByLessonId(lessonId);

//     const lesson = await getLessonForLiveSession(lessonId);

//     if (!existingSession) {
//       return res.status(404).json({
//         success: false,
//         message: "Live session not found"
//       });
//     }

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         message: "Lesson not found",
//       });
//     }

//     if (end_time && new Date(end_time) <= new Date(start_time)) {
//       return res.status(400).json({
//         success: false,
//         message: "End time must be after start time"
//       });
//     }

//     await updateLiveSession(lessonId, {
//       meeting_platform,
//       meeting_link,
//       meeting_password,
//       start_time,
//       end_time,
//       updated_by: req.user.user_id
//     });

//     const students = await getEnrolledStudentsForLiveSession(lesson.training_id);

//     // -----------------------------------------
//     // STORE & EMIT IN-APP NOTIFICATIONS FOR STUDENTS
//     // -----------------------------------------
//     const connection = await db.getConnection();
//     const pendingNotifications = [];

//     try {
//       await connection.beginTransaction();

//       for (const student of students) {
//         const notification = await createNotificationRecord(connection, {
//           user_id: student.user_id,
//           notification_type: "LIVE_SESSION_UPDATED",
//           title: "New Live Session Rescheduled",
//           message: `A live session for "${lesson.lesson_title}" has been rescheduled for ${new Date(start_time).toLocaleString("en-IN")}.`,
//           live_session_id: liveSessionId,
//           training_id: lesson.training_id,
//         });

//         pendingNotifications.push(notification);
//       }

//       await connection.commit();
//     } catch (notifErr) {
//       await connection.rollback();
//       console.error("Failed to save student notifications:", notifErr);
//     } finally {
//       connection.release();
//     }

//     // Emit socket notifications to each student in real-time
//     const io = req.app.get("io");
//     if (io) {
//       for (const notification of pendingNotifications) {
//         emitNotification(io, notification);
//       }
//     }

//     // Send emails to enrolled students
//     for (const student of students) {
//       try {
//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: student.user_email,
//           subject: `Live Lecture Updated - ${lesson.lesson_title}`,
//           html: liveSessionUpdatedEmailTemplate({
//             recipientName: student.user_full_name,
//             lessonTitle: lesson.lesson_title,
//             meetingPlatform: meeting_platform,
//             meetingLink: meeting_link,
//             meetingPassword: meeting_password,
//             startTime: new Date(start_time).toLocaleString("en-IN"),
//             endTime: end_time
//               ? new Date(end_time).toLocaleString("en-IN")
//               : null,
//           }),
//         });

//         console.log(`Update email sent to ${student.user_email}`);
//       } catch (emailError) {
//         console.log(
//           `Failed to send update email to ${student.user_email}:`,
//           emailError.message,
//         );
//       }
//     }

//     const updatedSession = await getLiveSessionByLessonId(lessonId);

//     return res.status(200).json({
//       success: true,
//       message: "Live session updated successfully",
//       live_session: updatedSession
//     });

//   } catch (error) {

//     console.log("Update Live Session Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

/* New - UPDATE LIVE SESSION */
exports.updateLiveSession = async (req, res) => {

  let connection;
  let transactionCommitted = false;

  try {
    // =========================================
    // GET DATABASE CONNECTION
    // =========================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    const { lessonId } = req.params;

    const {
      action = "UPDATE",
      meeting_platform,
      meeting_link,
      meeting_password,
      start_time,
      end_time
    } = req.body;

    const existingSession = await getLiveSessionByLessonId(lessonId);

    if (!existingSession) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Live session not found"
      });
    }

    if (action === "CANCEL") {
      const lesson = await getLessonForLiveSession(lessonId);

      if (!lesson) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      if (lesson.lesson_content_type !== "live") {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Live session can only be cancelled for a live lesson"
        });
      }

      if (existingSession.session_status === "CANCELLED") {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Live session is already cancelled"
        });
      }

      if (
        existingSession.start_time &&
        new Date(existingSession.start_time) <= new Date()
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Live session has already started or ended and cannot be cancelled.",
        });
      }

      if (
        existingSession.end_time &&
        new Date(existingSession.end_time) <= new Date()
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Live session has already started or ended and cannot be cancelled.",
        });
      }

      const students = await getEnrolledStudentsForLiveSession(
        connection,
        lesson.training_id
      );

      const liveSessionId = existingSession.live_session_id;

      const cancelledRows = await cancelLiveSession(
        connection,
        lessonId,
        req.user.user_id
      );

      if (!cancelledRows) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Live session could not be cancelled"
        });
      }

      const pendingNotifications = [];

      for (const student of students) {
        const notification = await createNotificationRecord(
          connection,
          {
            user_id: student.user_id,
            notification_type: "LIVE_SESSION_CANCELLED",
            title: "Live Session Cancelled",
            message: `${lesson.lesson_title}`,
            live_session_id: liveSessionId,
            training_id: lesson.training_id,
            enroll_id: null
          }
        );

        pendingNotifications.push({
          ...notification,
          lesson_title: lesson.lesson_title,
          training_title: lesson.training_title,
          session_start_time: existingSession.start_time
        });
      }

      await connection.commit();
      transactionCommitted = true;

      const io = req.app.get("io");

      if (io) {
        for (const notification of pendingNotifications) {
          try {
            emitNotification(io, notification);
            console.log(
              `Live session cancellation notification sent to user ${notification.user_id}`
            );
          } catch (socketError) {
            console.log(
              `Failed to emit cancellation notification to user ${notification.user_id}:`,
              socketError.message
            );
          }
        }
      }

      for (const student of students) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.user_email,
            subject: `Live Lecture Cancelled - ${lesson.lesson_title}`,
            html: liveSessionDeletedEmailTemplate({
              recipientName: student.user_full_name,
              trainingTitle: lesson.training_title,
              lessonTitle: lesson.lesson_title,
            }),
          });

          console.log(`Cancellation email sent to ${student.user_email}`);
        } catch (emailError) {
          console.log(
            `Failed to send cancellation email to ${student.user_email}:`,
            emailError.message,
          );
        }
      }

      const cancelledSession = await getLiveSessionByLessonId(lessonId);

      return res.status(200).json({
        success: true,
        message: "Live session cancelled successfully",
        live_session: cancelledSession
      });
    }

    if (
      !meeting_platform ||
      !meeting_link ||
      !start_time
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Meeting platform, meeting link and start time are required"
      });
    }

    if (!["zoom", "google_meet"].includes(meeting_platform)) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid meeting platform"
      });
    }

    // Validate meeting link URL
    const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/i;
    if (!urlPattern.test(meeting_link.trim())) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Please enter a valid meeting URL",
      });
    }

    if (
      existingSession.start_time &&
      new Date(existingSession.start_time) <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Live session has already started or ended and cannot be edited.",
      });
    }

    const lesson = await getLessonForLiveSession(lessonId);

    if (!lesson) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const liveSessionId = existingSession.live_session_id;

    // =========================================
    // LESSON MUST BE LIVE
    // =========================================

    if (lesson.lesson_content_type !== "live") {

      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Live session can only be updated for a live lesson"
      });
    }

    if (end_time && new Date(end_time) <= new Date(start_time)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    await updateLiveSession(connection, lessonId, {
      meeting_platform,
      meeting_link,
      meeting_password,
      start_time,
      end_time,
      updated_by: req.user.user_id
    });

    const students = await getEnrolledStudentsForLiveSession(
      connection,
      lesson.training_id
    );

    // =========================================
    // CREATE NOTIFICATIONS
    // =========================================

    const pendingNotifications = [];


    for (const student of students) {
      const formattedDate = new Date(start_time).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });


      const notification =
        await createNotificationRecord(
          connection,
          {
            user_id: student.user_id,

            notification_type: "LIVE_SESSION_UPDATED",

            title: "Live Session Updated",

            message: `${lesson.lesson_title} • ${formattedDate}`,

            live_session_id: liveSessionId,

            training_id: lesson.training_id,

            enroll_id: null
          }
        );

      const notificationWithDetails = {
        ...notification,
        lesson_title: lesson.lesson_title,
        training_title: lesson.training_title,
        session_start_time: start_time
      };

      pendingNotifications.push(notificationWithDetails);
    }

    // =========================================
    // COMMIT DATABASE TRANSACTION
    // =========================================

    await connection.commit();

    transactionCommitted = true;

    // =========================================
    // EMIT SOCKET NOTIFICATIONS
    // ONLY AFTER DATABASE COMMIT
    // =========================================

    const io = req.app.get("io");


    if (io) {

      for (const notification of pendingNotifications) {

        try {

          emitNotification(
            io,
            notification
          );

          console.log(
            `Live session update notification sent to user ${notification.user_id}`
          );

        } catch (socketError) {

          console.log(
            `Failed to emit update notification to user ${notification.user_id}:`,
            socketError.message
          );

        }
      }
    }

    // Send emails to enrolled students
    for (const student of students) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.user_email,
          subject: `Live Lecture Updated - ${lesson.lesson_title}`,
          html: liveSessionUpdatedEmailTemplate({
            recipientName: student.user_full_name,
            trainingTitle: lesson.training_title,
            lessonTitle: lesson.lesson_title,
            meetingPlatform: meeting_platform,
            meetingLink: meeting_link,
            meetingPassword: meeting_password,
            startTime: new Date(start_time).toLocaleString("en-IN"),
            endTime: end_time
              ? new Date(end_time).toLocaleString("en-IN")
              : null,
          }),
        });

        console.log(`Update email sent to ${student.user_email}`);
      } catch (emailError) {
        console.log(
          `Failed to send update email to ${student.user_email}:`,
          emailError.message,
        );
      }
    }

    const updatedSession = await getLiveSessionByLessonId(lessonId);

    return res.status(200).json({
      success: true,
      message: "Live session updated successfully",
      live_session: updatedSession
    });

  } catch (error) {

    console.log("Update Live Session Error:", error);

    // =========================================
    // ROLLBACK TRANSACTION
    // =========================================

    if (
      connection &&
      !transactionCommitted
    ) {

      try {

        await connection.rollback();

      } catch (rollbackError) {

        console.log(
          "Update Live Session Rollback Error:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
  finally {

    // =========================================
    // RELEASE DATABASE CONNECTION
    // =========================================

    if (connection) {

      connection.release();

    }
  }
};

// DELETE LIVE SESSION
// exports.deleteLiveSession = async (req, res) => {
//   try {
//
//     const { lessonId } = req.params;
//
//     const existingSession = await getLiveSessionByLessonId(lessonId);
//
//     const lesson = await getLessonForLiveSession(lessonId);
//
//     if (!existingSession) {
//       return res.status(404).json({
//         success: false,
//         message: "Live session not found"
//       });
//     }
//
//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         message: "Lesson not found",
//       });
//     }
//
//     const students = await getEnrolledStudentsForLiveSession(
//       lesson.training_id,
//     );
//
//     await deleteLiveSession(lessonId);
//
//     for (const student of students) {
//       try {
//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: student.user_email,
//           subject: `Live Lecture Cancelled - ${lesson.lesson_title}`,
//           html: liveSessionDeletedEmailTemplate({
//             recipientName: student.user_full_name,
//             lessonTitle: lesson.lesson_title,
//           }),
//         });
//
//         console.log(`Delete email sent to ${student.user_email}`);
//       } catch (emailError) {
//         console.log(
//           `Failed to send delete email to ${student.user_email}:`,
//           emailError.message,
//         );
//       }
//     }
//
//     return res.status(200).json({
//       success: true,
//       message: "Live session deleted successfully"
//     });
//
//   } catch (error) {
//
//     console.log("Delete Live Session Error:", error);
//
//     return res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

/* */
exports.deleteLiveSession = async (req, res) => {
  let connection;
  let transactionCommitted = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { lessonId } = req.params;

    const existingSession = await getLiveSessionByLessonId(lessonId);

    if (!existingSession) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Live session not found"
      });
    }

    const lesson = await getLessonForLiveSession(lessonId);

    if (!lesson) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (existingSession.session_status === "CANCELLED") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Live session is already cancelled"
      });
    }

    if (
      existingSession.start_time &&
      new Date(existingSession.start_time) <= new Date()
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Live session has already started or ended and cannot be cancelled.",
      });
    }

    if (
      existingSession.end_time &&
      new Date(existingSession.end_time) <= new Date()
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Live session has already started or ended and cannot be cancelled.",
      });
    }

    const students = await getEnrolledStudentsForLiveSession(
      connection,
      lesson.training_id,
    );

    const liveSessionId = existingSession.live_session_id;

    const cancelledRows = await cancelLiveSession(
      connection,
      lessonId,
      req.user.user_id
    );

    if (!cancelledRows) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Live session could not be cancelled"
      });
    }

    const pendingNotifications = [];

    for (const student of students) {
      const notification = await createNotificationRecord(connection,
        {
          user_id: student.user_id,
          notification_type: "LIVE_SESSION_CANCELLED",
          title: "Live Session Cancelled",
          message: `${lesson.lesson_title}`,
          live_session_id: liveSessionId,
          training_id: lesson.training_id,
          enroll_id: null
        }
      );

      pendingNotifications.push({
        ...notification,
        lesson_title: lesson.lesson_title,
        training_title: lesson.training_title,
        session_start_time: existingSession.start_time
      });
    }

    await connection.commit();
    transactionCommitted = true;

    const io = req.app.get("io");
    if (io) {
      for (const notification of pendingNotifications) {
        try {
          emitNotification(io, notification);
          console.log(`Live session cancellation notification sent to user ${notification.user_id}`);
        } catch (socketError) {
          console.log(`Failed to emit cancellation notification to user ${notification.user_id}:`, socketError.message);
        }
      }
    }

    for (const student of students) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.user_email,
          subject: `Live Lecture Cancelled - ${lesson.lesson_title}`,
          html: liveSessionDeletedEmailTemplate({
            recipientName: student.user_full_name,
            trainingTitle: lesson.training_title,
            lessonTitle: lesson.lesson_title,
          }),
        });

        console.log(`Cancellation email sent to ${student.user_email}`);
      } catch (emailError) {
        console.log(
          `Failed to send cancellation email to ${student.user_email}:`,
          emailError.message,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Live session deleted successfully"
    });

  } catch (error) {
    console.log("Delete Live Session Error:", error);

    if (
      connection &&
      !transactionCommitted
    ) {

      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.log(
          "Delete Live Session Rollback Error:",
          rollbackError
        );
      }
    }

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
