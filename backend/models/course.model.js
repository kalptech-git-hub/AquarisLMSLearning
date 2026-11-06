// course.model.js
const db = require("./db");
const { getTopicsByTrainingIDModel } = require("./topic.model");
require("dotenv").config();

/* COURSE CREATION ONLY */
exports.createCourseModel = async ({
  course_code,
  course_name,
  course_level,
  created_by,
  updated_by
}) => {

  // const checkSql = `
  //       SELECT course_id
  //       FROM tbl_courses
  //       WHERE course_code = ?
  //   `;

  // const [existingCourse] = await db.query(checkSql, [
  //   course_code
  // ]);

  // if (existingCourse.length > 0) {
  //   // throw new Error("Course code already exists.");
  //   const error = new Error("Course code already exists");
  //   error.code = "DUPLICATE_ENTRY";
  //   throw error;
  // }

  const checkSql = `
    SELECT
        course_id,
        course_code,
        course_name
    FROM tbl_courses
    WHERE course_code = ?
       OR course_name = ?
`;

  const [existingCourse] = await db.query(
    checkSql,
    [course_code, course_name]
  );

  if (existingCourse.length > 0) {

    if (
      existingCourse.some(
        course =>
          course.course_code.toLowerCase() ===
          course_code.toLowerCase()
      )
    ) {
      // const error = new Error("Course code already exists.");
      const error = new Error(
        "Course category code already exists."
      );
      error.code = "DUPLICATE_ENTRY";
      throw error;
    }

    if (
      existingCourse.some(
        course =>
          course.course_name.toLowerCase() ===
          course_name.toLowerCase()
      )
    ) {
      // const error = new Error("Course name already exists.");
      const error = new Error(
        "Course category name already exists."
      );
      error.code = "DUPLICATE_ENTRY";
      throw error;
    }
  }

  const insertQuery = `
        INSERT INTO tbl_courses
        (
            course_code,
            course_name,
            course_level,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, ?, ?)
    `;

  const [result] = await db.query(insertQuery, [
    course_code,
    course_name,
    course_level,
    created_by,
    created_by
  ]);

  return {
    course_id: result.insertId
  };

};

/* COURSE DROPDOWN - TO CREATE TRAINING */
exports.getCourseDropdownModel = async () => {

  const sql = `
        SELECT
            course_id,
            course_name,
            course_code,
            course_level
        FROM tbl_courses
        WHERE is_active = b'1'
        ORDER BY course_name;
    `;

  const [rows] =
    await db.query(sql);

  return rows;

};

/* GET ALL COURSES FOR COURSE TABLE */
exports.getCoursesForCourseTableModel = async () => {

  const sql =
    // `
    //       SELECT
    //           course_id,
    //           course_code,
    //           course_name,
    //           course_level,

    //           created_at,
    //           updated_at,
    //           created_by,
    //           updated_by
    //       FROM tbl_courses
    //       ORDER BY course_name ASC
    //   `

    `
    SELECT
        c.course_id,
        c.course_code,
        c.course_name,
        c.course_level,

        CAST(c.is_active AS UNSIGNED) AS is_active,

        c.created_at,
        c.updated_at,

        cu.user_full_name AS created_by_name,
        uu.user_full_name AS updated_by_name

    FROM tbl_courses c

    LEFT JOIN tbl_users cu
        ON c.created_by = cu.user_id

    LEFT JOIN tbl_users uu
        ON c.updated_by = uu.user_id

    ORDER BY c.course_name ASC;`
    ;

  const [rows] = await db.query(sql);

  return rows;
};

/* GET ALL COURSES */
// exports.fetchAllCourses = async (userId) => {
//   const sql =
//     `SELECT
//     t.training_id,
//     c.course_id,
//     c.course_code,
//     c.course_name,
//     c.course_level,

//     t.training_title,
//     t.training_description,
//     t.training_thumbnail,
//     t.training_exam_name,
//     t.training_exam_frequency,
//     t.training_fee,
//     t.training_duration_hours,
//     t.training_mode,

//     CAST(t.is_active AS UNSIGNED) AS is_active,

//     t.created_at,
//     t.updated_at,

