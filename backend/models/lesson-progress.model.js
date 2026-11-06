const db = require("../models/db");

/* SAVE PROGRESS */
exports.saveLessonProgressModel = async (
    userId,
    lessonId,
    lastWatchSeconds,
    percentage
) => {

    const connection = await db;

    // console.log({
    //     userId,
    //     lessonId,
    //     lastWatchSeconds,
    //     percentage
    // });

    await connection.query(
        `
    INSERT INTO tbl_lesson_progress
    (
      user_id,
      lesson_id,
      lesson_progress_last_watch_seconds,
      lesson_progress_percentage
    )
    VALUES
    (
      ?, ?, ?, ?
    )

    ON DUPLICATE KEY UPDATE

      lesson_progress_last_watch_seconds =
        VALUES(
          lesson_progress_last_watch_seconds
        ),

      lesson_progress_percentage =
        GREATEST(
          lesson_progress_percentage,
          VALUES(
            lesson_progress_percentage
          )
        ),

      updated_at = CURRENT_TIMESTAMP
    `,
        [
            userId,
            lessonId,
            lastWatchSeconds,
            percentage
        ]
    );

    // console.log("RESULT:", result);
};

/* LESSON COMPLETE */
exports.markLessonCompleteModel = async (
  userId,
  lessonId
) => {

  const connection = await db;

  await connection.query(
    `
    INSERT INTO tbl_lesson_progress
    (
      user_id,
      lesson_id,
      lesson_progress_completed,
      lesson_progress_percentage,
      lesson_completed_at
    )
    VALUES
    (
      ?, ?, TRUE, 100, NOW()
    )

    ON DUPLICATE KEY UPDATE

      lesson_progress_completed = TRUE,

      lesson_progress_percentage = 100,

      lesson_completed_at = NOW(),

      updated_at = CURRENT_TIMESTAMP
    `,
    [userId, lessonId]
  );

};


// exports.getTrainingProgressModel = async (
//   userId,
//   trainingId
// ) => {

//   const [rows] = await db.query(
//     `
//     SELECT
//       lp.lesson_id,
//       lp.lesson_progress_completed AS completed,
//       lp.lesson_progress_percentage AS percentage
//     FROM tbl_lesson_progress lp
//     JOIN tbl_training_lessons l
//       ON lp.lesson_id = l.lesson_id
//     JOIN tbl_training_topics t
//       ON l.topic_id = t.topic_id
//     WHERE
//       lp.user_id = ?
//       AND t.training_id = ?
//     `,
//     [userId, trainingId]
//   );

//   return rows;
// };

exports.getTrainingProgressModel = async (
  userId,
  trainingId
) => {

  const [rows] = await db.query(
    `
    SELECT 
      lp.lesson_id, 
      lp.lesson_progress_completed AS completed, 
      lp.lesson_progress_percentage AS percentage 

    FROM tbl_lesson_progress lp

    JOIN tbl_training_lessons l 
      ON lp.lesson_id = l.lesson_id
      AND l.lesson_content_type <> 'live'

    JOIN tbl_training_topics t 
      ON l.topic_id = t.topic_id

    WHERE 
      lp.user_id = ? 
      AND t.training_id = ?
    `,
    [userId, trainingId]
  );

  return rows;
};