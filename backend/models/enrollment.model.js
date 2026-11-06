const db = require("./db");

/* STUDENT */
/* CREATE ENROLLMENT */
exports.checkUserActive = async (
  connection,
  userId
) => {

  const sql = `
        SELECT user_id
        FROM tbl_users
        WHERE user_id = ?
        AND CAST(is_active AS UNSIGNED)=1
    `;

  const [rows] =
    await connection.query(sql, [userId]);

  return rows[0];
};

exports.checkTrainingExists = async (
  connection,
  trainingId
) => {

  const sql = `
        SELECT training_id, training_title, training_start_date, training_status, publish_status,
        enrollment_status
        FROM tbl_trainings
        WHERE training_id=?
    `;

  const [rows] =
    await connection.query(sql, [trainingId]);

  return rows[0];
};

// Previous 
exports.checkEnrollmentExists = async (
  connection,
  userId,
  trainingId
) => {

  const sql = `
        SELECT enroll_id
        FROM tbl_enrollments
        WHERE user_id=?
        AND training_id=?
    `;

  const [rows] =
    await connection.query(sql, [
      userId,
      trainingId
    ]);

  return rows[0];
};

/* New - which will check if enrollment status is pending or approved
if so then user will not be allowed to have another enrollment */
// exports.checkEnrollmentExists = async (
//   connection,
//   userId,
//   trainingId
// ) => {

//   const sql = `
//         SELECT enroll_id
//         FROM tbl_enrollments
//         WHERE user_id = ?
//         AND training_id = ?
//         AND enroll_status IN ('P', 'A')
//         LIMIT 1
//     `;

//   const [rows] = await connection.query(
//     sql,
//     [userId, trainingId]
//   );

//   return rows[0];
// };

exports.insertEnrollment = async (
  connection,
  enrollment
) => {

  const sql = `
        INSERT INTO tbl_enrollments
        (
            user_id,
            training_id,
            enroll_postal_address,
            enroll_qualification,
            created_by,
            updated_by
        )
          VALUES (?,?,?,?,?,?)
    `;

  const [result] =
    await connection.query(sql, [
      enrollment.user_id,
      enrollment.training_id,
      enrollment.enroll_postal_address,
      enrollment.enroll_qualification,
      enrollment.created_by,
      enrollment.updated_by
    ]);

  return result.insertId;
};

/* GET STUDENT ENROLLMENTS - FOR STUDENT DASHBOARD */
// exports.getEnrollmentsModel = async (userId) => {

//   const sql =
//     // `

//     //     SELECT

//     //         e.enroll_id,
//     //         e.enroll_status,

//     //         t.training_id,
//     //         t.training_title,
//     //         t.training_description,
//     //         t.training_thumbnail,
//     //         t.training_duration_hours,

//     //         c.course_name,
//     //         c.course_level

//     //     FROM tbl_enrollments e

//     //     INNER JOIN tbl_trainings t
//     //         ON e.training_id = t.training_id

//     //     INNER JOIN tbl_courses c
//     //         ON t.course_id = c.course_id

//     //     INNER JOIN tbl_users u
//     //         ON e.user_id = u.user_id

//     //     WHERE
//     //         e.user_id = ?
//     //         AND CAST(u.is_active AS UNSIGNED) = 1

//     //     ORDER BY e.created_at DESC
//     // `

//     `
//     SELECT

//     e.enroll_id,
//     e.enroll_status,

//     t.training_id,
//     t.training_title,
//     t.training_description,
//     t.training_thumbnail,
//     t.training_duration_hours,

//     c.course_name,
//     c.course_level,

//     GROUP_CONCAT(
//         DISTINCT iu.user_full_name
//         ORDER BY iu.user_full_name
//         SEPARATOR ', '
//     ) AS instructor_names

// FROM tbl_enrollments e

// INNER JOIN tbl_trainings t
//     ON e.training_id = t.training_id

// INNER JOIN tbl_courses c
//     ON t.course_id = c.course_id