//     t.created_by,
//     t.updated_by,

//     cu.user_full_name AS created_by_name,
//     uu.user_full_name AS updated_by_name,

//     CASE
//         WHEN e.enroll_id IS NULL THEN 0
//         ELSE 1
//     END AS is_enrolled

// FROM tbl_trainings t

// INNER JOIN tbl_courses c
//     ON c.course_id = t.course_id

// LEFT JOIN tbl_users cu
//     ON cu.user_id = t.created_by

// LEFT JOIN tbl_users uu
//     ON uu.user_id = t.updated_by

// LEFT JOIN tbl_enrollments e
//     ON e.training_id = t.training_id
//     AND e.user_id = ?    

// ORDER BY t.training_id DESC;`
//     ;

//   const [courses] = await db.query(sql, [userId]);

//   for (const course of courses) {

//     // Books
//     const [books] = await db.query(
//       `
//       SELECT
//         training_book_id,
//         tb_book_name,
//         tb_book_chapters
//       FROM tbl_training_books
//       WHERE training_id = ?
//       `,
//       [course.training_id]
//     );

//     // Instructors
//     const [instructors] = await db.query(
//       // `
//       // SELECT
//       //   i.instructor_id,
//       //   i.instructor_name

//       // FROM tbl_training_instructors ti

//       // INNER JOIN tbl_instructors i
//       //   ON i.instructor_id = ti.instructor_id

//       // WHERE ti.training_id = ?
//       // `

//       `SELECT
//             i.instructor_id,
//             u.user_id,
//             u.user_full_name AS instructor_name

//         FROM tbl_training_instructors ti

//         INNER JOIN tbl_instructors i
//             ON i.instructor_id = ti.instructor_id

//         INNER JOIN tbl_users u
//             ON u.user_id = i.user_id

//         WHERE ti.training_id = ?`,
//       [course.training_id]
//     );

//     // Topics
//     const topics = await getTopicsByTrainingIDModel(
//       course.training_id
//     );

//     course.books = books;
//     course.instructors = instructors;
//     course.topics = topics;
//   }

//   return courses;
// };

