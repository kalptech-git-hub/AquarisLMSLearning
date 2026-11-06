const db = require("../models/db");

const {
  saveLessonProgressModel,
  markLessonCompleteModel,
  getTrainingProgressModel
} = require("../models/lesson-progress.model");

/* SAVE PROGRESS */
exports.saveLessonProgress = async (
  req,
  res
) => {
  try {


    // console.log("SAVE API HIT");

    // console.log("USER:", req.user);

    // console.log("BODY:", req.body);

    const userId = req.user.user_id;

    const {
      lesson_id,
      last_watch_seconds,
      percentage
    } = req.body;


    await saveLessonProgressModel(
      userId,
      lesson_id,
      last_watch_seconds,
      percentage
    );

    return res.status(200).json({
      success: true,
      message: "Progress saved"
    });

  } catch (error) {

    console.log(
      "Save Progress Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save progress"
    });
  }
};

/* LESSON COMPLETE */
exports.markLessonComplete = async (
  req,
  res
) => {
  try {

    const userId = req.user.user_id;

    const { lesson_id } = req.body;

    await markLessonCompleteModel(
      userId,
      lesson_id
    );

    return res.status(200).json({
      success: true,
      message: "Lesson completed"
    });

  } catch (error) {

    console.log(
      "Mark Lesson Complete Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to complete lesson"
    });
  }
};

exports.getTrainingProgress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { trainingId } = req.params;

    const progress =
      await getTrainingProgressModel(
        userId,
        trainingId
      );

    return res.status(200).json({
      success: true,
      data: progress
    });

  } catch (error) {

    console.log(
      "Get Training Progress Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get progress"
    });
  }
};

/* GET STUDENT PROGRESS FOR PARTICULAR TRAINING */
// exports.getTrainingStudentsProgress = async (req, res) => {
//   const { trainingId } = req.params;

//   try {
//     const [students] = await db.query(
//       `
//       SELECT 
//           u.user_id,
//           u.user_full_name,
//           u.user_email,
//           e.created_at AS joined_date,

//           COUNT(DISTINCT tl.lesson_id) AS total_lessons,

//           COUNT(
//               DISTINCT CASE
//                   WHEN lp.lesson_progress_completed = TRUE
//                   THEN tl.lesson_id
//               END
//           ) AS completed_lessons,

//           CASE
//               WHEN COUNT(DISTINCT tl.lesson_id) = 0 THEN 0
//               ELSE ROUND(
//                   (
//                       COUNT(
//                           DISTINCT CASE
//                               WHEN lp.lesson_progress_completed = TRUE
//                               THEN tl.lesson_id
//                           END
//                       ) / COUNT(DISTINCT tl.lesson_id)
//                   ) * 100
//               )
//           END AS progress

//       FROM tbl_enrollments e

//       INNER JOIN tbl_users u
//           ON u.user_id = e.user_id

//       INNER JOIN tbl_training_topics tt
//           ON tt.training_id = e.training_id

//       INNER JOIN tbl_training_lessons tl
//           ON tl.topic_id = tt.topic_id

//       LEFT JOIN tbl_lesson_progress lp
//           ON lp.user_id = e.user_id
//           AND lp.lesson_id = tl.lesson_id

//       WHERE e.training_id = ?
//         AND e.enroll_status = 'A'

//       GROUP BY
//           u.user_id,
//           u.user_full_name,
//           u.user_email,
//           e.created_at

//       ORDER BY e.created_at DESC
//       `,
//       [trainingId]
//     );

//     res.status(200).json({
//       success: true,
//       students
//     });

//   } catch (error) {
//     console.error(
//       "GET TRAINING STUDENTS PROGRESS ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       // message: "Failed to fetch training students progress"
//       message: "Failed to fetch course students progress"
//     });
//   }
// };

exports.getTrainingStudentsProgress = async (req, res) => {
  const { trainingId } = req.params;

  try {
    const [students] = await db.query(
      `
      SELECT  
          u.user_id, 
          u.user_full_name, 
          u.user_email, 
          e.created_at AS joined_date, 

          COUNT(DISTINCT tl.lesson_id) AS total_lessons, 

          COUNT(
              DISTINCT CASE 
                  WHEN lp.lesson_progress_completed = TRUE 
                  THEN tl.lesson_id
              END
          ) AS completed_lessons, 

          CASE 
              WHEN COUNT(DISTINCT tl.lesson_id) = 0 THEN 0
              ELSE ROUND(
                  (
                      COUNT(
                          DISTINCT CASE 
                              WHEN lp.lesson_progress_completed = TRUE
                              THEN tl.lesson_id
                          END
                      ) / COUNT(DISTINCT tl.lesson_id)
                  ) * 100
              )
          END AS progress

      FROM tbl_enrollments e 

      INNER JOIN tbl_users u 
          ON u.user_id = e.user_id 

      INNER JOIN tbl_training_topics tt 
          ON tt.training_id = e.training_id 

      INNER JOIN tbl_training_lessons tl 
          ON tl.topic_id = tt.topic_id
          AND tl.lesson_content_type <> 'live'

      LEFT JOIN tbl_lesson_progress lp 
          ON lp.user_id = e.user_id 
          AND lp.lesson_id = tl.lesson_id 

      WHERE e.training_id = ? 
        AND e.enroll_status = 'A' 

      GROUP BY 
          u.user_id, 
          u.user_full_name, 
          u.user_email, 
          e.created_at 

      ORDER BY e.created_at DESC
      `,
      [trainingId]
    );

    res.status(200).json({
      success: true,
      students
    });

  } catch (error) {
    console.error(
      "GET TRAINING STUDENTS PROGRESS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch course students progress"
    });
  }
};