// INNER JOIN tbl_users u
//     ON e.user_id = u.user_id

// LEFT JOIN tbl_training_instructors ti
//     ON t.training_id = ti.training_id

// LEFT JOIN tbl_instructors i
//     ON ti.instructor_id = i.instructor_id

// LEFT JOIN tbl_users iu
//     ON i.user_id = iu.user_id

// WHERE
//     e.user_id = ?
//     AND CAST(u.is_active AS UNSIGNED) = 1
//     AND e.enroll_status = 'A'

// GROUP BY
//     e.enroll_id,
//     e.enroll_status,
//     t.training_id,
//     t.training_title,
//     t.training_description,
//     t.training_thumbnail,
//     t.training_duration_hours,
//     c.course_name,
//     c.course_level

// ORDER BY
//     e.created_at DESC
//     `
//     ;

//   const [rows] = await db.query(sql, [userId]);

//   return rows;

// };



/* /* GET STUDENT ENROLLMENTS - FOR STUDENT DASHBOARD- OPTIMIZED */
exports.getEnrollmentsModel = async (userId) => {

  //  AND e.enroll_status = 'A' - Removed this line - all courses will be visible- we will blur the Pending courses, and rejected will have rejected batch.
  const sql =
    `
    SELECT

    e.enroll_id,
    e.enroll_status,

    t.training_id,
    t.training_title,
    t.training_description,
    t.training_thumbnail,
    t.training_duration_hours,
    t.training_start_date,

    c.course_name,
    c.course_level,

    GROUP_CONCAT(
        DISTINCT iu.user_full_name
        ORDER BY iu.user_full_name
        SEPARATOR ', '
    ) AS instructor_names,

    COUNT(
        DISTINCT tl.lesson_id
    ) AS total_lessons,

    COUNT(
        DISTINCT CASE
            WHEN lp.lesson_progress_completed = TRUE
            THEN tl.lesson_id
        END
    ) AS completed_lessons

FROM tbl_enrollments e

INNER JOIN tbl_trainings t
    ON e.training_id = t.training_id

INNER JOIN tbl_courses c
    ON t.course_id = c.course_id

INNER JOIN tbl_users u
    ON e.user_id = u.user_id

LEFT JOIN tbl_training_instructors ti
    ON t.training_id = ti.training_id

LEFT JOIN tbl_instructors i
    ON ti.instructor_id = i.instructor_id

LEFT JOIN tbl_users iu
    ON i.user_id = iu.user_id

LEFT JOIN tbl_training_topics tt
    ON t.training_id = tt.training_id

LEFT JOIN tbl_training_lessons tl
    ON tt.topic_id = tl.topic_id
    AND tl.lesson_content_type <> 'live'

LEFT JOIN tbl_lesson_progress lp
    ON lp.lesson_id = tl.lesson_id
    AND lp.user_id = e.user_id

WHERE
    e.user_id = ?
    AND CAST(u.is_active AS UNSIGNED) = 1
   

GROUP BY
    e.enroll_id,
    e.enroll_status,
    t.training_id,
    t.training_title,
    t.training_description,
    t.training_thumbnail,
    t.training_duration_hours,
    c.course_name,
    c.course_level

ORDER BY
    e.created_at DESC
    `
    ;

  const [rows] = await db.query(sql, [userId]);

  rows.forEach((row) => {

    row.progress_percent =
      row.total_lessons > 0
        ? Math.round(
          (row.completed_lessons /
            row.total_lessons) * 100
        )
        : 0;
  });

  return rows;

};