/* GET ALL Trainings - OPTIMISED VERSION */
exports.fetchAllTrainingsForLanding = async (userId) => {

  const sql = `
    SELECT
      t.training_id,
      c.course_id,
      c.course_code,
      c.course_name,
      c.course_level,

      t.training_title,
      t.training_description,
      t.training_thumbnail,
      t.training_exam_name,
      t.training_exam_frequency,
      t.training_fee,
      t.training_start_date,
      t.training_end_date,
      t.training_status,
      t.training_duration_hours,
      t.training_mode,
      t.publish_status,
      t.publish_at,
      t.enrollment_status,
      t.enrollment_closed_at,

   CASE
    WHEN (
        t.training_start_date <= NOW()
        AND t.training_start_date >= DATE_SUB(NOW(), INTERVAL 2 DAY)
    )
    OR (
        t.training_start_date > NOW()
        AND t.enrollment_status = 'CLOSED'
        AND t.enrollment_closed_at IS NOT NULL
        AND t.enrollment_closed_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
    )
    THEN 1
    ELSE 0
    END AS enrollment_closed,

    CASE
    WHEN t.publish_at IS NOT NULL
     AND t.publish_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    THEN 1
    ELSE 0
END AS is_new,

    (
        SELECT COUNT(*)
        FROM tbl_enrollments e2
        WHERE e2.training_id = t.training_id
          AND e2.enroll_status = 'A'
    ) AS enrollment_count,

      CAST(t.is_active AS UNSIGNED) AS is_active,

      t.created_at,
      t.updated_at,

      t.created_by,
      t.updated_by,

      cu.user_full_name AS created_by_name,
      uu.user_full_name AS updated_by_name,

      CASE
          WHEN e.enroll_id IS NULL THEN 0
          ELSE 1
      END AS is_enrolled,

      e.enroll_status

    FROM tbl_trainings t

    INNER JOIN tbl_courses c
      ON c.course_id = t.course_id

    LEFT JOIN tbl_users cu
      ON cu.user_id = t.created_by

    LEFT JOIN tbl_users uu
      ON uu.user_id = t.updated_by

    LEFT JOIN tbl_enrollments e
      ON e.training_id = t.training_id
      AND e.user_id = ?

   WHERE t.publish_status = 'PUBLISHED' 
   AND (
      t.training_start_date > NOW()

      OR

      (
          t.training_start_date <= NOW()
          AND t.training_start_date >= DATE_SUB(NOW(), INTERVAL 2 DAY)
      )

      OR

      (
          t.training_start_date > NOW()
          AND t.enrollment_status = 'CLOSED'
          AND t.enrollment_closed_at IS NOT NULL
          AND t.enrollment_closed_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
      )
  )

    -- ORDER BY t.training_id DESC
    ORDER BY 
      t.publish_at DESC,
      t.training_id DESC
  `;

  const [courses] = await db.query(
    sql,
    [userId]
  );

  if (!courses.length) {
    return [];
  }

  const trainingIds =
    courses.map(
      course => course.training_id
    );

  /*
  ==================================
  BOOKS
  ==================================
  */

  const [books] = await db.query(
    `
    SELECT
      training_id,
      training_book_id,
      tb_book_name,
      tb_book_chapters
    FROM tbl_training_books
    WHERE training_id IN (?)
    `,
    [trainingIds]
  );

  const booksMap = {};

  books.forEach(book => {

    if (!booksMap[book.training_id]) {
      booksMap[book.training_id] = [];
    }

    booksMap[book.training_id].push(book);

  });

  /*
  ==================================
  INSTRUCTORS
  ==================================
  */

  const [instructors] = await db.query(
  `
  SELECT
    ti.training_id,
    ti.training_instructor_id,
    ti.created_at AS assigned_at,
    
    i.instructor_id,
    u.user_id,

    u.user_full_name AS instructor_name,
    u.user_profile_photo,
    i.ins_qualification,
    i.ins_experience,
    i.ins_bio

  FROM tbl_training_instructors ti

  INNER JOIN tbl_instructors i
    ON i.instructor_id = ti.instructor_id

  INNER JOIN tbl_users u
    ON u.user_id = i.user_id

  WHERE ti.training_id IN (?)
  `,
  [trainingIds]
);

  const instructorsMap = {};

  instructors.forEach(inst => {

    if (!instructorsMap[inst.training_id]) {
      instructorsMap[inst.training_id] = [];
    }

    instructorsMap[inst.training_id].push(inst);

  });

  /*
  ==================================
  TOPICS
  ==================================
  */

  const [topics] = await db.query(
    `
    SELECT
      topic_id,
      training_id,
      topic_title,
      topic_description,

      (
        SELECT COUNT(*)
        FROM tbl_training_lessons l
        WHERE l.topic_id = t.topic_id
      ) AS topic_recording_count,

      topic_display_order,
      created_at,
      updated_at

    FROM tbl_training_topics t

    WHERE training_id IN (?)

    ORDER BY
      training_id,
      topic_display_order
    `,
    [trainingIds]
  );

  /*
  ==================================
  LESSONS
  ==================================
  */

  const [lessons] = await db.query(
    `
    SELECT

      tt.training_id,
      tt.topic_id,

      tl.lesson_id,
      tl.lesson_title,
      tl.lesson_duration,
      tl.lesson_content_type,
      tl.lesson_video_url,
      tl.lesson_order,
      tl.lesson_is_free_preview

    FROM tbl_training_topics tt

    INNER JOIN tbl_training_lessons tl
      ON tl.topic_id = tt.topic_id

    WHERE tt.training_id IN (?)

    ORDER BY
      tt.training_id,
      tt.topic_display_order,
      tl.lesson_order
    `,
    [trainingIds]
  );

  const lessonsMap = {};

  lessons.forEach(lesson => {

    if (!lessonsMap[lesson.topic_id]) {
      lessonsMap[lesson.topic_id] = [];
    }

    lessonsMap[lesson.topic_id].push(lesson);

  });

  const topicsMap = {};

  topics.forEach(topic => {

    topic.lessons =
      lessonsMap[topic.topic_id] || [];

    if (!topicsMap[topic.training_id]) {
      topicsMap[topic.training_id] = [];
    }

    topicsMap[topic.training_id].push(topic);

  });

  /*
  ==================================
  ATTACH EVERYTHING
  ==================================
  */

  courses.forEach(course => {

    course.books =
      booksMap[course.training_id] || [];

    course.instructors =
      instructorsMap[course.training_id] || [];

    course.topics =
      topicsMap[course.training_id] || [];

  });

  return courses;

};

