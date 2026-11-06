const db = require("./db");

// Create live session
// exports.createLiveSession = async (data) => {
//   const sql = `
//     INSERT INTO tbl_live_sessions (
//       lesson_id,
//       meeting_platform,
//       meeting_link,
//       meeting_password,
//       start_time,
//       end_time,
//       created_by,
//       updated_by
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const [result] = await db.query(sql, [
//     data.lesson_id,
//     data.meeting_platform,
//     data.meeting_link,
//     data.meeting_password || null,
//     data.start_time,
//     data.end_time || null,
//     data.created_by,
//     data.updated_by
//   ]);

//   return result.insertId;
// };

exports.createLiveSession = async (
  connection,
  data
) => {

  const sql = `
        INSERT INTO tbl_live_sessions (
            lesson_id,
            meeting_platform,
            meeting_link,
            meeting_password,
            start_time,
            end_time,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await connection.query(
    sql,
    [
      data.lesson_id,
      data.meeting_platform,
      data.meeting_link,
      data.meeting_password || null,
      data.start_time,
      data.end_time || null,
      data.created_by,
      data.updated_by
    ]
  );

  return result.insertId;
};

exports.getLessonTrainingDetails = async (
  connection,
  lessonId
) => {

  const sql = `
        SELECT
            l.lesson_id,
            l.lesson_title,

            t.training_id,
            t.training_title

        FROM tbl_training_lessons l

        INNER JOIN tbl_training_topics tp
            ON tp.topic_id = l.topic_id

        INNER JOIN tbl_trainings t
            ON t.training_id = tp.training_id

        WHERE l.lesson_id = ?
    `;

  const [rows] = await connection.query(
    sql,
    [lessonId]
  );

  return rows[0];
};

// Get live session by lesson ID
exports.getLiveSessionByLessonId = async (lessonId) => {
  const sql = `
    SELECT
      live_session_id,
      lesson_id,
      meeting_platform,
      meeting_link,
      meeting_password,
      start_time,
      end_time,
      session_status,
      cancelled_at,
      cancelled_by,
      created_by,
      updated_by,
      created_at,
      updated_at
    FROM tbl_live_sessions
    WHERE lesson_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [lessonId]);

  return rows[0];
};

exports.getUpcomingLiveSessionsForStudent = async (userId) => {
  const sql = `
    SELECT DISTINCT
      ls.live_session_id,
      ls.lesson_id,
      l.lesson_title,
      t.training_id,
      t.training_title,
      ls.meeting_platform,
      ls.meeting_link,
      ls.start_time,
      ls.end_time
    FROM tbl_live_sessions ls
    INNER JOIN tbl_training_lessons l
      ON l.lesson_id = ls.lesson_id
    INNER JOIN tbl_training_topics tt
      ON tt.topic_id = l.topic_id
    INNER JOIN tbl_trainings t
      ON t.training_id = tt.training_id
    INNER JOIN tbl_enrollments e
      ON e.training_id = t.training_id
    WHERE e.user_id = ?
      AND e.enroll_status = 'A'
      AND l.lesson_content_type = 'live'
      AND ls.session_status = 'SCHEDULED'
      AND COALESCE(ls.end_time, DATE_ADD(ls.start_time, INTERVAL 2 HOUR)) > NOW()
    ORDER BY ls.start_time ASC
  `;

  const [rows] = await db.query(sql, [userId]);

  return rows;
};

exports.getActiveLiveSessionByLessonId = async (connection, lessonId) => {
    const sql = `
        SELECT *
        FROM tbl_live_sessions
        WHERE lesson_id = ?
        AND session_status = 'SCHEDULED'
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [lessonId]);

    return rows[0] || null;
};

// Update live session
// exports.updateLiveSession = async (lessonId, data) => {
//   const sql = `
//     UPDATE tbl_live_sessions
//     SET
//       meeting_platform = ?,
//       meeting_link = ?,
//       meeting_password = ?,
//       start_time = ?,
//       end_time = ?,
//       updated_by = ?
//     WHERE lesson_id = ?
//   `;

//   const [result] = await db.query(sql, [
//     data.meeting_platform,
//     data.meeting_link,
//     data.meeting_password || null,
//     data.start_time,
//     data.end_time || null,
//     data.updated_by,
//     lessonId
//   ]);

//   return result.affectedRows;
// };

exports.updateLiveSession = async (connection, lessonId, data) => {
  const sql = `
    UPDATE tbl_live_sessions
    SET
      meeting_platform = ?,
      meeting_link = ?,
      meeting_password = ?,
      start_time = ?,
      end_time = ?,
      session_status = 'SCHEDULED',
      cancelled_at = NULL,
      cancelled_by = NULL,
      updated_by = ?
    WHERE lesson_id = ?
  `;

  const [result] = await connection.query(sql, [
    data.meeting_platform,
    data.meeting_link,
    data.meeting_password || null,
    data.start_time,
    data.end_time || null,
    data.updated_by,
    lessonId
  ]);

  return result.affectedRows;
};

// Delete live session
exports.deleteLiveSession = async (connection, lessonId) => {
  const sql = `
    DELETE FROM tbl_live_sessions
    WHERE lesson_id = ?
  `;

  const [result] = await connection.query(sql, [lessonId]);

  return result.affectedRows;
};


// Get lesson details
// exports.getLessonForLiveSession = async (lessonId) => {
//   const sql = `
//     SELECT
//       l.lesson_id,
//       l.lesson_content_type,
//       l.lesson_title,
//       t.topic_id,
//       t.training_id
//     FROM tbl_training_lessons l
//     INNER JOIN tbl_training_topics t
//       ON l.topic_id = t.topic_id
//     WHERE l.lesson_id = ?
//     LIMIT 1
//   `;

//   const [rows] = await db.query(sql, [lessonId]);

//   return rows[0];
// };

exports.getLessonForLiveSession = async (lessonId) => {

  const sql = `
        SELECT
            l.lesson_id,
            l.lesson_title,
            l.lesson_content_type,

            tt.topic_id,
            tt.topic_title,

            t.training_id,
            t.training_title

        FROM tbl_training_lessons l

        INNER JOIN tbl_training_topics tt
            ON l.topic_id = tt.topic_id

        INNER JOIN tbl_trainings t
            ON tt.training_id = t.training_id

        WHERE l.lesson_id = ?
    `;

  const [rows] = await db.query(sql, [lessonId]);

  return rows[0] || null;
};

// Get enrolled students for a training
// exports.getEnrolledStudentsForLiveSession = async (trainingId) => {
//   const sql = `
//     SELECT
//       u.user_id,
//       u.user_full_name,
//       u.user_email
//     FROM tbl_enrollments e
//     INNER JOIN tbl_users u
//       ON e.user_id = u.user_id
//     WHERE e.training_id = ?
//       AND e.enroll_status = 'A'
//   `;

//   const [rows] = await db.query(sql, [trainingId]);

//   return rows;
// };

exports.getEnrolledStudentsForLiveSession = async (connection, trainingId) => {
  const sql = `
    SELECT
      u.user_id,
      u.user_full_name,
      u.user_email
    FROM tbl_enrollments e
    INNER JOIN tbl_users u
      ON e.user_id = u.user_id
    WHERE e.training_id = ?
      AND e.enroll_status = 'A'
  `;

  const [rows] = await connection.query(sql, [trainingId]);

  return rows;
};

exports.cancelLiveSession = async (
    connection,
    lessonId,
    cancelledBy
) => {
    const sql = `
        UPDATE tbl_live_sessions
        SET
            session_status = 'CANCELLED',
            cancelled_at = NOW(),
            cancelled_by = ?,
            updated_by = ?
        WHERE lesson_id = ?
    `;

    const [result] = await connection.query(sql, [
        cancelledBy,
        cancelledBy,
        lessonId
    ]);

    return result.affectedRows;
};