// GET ENROLLED COURSE ALL DETAILS - TRAINING, COURSE NAME, INSTRUCTOR, BOOKS, TOPICS, LESSON.
// Calling it training cause- student has enrolled in the training not course.
exports.getEnrolledTrainingingDetailsModel = async (trainingId, userId) => {
  const connection =
    await db;

  // 1. Check if course/training exists first
  const training =
    await getTrainingDetails(
      connection,
      trainingId
    );

  if (!training || !training.training_id) {
    const error = new Error("Course not available");
    error.statusCode = 404;
    error.errorType = "COURSE_NOT_AVAILABLE";
    throw error;
  }

  // 2. Check student enrollment status for this training
  const enrollment =
    await checkEnrollment(
      connection,
      trainingId,
      userId
    );

  if (!enrollment) {
    const [pendingRows] = await connection.query(
      `
      SELECT enroll_id, enroll_status
      FROM tbl_enrollments
      WHERE training_id = ?
      AND user_id = ?
      ORDER BY enroll_id DESC
      LIMIT 1
      `,
      [trainingId, userId]
    );

    if (pendingRows[0] && pendingRows[0].enroll_status === 'P') {
      const error = new Error("Your enrollment for this course is pending approval");
      error.statusCode = 403;
      error.errorType = "ENROLLMENT_PENDING";
      error.trainingTitle = training.training_title;
      throw error;
    }

    const error = new Error("You are not enrolled in this course");
    error.statusCode = 403;
    error.errorType = "NOT_ENROLLED";
    error.trainingTitle = training.training_title;
    throw error;
  }

  // Keep approved enrollments from receiving course contents before the scheduled start date.
  if (
    training.training_start_date &&
    new Date(training.training_start_date) > new Date()
  ) {
    const error = new Error("This course has not started yet");
    error.statusCode = 403;
    error.errorType = "COURSE_NOT_STARTED";
    error.trainingTitle = training.training_title;
    error.trainingStartDate = training.training_start_date;
    throw error;
  }

  const progress =
    await getTrainingCompletionPercentage(
      userId,
      trainingId
    );

  training.progress_percent =
    progress.progressPercent;

  training.total_lessons =
    progress.totalLessons;

  training.completed_lessons =
    progress.completedLessons;

  const books =
    await getTrainingBooks(
      connection,
      trainingId
    );

  const topics =
    await getTrainingTopics(
      connection,
      trainingId
    );

  const lessons =
    await getTrainingLessons(
      connection,
      trainingId,
      userId
    );

  const topicsWithLessons =
    topics.map((topic) => ({
      ...topic,
      lessons: lessons.filter(
        (lesson) =>
          lesson.topic_id ===
          topic.topic_id
      ),
    }));

  return {
    ...training,
    books,
    topics: topicsWithLessons,
  };
};

const checkEnrollment = async (
  connection,
  trainingId,
  userId
) => {

  const [rows] =
    await connection.query(
      `
      SELECT enroll_id
      FROM tbl_enrollments
      WHERE training_id = ?
      AND user_id = ?
      AND enroll_status = 'A'
      `,
      [trainingId, userId]
    );

  return rows[0];
};

const getTrainingDetails = async (
  connection,
  trainingId
) => {

  const [rows] =
    await connection.query(
      `
      SELECT

        t.training_id,
        t.training_title,
        t.training_description,
        t.training_thumbnail,
        t.training_duration_hours,
        t.training_mode,
        t.training_fee,
        t.training_start_date,
        t.training_end_date,
        t.training_exam_name,
        t.training_exam_frequency,

        c.course_id,
        c.course_name,
        c.course_level,
        c.course_code,

        GROUP_CONCAT(
          DISTINCT u.user_full_name
          SEPARATOR ', '
        ) AS instructor_names

      FROM tbl_trainings t

      INNER JOIN tbl_courses c
        ON t.course_id = c.course_id

      LEFT JOIN tbl_training_instructors ti
        ON t.training_id = ti.training_id

      LEFT JOIN tbl_instructors i
        ON ti.instructor_id =
           i.instructor_id

      LEFT JOIN tbl_users u
        ON i.user_id = u.user_id

      WHERE t.training_id = ?

      GROUP BY t.training_id
      `,
      [trainingId]
    );

  return rows[0];
};