/* GET COURSE BY ID - ONLY COURSE */
exports.getOnlyCourseByIdModel = async (courseId) => {

  const sql = `
        SELECT
            c.course_id,
            c.course_code,
            c.course_name,
            c.course_level,
            c.is_active,
            c.created_at,
            c.updated_at,

            cu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name

        FROM tbl_courses c

        LEFT JOIN tbl_users cu
            ON c.created_by = cu.user_id

        LEFT JOIN tbl_users uu
            ON c.updated_by = uu.user_id

        WHERE c.course_id = ?
    `;

  const [rows] = await db.query(sql, [courseId]);

  return rows.length ? rows[0] : null;
};

/* CHECK IF COURSE HAS ANY TRAININGS */
exports.checkCourseHasTrainingsModel = async (courseId) => {

  const sql = `
    SELECT training_id
    FROM tbl_trainings
    WHERE course_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [courseId]);

  return rows.length > 0;
};

/* UPDATE COURSE ONLY */
exports.updateCourseOnlyModel = async ({
  courseId,
  course_code,
  course_name,
  course_level,
  updated_by,
}) => {

  // Check duplicate course code
  // const checkSql = `
  //       SELECT course_id
  //       FROM tbl_courses
  //       WHERE course_code = ?
  //         AND course_id <> ?
  //   `;

  // const [existingCourse] = await db.query(checkSql, [
  //   course_code,
  //   courseId,
  // ]);

  // if (existingCourse.length > 0) {
  //   const error = new Error("Course code already exists.");
  //   error.code = "DUPLICATE_ENTRY";
  //   throw error;
  // }

  // Course Code
  const [existingCode] = await db.query(
    `SELECT course_id
     FROM tbl_courses
     WHERE course_code = ?
     AND course_id <> ?`,
    [course_code, courseId]
  );

  if (existingCode.length > 0) {
    // const error = new Error("Course code already exists.");
    const error = new Error("Course category code already exists.");
    error.code = "DUPLICATE_ENTRY";
    throw error;
  }

  // Course Name
  const [existingName] = await db.query(
    `SELECT course_id
     FROM tbl_courses
     WHERE course_name = ?
     AND course_id <> ?`,
    [course_name, courseId]
  );

  if (existingName.length > 0) {
    // const error = new Error("Course name already exists.");
    const error = new Error("Course category name already exists.");
    error.code = "DUPLICATE_ENTRY";
    throw error;
  }

  const sql = `
        UPDATE tbl_courses
        SET
            course_code = ?,
            course_name = ?,
            course_level = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE course_id = ?
    `;

  const [result] = await db.query(sql, [
    course_code,
    course_name,
    course_level,
    updated_by,
    courseId,
  ]);

  if (result.affectedRows === 0) {
    // throw new Error("Course not found.");
    throw new Error("Course category not found.");
  }

  return result;
};



/* PREVIOUSLY USED - WHEN COURSE AND TRAINING WERE COMBINED  */
/* GET COURSE BY ID - ALSO COURSE, TRAINING, BOOKS, INSTRUCTORS */
// exports.getCourseByIdModel = async (courseId) => {

//   // Course + Training
//   const courseSql = `
//         SELECT
//             c.course_id,
//             c.course_code,
//             c.course_name,
//             c.course_level,

//             t.training_id,
//             t.training_title,
//             t.training_description,
//             t.training_thumbnail,
//             t.training_exam_name,
//             t.training_exam_frequency,
//             t.training_fee,
//             t.training_duration_hours,
//             t.training_mode,

//             CAST(t.is_active AS UNSIGNED) AS is_active,