const getTrainingBooks = async (
  connection,
  trainingId
) => {

  const [rows] =
    await connection.query(
      `
      SELECT
        training_book_id,
        tb_book_name,
        tb_book_chapters
      FROM tbl_training_books
      WHERE training_id = ?
      ORDER BY training_book_id
      `,
      [trainingId]
    );

  return rows;
};

const getTrainingTopics = async (
  connection,
  trainingId
) => {

  const [rows] =
    await connection.query(
      `
      SELECT
        topic_id,
        topic_title,
        topic_description,
        topic_recording_count,
        topic_display_order
      FROM tbl_training_topics
      WHERE training_id = ?
      ORDER BY topic_display_order
      `,
      [trainingId]
    );

  return rows;
};

/* INCLUDED LESSON PROGRESS */
const getTrainingLessons = async (
  connection,
  trainingId,
  userId
) => {

  const [rows] =
    await connection.query(
      // `
      // SELECT

      //   tt.topic_id,

      //   tl.lesson_id,
      //   tl.lesson_title,
      //   tl.lesson_duration,
      //   tl.lesson_content_type,
      //   tl.lesson_video_url,
      //   tl.lesson_order,
      //   tl.lesson_is_free_preview

      // FROM tbl_training_topics tt

      // INNER JOIN tbl_training_lessons tl
      //   ON tt.topic_id = tl.topic_id

      // WHERE tt.training_id = ?

      // ORDER BY
      //   tt.topic_display_order,
      //   tl.lesson_order
      // `

      `
      SELECT

    tt.topic_id,

    tl.lesson_id,
    tl.lesson_title,
    tl.lesson_duration,
    tl.lesson_content_type,
    tl.lesson_video_url,
    tl.lesson_order,
    tl.lesson_is_free_preview,

    COALESCE(
      lp.lesson_progress_completed,
      0
    ) AS lesson_completed,

    COALESCE(
      lp.lesson_progress_percentage,
      0
    ) AS lesson_progress_percentage,

    COALESCE(
      lp.lesson_progress_last_watch_seconds,
      0
    ) AS lesson_last_watch_seconds,

    lp.lesson_completed_at,

    q.quiz_id,
    q.quiz_duration_minutes
    -- q.quiz_passing_percentage,
    -- q.quiz_allowed_attempts,
    -- q.quiz_instructions,
    -- q.quiz_start_datetime,
    -- q.quiz_end_datetime

FROM tbl_training_topics tt

INNER JOIN tbl_training_lessons tl
  ON tt.topic_id = tl.topic_id

LEFT JOIN tbl_quizzes q
  ON q.lesson_id = tl.lesson_id

LEFT JOIN tbl_lesson_progress lp
  ON lp.lesson_id = tl.lesson_id
  AND lp.user_id = ?

WHERE tt.training_id = ?

ORDER BY
  tt.topic_display_order,
  tl.lesson_order`
      ,
      [userId, trainingId]
    );

  return rows;
};

/* TRAINING COMPLETION PERCENTAGE */
// const getTrainingCompletionPercentage = async (
//   userId,
//   trainingId
// ) => {

//   const [[totalResult]] = await db.query(
//     `
//     SELECT COUNT(*) AS total_lessons
//     FROM tbl_training_lessons l
//     JOIN tbl_training_topics t
//       ON l.topic_id = t.topic_id
//     WHERE t.training_id = ?
//     `,
//     [trainingId]
//   );

//   const [[completedResult]] = await db.query(
//     `
//     SELECT COUNT(*) AS completed_lessons
//     FROM tbl_lesson_progress lp
//     JOIN tbl_training_lessons l
//       ON lp.lesson_id = l.lesson_id
//     JOIN tbl_training_topics t
//       ON l.topic_id = t.topic_id
//     WHERE lp.user_id = ?
//       AND t.training_id = ?
//       AND lp.lesson_progress_completed = TRUE
//     `,
//     [userId, trainingId]
//   );

//   const totalLessons =
//     Number(totalResult.total_lessons);

//   const completedLessons =
//     Number(completedResult.completed_lessons);

//   const progressPercent =
//     totalLessons > 0
//       ? Math.round(
//         (completedLessons /
//           totalLessons) * 100
//       )
//       : 0;

//   return {
//     totalLessons,
//     completedLessons,
//     progressPercent
//   };
// };

const getTrainingCompletionPercentage = async (
  userId,
  trainingId
) => {

  const [[totalResult]] = await db.query(
    `
    SELECT COUNT(*) AS total_lessons
    FROM tbl_training_lessons l
    JOIN tbl_training_topics t
      ON l.topic_id = t.topic_id
    WHERE t.training_id = ?
      AND l.lesson_content_type != 'live'
    `,
    [trainingId]
  );

  const [[completedResult]] = await db.query(
    `
    SELECT COUNT(*) AS completed_lessons
    FROM tbl_lesson_progress lp
    JOIN tbl_training_lessons l
      ON lp.lesson_id = l.lesson_id
    JOIN tbl_training_topics t
      ON l.topic_id = t.topic_id
    WHERE lp.user_id = ?
      AND t.training_id = ?
      AND lp.lesson_progress_completed = TRUE
      AND l.lesson_content_type != 'live'
    `,
    [userId, trainingId]
  );

  const totalLessons =
    Number(totalResult.total_lessons);

  const completedLessons =
    Number(completedResult.completed_lessons);

  const progressPercent =
    totalLessons > 0
      ? Math.round(
        (completedLessons / totalLessons) * 100
      )
      : 0;

  return {
    totalLessons,
    completedLessons,
    progressPercent
  };
};


// Students on instructor -> Manage courses
exports.getStudentsByTrainingIdModel = async (trainingId) => {
  const [rows] = await db.query(
    `
        SELECT
            e.enroll_id,
            e.enroll_status,
            e.enroll_qualification,
            e.enroll_postal_address,

            u.user_id,
            u.user_full_name,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,

            e.created_at AS joined_date
        FROM tbl_enrollments e
        INNER JOIN tbl_users u
            ON e.user_id = u.user_id
        WHERE e.training_id = ?
        AND e.enroll_status = 'A'
        ORDER BY u.user_full_name ASC
        `,
    [trainingId]
  );

  return rows;
};

/* Previous which was not including other instructors */
// exports.getInstructorStudentEnrollmentsModel = async (instructorId) => {
//     const [rows] = await db.query(
//         `
//         SELECT
//             e.enroll_id,
//             e.enroll_status,
//             e.created_at,

//             e.created_by,
//             e.updated_by,

//             u.user_id,
//             u.username,
//             u.user_full_name,
//             u.user_email,
//             u.user_mobile_no,

//             e.enroll_qualification,
//             e.enroll_postal_address,

//             t.training_id,
//             t.training_title,

//             c.course_id,
//             c.course_name,

//             eu.user_full_name AS created_by_name,
//             uu.user_full_name AS updated_by_name,

//             GROUP_CONCAT(
//                 DISTINCT iu.user_full_name
//                 ORDER BY iu.user_full_name
//                 SEPARATOR ', '
//             ) AS instructor_names

//         FROM tbl_enrollments e

//         INNER JOIN tbl_users u
//             ON e.user_id = u.user_id

//         LEFT JOIN tbl_users eu
//             ON e.created_by = eu.user_id

//         LEFT JOIN tbl_users uu
//             ON e.updated_by = uu.user_id

//         INNER JOIN tbl_trainings t
//             ON e.training_id = t.training_id

//         LEFT JOIN tbl_courses c
//             ON t.course_id = c.course_id

//         INNER JOIN tbl_training_instructors ti
//             ON t.training_id = ti.training_id

//         LEFT JOIN tbl_instructors i
//             ON ti.instructor_id = i.instructor_id

//         LEFT JOIN tbl_users iu
//             ON i.user_id = iu.user_id

//         WHERE ti.instructor_id = ?
//           AND e.enroll_status = 'A'

//         GROUP BY
//             e.enroll_id,
//             e.enroll_status,
//             e.created_at,
//             e.created_by,
//             e.updated_by,