//             t.created_at,
//             t.updated_at,

//             t.created_by,
//             t.updated_by,

//             cu.user_full_name AS created_by_name,
//             uu.user_full_name AS updated_by_name

//         FROM tbl_courses c

//         INNER JOIN tbl_trainings t
//             ON c.course_id = t.course_id

//         LEFT JOIN tbl_users cu
//             ON cu.user_id = t.created_by

//         LEFT JOIN tbl_users uu
//             ON uu.user_id = t.updated_by

//         WHERE c.course_id = ?
//     `;

//   const [courseRows] = await db.query(courseSql, [courseId]);

//   if (courseRows.length === 0) {
//     return null;
//   }

//   const course = courseRows[0];

//   const booksSql = `
//         SELECT
//             tb_book_name,
//             tb_book_chapters
//         FROM tbl_training_books
//         WHERE training_id = ?
//         ORDER BY training_book_id ASC
// `;

//   const [books] = await db.query(
//     booksSql,
//     [course.training_id]
//   );

//   const instructorsSql = `
//         SELECT
//             instructor_id
//         FROM tbl_training_instructors
//         WHERE training_id = ?
//         ORDER BY training_instructor_id ASC
//     `;

//   const [instructors] = await db.query(
//     instructorsSql,
//     [course.training_id]
//   );

//   course.books = books;
//   course.instructors = instructors;

//   return course;
// }

/* CREATE COURSE for combined - COURSE, TRAINING, INSTRUCTOR, BOOKS */
// exports.insertCourse = async (connection, course, created_by, updated_by) => {

//   const checkQuery = `
//     SELECT course_id
//     FROM tbl_courses
//     WHERE course_code = ?
//   `;

//   const [existingCourse] = await connection.query(checkQuery, [
//     course.code
//   ]);

//   if (existingCourse.length > 0) {
//     const error = new Error("Course code already exists");
//     error.code = "DUPLICATE_ENTRY";
//     throw error;
//   }