//             u.user_id,
//             u.username,
//             u.user_full_name,
//             u.user_email,
//             u.user_mobile_no,

//             e.enroll_qualification,
//             e.enroll_postal_address,

//             t.training_id,
//             t.training_title,

//             c.course_id,
//             c.course_name,

//             eu.user_full_name,
//             uu.user_full_name

//         ORDER BY e.created_at DESC
//         `,
//         [instructorId]
//     );

//     return rows;
// };

/* Get student enrollments for a specific instructor-
also other instructors, and loggged in user as You */
exports.getInstructorStudentEnrollmentsModel = async (instructorId) => {
    const [rows] = await db.query(
        `
        SELECT 
            e.enroll_id,
            e.enroll_status,
            e.created_at,
            e.updated_at,

            e.created_by,
            e.updated_by,

            u.user_id,
            u.username,
            u.user_full_name,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,

            CAST(u.is_active AS UNSIGNED) AS is_active,

            e.enroll_qualification,
            e.enroll_postal_address,

            t.training_id,
            t.training_title,

            c.course_id,
            c.course_name,
            c.course_level,

            eu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name,

            instructors.instructor_names

        FROM tbl_enrollments e

        INNER JOIN tbl_users u
            ON e.user_id = u.user_id

        LEFT JOIN tbl_users eu
            ON e.created_by = eu.user_id

        LEFT JOIN tbl_users uu
            ON e.updated_by = uu.user_id

        INNER JOIN tbl_trainings t
            ON e.training_id = t.training_id

        LEFT JOIN tbl_courses c
            ON t.course_id = c.course_id

        /*
         * Get all instructors for each training.
         * Logged-in instructor is displayed as "You"
         * and is always placed first.
         */
        LEFT JOIN (
            SELECT
                ti.training_id,

                GROUP_CONCAT(
                    DISTINCT
                    CASE
                        WHEN ti.instructor_id = ? THEN 'You'
                        ELSE iu.user_full_name
                    END
                    ORDER BY
                        CASE
                            WHEN ti.instructor_id = ? THEN 0
                            ELSE 1
                        END,
                        iu.user_full_name
                    SEPARATOR ', '
                ) AS instructor_names

            FROM tbl_training_instructors ti

            LEFT JOIN tbl_instructors i
                ON ti.instructor_id = i.instructor_id

            LEFT JOIN tbl_users iu
                ON i.user_id = iu.user_id

            GROUP BY ti.training_id
        ) instructors
            ON instructors.training_id = t.training_id

        WHERE e.enroll_status = 'A'

          /*
           * Only return students from trainings
           * assigned to the logged-in instructor.
           */
          AND EXISTS (
              SELECT 1
              FROM tbl_training_instructors current_ti
              WHERE current_ti.training_id = t.training_id
                AND current_ti.instructor_id = ?
          )

        ORDER BY e.created_at DESC
        `,
        [instructorId, instructorId, instructorId]
    );

    return rows;
};

/* ADMIN */
/* GET ALL STUDENT ENROLLMENTS - ADMIN */
exports.getAllStudentsEnrollmentsModel = async () => {

  const sql = `
        SELECT

            e.enroll_id,
            e.enroll_status,
            e.created_at,
            e.updated_at,

            e.created_by,
            e.updated_by,

            u.user_id,
            u.user_full_name,
            u.username,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,

            e.enroll_postal_address,
            e.enroll_qualification,

            t.training_id,
            t.training_title,

            c.course_id,
            c.course_name,
            c.course_level,

            eu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name,

            CAST(u.is_active AS UNSIGNED) AS is_active,

            GROUP_CONCAT(
                DISTINCT iu.user_full_name
                ORDER BY iu.user_full_name
                SEPARATOR ', '
            ) AS instructor_names

        FROM tbl_enrollments e

        INNER JOIN tbl_users u
            ON e.user_id = u.user_id

        LEFT JOIN tbl_users eu
            ON eu.user_id = e.created_by
            
        LEFT JOIN tbl_users uu
            ON uu.user_id = e.updated_by     

        INNER JOIN tbl_trainings t
            ON e.training_id = t.training_id

        INNER JOIN tbl_courses c
            ON t.course_id = c.course_id

        LEFT JOIN tbl_training_instructors ti
            ON t.training_id = ti.training_id

        LEFT JOIN tbl_instructors i
            ON ti.instructor_id = i.instructor_id

        LEFT JOIN tbl_users iu
            ON i.user_id = iu.user_id

        GROUP BY

            e.enroll_id,
            e.enroll_status,
            e.created_at,

            u.user_id,
            u.user_full_name,
            u.username,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,
            u.is_active,

            e.enroll_postal_address,
            e.enroll_qualification,

            t.training_id,
            t.training_title,

            c.course_id,
            c.course_name,
            c.course_level

        ORDER BY e.created_at DESC
    `;

  const [rows] = await db.query(sql);

  return rows;

};