//   const insertQuery = `
//     INSERT INTO tbl_courses
//     (
//       course_code,
//       course_name,
//       course_level,
//       created_by,
//       updated_by
//     )
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   const [result] = await db.query(insertQuery, [
//     course.code,
//     course.name,
//     course.level,
//     created_by,
//     updated_by
//   ]);

//   return result.insertId;
// };

/* INSERT TRAINING - for combined */
// exports.insertTraining = async (
//   connection,
//   courseId,
//   training,
//   created_by,
//   updated_by
// ) => {

//   const sql = `
//     INSERT INTO tbl_trainings
//     (
//       course_id,
//       training_title,
//       training_description,
//       training_thumbnail,
//       training_exam_name,
//       training_exam_frequency,
//       training_fee,
//       training_duration_hours,
//       training_mode,
//       created_by,
//       updated_by
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const [result] = await connection.query(sql, [
//     courseId,
//     training.title,
//     training.description,
//     "",
//     training.examName,
//     training.examFrequency,
//     training.fee,
//     training.training_duration_hours,
//     training.training_mode,
//     created_by,
//     updated_by
//   ]);

//   return result.insertId;
// };

/* UPDATE COURSE THUMBNAIL - for combined */
// exports.updateTrainingThumbnail = async (
//   connection,
//   trainingId,
//   thumbnailPath
// ) => {

//   const sql = `
//     UPDATE tbl_trainings
//     SET training_thumbnail = ?
//     WHERE training_id = ?
//   `;

//   await connection.query(sql, [
//     thumbnailPath,
//     trainingId
//   ]);

// };

/* INSERT TRAINING BOOKS - for combined */
// exports.insertTrainingBooks = async (
//   connection,
//   trainingId,
//   books,
//   created_by,
//   updated_by
// ) => {

//   const sql = `
//     INSERT INTO tbl_training_books
//     (
//       training_id,
//       tb_book_name,
//       tb_book_chapters,
//       created_by,
//       updated_by
//     )
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   for (const book of books) {

//     await connection.query(sql, [
//       trainingId,
//       book.name,
//       book.chapters || null,
//       created_by,
//       updated_by
//     ]);

//   }

// };

/* INSERTING TRAINING INSTRUCTOR - for combined */
// exports.insertTrainingInstructors = async (
//   connection,
//   trainingId,
//   instructors,
//   created_by,
//   updated_by
// ) => {

//   const sql = `
//     INSERT INTO tbl_training_instructors
//     (
//       training_id,
//       instructor_id,
//       created_by,
//       updated_by
//     )
//     VALUES (?, ?, ?, ?)
//   `;

//   for (const instructorId of instructors) {

//     await connection.query(sql, [
//       trainingId,
//       instructorId,
//       created_by,
//       updated_by
//     ]);

//   }

// };


/* EDIT COURSE --- */
/* UPDATE COURSE ID - for combined */
// exports.updateCourseModel = async (
//   connection,
//   courseId,
//   course,
//   updated_by
// ) => {

//   // Check if another course already has the same course code
//   const checkSql = `
//     SELECT course_id
//     FROM tbl_courses
//     WHERE course_code = ?
//       AND course_id != ?
//   `;

//   const [existingCourse] = await connection.query(checkSql, [
//     course.code,
//     courseId
//   ]);

//   if (existingCourse.length > 0) {
//     throw new Error("Course code already exists.");
//   }

//   const sql = `
//     UPDATE tbl_courses
//     SET
//         course_code = ?,
//         course_name = ?,
//         course_level = ?,
//         updated_by = ?
//     WHERE course_id = ?
//     `;

//   const [result] = await connection.query(sql, [
//     course.code,
//     course.name,
//     course.level,
//     updated_by,
//     courseId
//   ]);

//   return result;
// };

/* FETCH TRAINING ID BY COURSE ID - for combined */
// exports.getTrainingIdByCourseId = async (
//   connection,
//   courseId
// ) => {

//   const sql = `
//     SELECT training_id
//     FROM tbl_trainings
//     WHERE course_id = ?
//     LIMIT 1
//   `;

//   const [rows] = await connection.query(sql, [courseId]);

//   if (rows.length === 0) {
//     throw new Error("Training not found.");
//   }

//   return rows[0].training_id;
// };

/* UPDATING THE TRAINING MODEL - for combined */
// exports.updateTrainingModel = async (
//   connection,
//   trainingId,
//   training,
//   updated_by
// ) => {

//   const sql = `
//     UPDATE tbl_trainings
//     SET
//       training_title = ?,
//       training_description = ?,
//       training_exam_name = ?,
//       training_exam_frequency = ?,
//       training_fee = ?,
//       training_duration_hours = ?,
//       training_mode = ?,
//       updated_by = ?
//     WHERE training_id = ?
//   `;

//   const [result] = await connection.query(sql, [
//     training.title,
//     training.description,
//     training.examName,
//     training.examFrequency,
//     training.fee,
//     training.training_duration_hours,
//     training.training_mode,
//     updated_by,
//     trainingId
//   ]);

//   return result;
// };

/* DELETE TRAINING BOOKS - for combined*/
// exports.deleteTrainingBooks = async (
//   connection,
//   trainingId
// ) => {

//   const sql = `
//     DELETE FROM tbl_training_books
//     WHERE training_id = ?
//   `;

//   await connection.query(sql, [trainingId]);
// };

/* DELETE TRAINING INSTRUCTORS - for combined */
// exports.deleteTrainingInstructors = async (
//   connection,
//   trainingId
// ) => {

//   const sql = `
//     DELETE FROM tbl_training_instructors
//     WHERE training_id = ?
//   `;

//   await connection.query(sql, [trainingId]);
// };

/* GET EXISTING THUMBNAIL PATH - for combined*/
// exports.getTrainingThumbnail = async (
//   connection,
//   trainingId
// ) => {

//   const sql = `
//     SELECT training_thumbnail
//     FROM tbl_trainings
//     WHERE training_id = ?
//   `;

//   const [rows] = await connection.query(sql, [trainingId]);


//   if (rows.length === 0) {
//     throw new Error("Training not found.");
//   }

//   // return rows[0]?.training_thumbnail || "";

//   return rows[0].training_thumbnail;
// };