/* GET ENROLLMENT BY ID - ADMIN */
exports.getEnrollmentByIdModel = async (enrollId) => {

  const sql = `
        SELECT

            e.enroll_id,
            e.enroll_status,
            e.enroll_postal_address,
            e.enroll_qualification,
            e.created_at,

            u.user_id,
            u.user_full_name,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,

            t.training_id,
            t.training_title,
            t.training_description,
            t.training_duration_hours,
            t.training_thumbnail,

            c.course_id,
            c.course_name,
            c.course_level,

            GROUP_CONCAT(
                DISTINCT iu.user_full_name
                ORDER BY iu.user_full_name
                SEPARATOR ', '
            ) AS instructor_names

        FROM tbl_enrollments e

        INNER JOIN tbl_users u
            ON e.user_id = u.user_id

        INNER JOIN tbl_trainings t
            ON e.training_id = t.training_id

        INNER JOIN tbl_courses c
            ON t.course_id = c.course_id

        LEFT JOIN tbl_training_instructors ti
            ON t.training_id = ti.training_id

        LEFT JOIN tbl_instructors i
            ON ti.instructor_id = i.instructor_id

        LEFT JOIN tbl_users iu
            ON i.user_id = iu.user_id

        WHERE e.enroll_id = ?

        GROUP BY

            e.enroll_id,
            e.enroll_status,
            e.enroll_postal_address,
            e.enroll_qualification,
            e.created_at,

            u.user_id,
            u.user_full_name,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,

            t.training_id,
            t.training_title,
            t.training_description,
            t.training_duration_hours,
            t.training_thumbnail,

            c.course_id,
            c.course_name,
            c.course_level
    `;

  const [rows] = await db.query(sql, [enrollId]);

  return rows[0];

};

/* GET ENROLLMENT DETAILS FOR NOTIFICATION */
exports.getEnrollmentDetailsForNotification = async (
  connection,
  enrollId
) => {

  const sql = `
    SELECT
      e.enroll_id,
      e.user_id,
      e.training_id,
      t.training_title,
      u.user_email,
      u.user_full_name
    FROM tbl_enrollments e
    INNER JOIN tbl_trainings t
      ON e.training_id = t.training_id
    INNER JOIN tbl_users u
      ON e.user_id = u.user_id
    WHERE e.enroll_id = ?
    LIMIT 1
  `;

  const [rows] = await connection.query(
    sql,
    [enrollId]
  );

  return rows.length > 0 ? rows[0] : null;
};

/* UPDATE STATUS - APPROVED/REJECT */
exports.updateEnrollmentStatusModel = async (
  connection,
  enrollId,
  enrollStatus,
  updatedBy
) => {

  const sql = `
        UPDATE tbl_enrollments
        SET
            enroll_status = ?,
            updated_by = ?
        WHERE enroll_id = ?
    `;

  const [result] = await connection.query(
    sql,
    [
      enrollStatus,
      updatedBy,
      enrollId
    ]
  );

  return result.affectedRows > 0;

};
