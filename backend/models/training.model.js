const db = require("./db");

/* GET TRAINING ID - FOR EDIT - PRELOAD DATA */
exports.getTrainingByIdModel = async (training_id) => {

    // Course + Training
    const trainingSql = `
        SELECT
            c.course_id,
            c.course_code,
            c.course_name,
            c.course_level,

            t.training_id,
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
            t.enrollment_status,

            CASE
    WHEN EXISTS (
        SELECT 1
        FROM tbl_training_topics tt
        INNER JOIN tbl_training_lessons tl
            ON tl.topic_id = tt.topic_id
        WHERE tt.training_id = t.training_id
    )
    THEN 1
    ELSE 0
END AS can_publish,

CAST(t.is_active AS UNSIGNED) AS is_active,

            t.created_at,
            t.updated_at,

            t.created_by,
            t.updated_by,

            cu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name

        FROM tbl_trainings t

        INNER JOIN tbl_courses c
        ON c.course_id = t.course_id

        LEFT JOIN tbl_users cu
            ON cu.user_id = t.created_by

        LEFT JOIN tbl_users uu
            ON uu.user_id = t.updated_by

        WHERE t.training_id = ?
    `;

    const [trainingRows] = await db.query(trainingSql, [training_id]);

    if (trainingRows.length === 0) {
        return null;
    }

    const training = trainingRows[0];

    const booksSql = `
        SELECT
            training_book_id,
            tb_book_name,
            tb_book_chapters
        FROM tbl_training_books
        WHERE training_id = ?
        ORDER BY training_book_id ASC    
`;

    const [books] = await db.query(
        booksSql,
        [training.training_id]
    );

    // const instructorsSql = `
    //     SELECT
    //         instructor_id
    //     FROM tbl_training_instructors
    //     WHERE training_id = ?
    //     ORDER BY training_instructor_id ASC
    // `;

    const instructorsSql = `
        SELECT
            ti.instructor_id,
            u.user_full_name AS instructor_name,
            i.ins_qualification,
            i.ins_experience
        FROM tbl_training_instructors ti

        INNER JOIN tbl_instructors i
            ON ti.instructor_id = i.instructor_id

        INNER JOIN tbl_users u
            ON i.user_id = u.user_id

        WHERE ti.training_id = ?

        ORDER BY ti.training_instructor_id ASC
    `;

    const [instructors] = await db.query(
        instructorsSql,
        [training.training_id]
    );

    training.books = books;
    training.instructors = instructors;

    return training;
};

/* CHECK COURSE EXISTS */
exports.checkCourseExists = async (
    connection,
    courseId
) => {

    const sql = `
        SELECT course_id
        FROM tbl_courses
        WHERE course_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [courseId]
    );

    return rows[0];
};

/* CHECK IF TRAINING TITLE EXISTS */
exports.checkTrainingTitleExists = async (
    connection,
    courseId,
    trainingTitle
) => {

    const sql = `
        SELECT training_id
        FROM tbl_trainings
        WHERE course_id = ?
        AND training_title = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [
            courseId,
            trainingTitle
        ]
    );

    return rows[0];
};

/* INSERTING TRAINING ONLY */
exports.insertTraining = async (
    connection,
    training
) => {

    const sql = `
        INSERT INTO tbl_trainings
        (
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
            training_thumbnail,
            training_thumbnail_cloud_id,
            created_by,
            updated_by
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(
        sql,
        [
            training.course_id,
            training.training_title,
            training.training_description,
            training.training_duration_hours,
            training.training_mode,
            training.training_exam_name,
            training.training_exam_frequency,
            training.training_fee,
            training.training_start_date,
            training.training_end_date,
            training.training_thumbnail,
            training.training_thumbnail_cloud_id,
            training.created_by,
            training.updated_by
        ]
    );

    return result.insertId;
};

/* UPDATE THE COURSE IF SELECTED DIFFERENT FROM DROPDOWN */
exports.updateTrainingCourse = async (
    connection,
    trainingId,
    courseId,
    updatedBy
) => {

    const sql = `
        UPDATE tbl_trainings
        SET
            course_id = ?,
            updated_by = ?
        WHERE training_id = ?
    `;

    await connection.query(sql, [
        courseId,
        updatedBy,
        trainingId
    ]);
};

/* FETCH TRAINING ID BY COURSE ID */
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

/*FETCH COURSE ID BY TRAINING ID */
exports.getCourseIdByTrainingId = async (
    connection,
    trainingId
) => {

    const sql = `
        SELECT course_id
        FROM tbl_trainings
        WHERE training_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [trainingId]
    );

    if (rows.length === 0) {
        // throw new Error("Training not found.");
        throw new Error("Course not found.");
    }

    return rows[0].course_id;

};

/* UPDATING THE TRAINING MODEL */
exports.updateTrainingModel = async (
    connection,
    trainingId,
    training,
    updated_by
) => {

    const sql = `
    UPDATE tbl_trainings
    SET
      training_title = ?,
      training_description = ?,
      training_exam_name = ?,
      training_exam_frequency = ?,
      training_fee = ?,
      training_duration_hours = ?,
      training_mode = ?,
      training_start_date = ?,
      training_end_date = ?,
      training_thumbnail = ?,
      training_thumbnail_cloud_id = ?,
      training_status = ?,
      is_active = ?,
      updated_by = ?
    WHERE training_id = ?
  `;

    
  const resolvedEndDate =
    training.training_status === "COMPLETED"
        ? new Date().toISOString().split("T")[0]
        : (training.training_end_date ?? null);

  const [result] = await connection.query(sql, [
        training.title,
        training.description,
        training.examName,
        training.examFrequency,
        training.fee,
        training.training_duration_hours,
        training.training_mode,
        training.training_start_date ?? null,
        resolvedEndDate,
        training.training_thumbnail ?? null,
        training.training_thumbnail_cloud_id ?? null,
        training.training_status ?? "ACTIVE",
        training.is_active ?? 1,
        updated_by,
        trainingId
    ]);

    return result;
};

/* DELETE TRAINING BOOKS */
exports.deleteTrainingBooks = async (
    connection,
    trainingId
) => {

    const sql = `
    DELETE FROM tbl_training_books
    WHERE training_id = ?
  `;

    await connection.query(sql, [trainingId]);
};

/* DELETE TRAINING INSTRUCTORS */
exports.deleteTrainingInstructors = async (
    connection,
    trainingId
) => {

    const sql = `
    DELETE FROM tbl_training_instructors
    WHERE training_id = ?
  `;

    await connection.query(sql, [trainingId]);
};

/* GET EXISTING THUMBNAIL PATH */
exports.getTrainingThumbnail = async (
    connection,
    trainingId
) => {

    const sql = `
    SELECT
      training_thumbnail,
      training_thumbnail_cloud_id
    FROM tbl_trainings
    WHERE training_id = ?
  `;

    const [rows] = await connection.query(sql, [trainingId]);

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};

/* UPDATE COURSE THUMBNAIL */
exports.updateTrainingThumbnail = async (
    connection,
    trainingId,
    thumbnailPath,
    thumbnailCloudFileId = null
) => {

    const sql = `
    UPDATE tbl_trainings
    SET
      training_thumbnail = ?,
      training_thumbnail_cloud_id = ?
    WHERE training_id = ?
  `;

    await connection.query(sql, [
        thumbnailPath,
        thumbnailCloudFileId ?? null,
        trainingId
    ]);

};

/* INSERT TRAINING BOOKS */
exports.insertTrainingBooks = async (
    connection,
    trainingId,
    books,
    created_by,
    updated_by
) => {

    const sql = `
    INSERT INTO tbl_training_books
    (
      training_id,
      tb_book_name,
      tb_book_chapters,
      created_by,
      updated_by
    )
    VALUES (?, ?, ?, ?, ?)
  `;

    for (const book of books) {

        await connection.query(sql, [
            trainingId,
            book.name,
            book.chapters || null,
            created_by,
            updated_by
        ]);

    }

};

/* INSERTING TRAINING INSTRUCTOR */
exports.insertTrainingInstructors = async (
    connection,
    trainingId,
    instructors,
    created_by,
    updated_by
) => {

    const sql = `
    INSERT INTO tbl_training_instructors
    (
      training_id,
      instructor_id,
      created_by,
      updated_by
    )
    VALUES (?, ?, ?, ?)
  `;

    for (const instructorId of instructors) {

        await connection.query(sql, [
            trainingId,
            instructorId,
            created_by,
            updated_by
        ]);

    }

};


/* UPDATE TRAINING - for combined - not using now*/
exports.updateCourseModel = async (
    connection,
    courseId,
    course,
    updated_by
) => {

    // Check if another course already has the same course code
    const checkSql = `
    SELECT course_id
    FROM tbl_courses
    WHERE course_code = ?
      AND course_id != ?
  `;

    const [existingCourse] = await connection.query(checkSql, [
        course.code,
        courseId
    ]);

    if (existingCourse.length > 0) {
        // throw new Error("Course code already exists.");
        throw new Error("Course category code already exists.");
    }

    const sql = `
    UPDATE tbl_courses
    SET
        course_code = ?,
        course_name = ?,
        course_level = ?,
        updated_by = ?
    WHERE course_id = ?
    `;

    const [result] = await connection.query(sql, [
        course.code,
        course.name,
        course.level,
        updated_by,
        courseId
    ]);

    return result;
};

/* UPDATE TRAINING STATUS */
exports.updateTrainingStatusModel = async (
    connection,
    trainingId,
    trainingStatus,
    updatedBy
) => {

    const sql = `
        UPDATE tbl_trainings
        SET
            training_status = ?,
            training_end_date = CASE
                WHEN ? = 'COMPLETED' THEN CURDATE()
                ELSE training_end_date
            END,
            updated_by = ?
        WHERE training_id = ?
    `;

    const [result] = await connection.query(
        sql,
        [
            trainingStatus,
            trainingStatus,
            updatedBy,
            trainingId
        ]
    );

    return result;
};

/* This is route is to fetch all the trainings, 
only on the training table, which is on admin dashboard */
exports.fetchAllTrainingsForTrainingTable = async (userId) => {

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
      t.enrollment_status,

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

    ORDER BY t.training_id DESC
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

exports.checkTrainingHasLessonModel = async (trainingId) => {
    const [rows] = await db.query(
        `
        SELECT EXISTS (
            SELECT 1
            FROM tbl_training_topics t
            INNER JOIN tbl_training_lessons l
                ON l.topic_id = t.topic_id
            WHERE t.training_id = ?
        ) AS can_publish
        `,
        [trainingId]
    );

    return rows[0].can_publish === 1;
};

exports.publishTrainingModel = async (trainingId) => {
    const [result] = await db.query(
        `
        UPDATE tbl_trainings
        SET publish_status = 'PUBLISHED',
            enrollment_status = 'OPEN',
            enrollment_closed_at = NULL,
            publish_at = NOW()
        WHERE training_id = ?
        `,
        [trainingId]
    );

    return result;
};

exports.unpublishTrainingModel = async (trainingId) => {
    const [result] = await db.query(
        `
        UPDATE tbl_trainings
        SET publish_status = 'DRAFT'
        WHERE training_id = ?
        `,
        [trainingId]
    );

    return result;
};

/* START ENROLLMENT */
exports.startEnrollmentModel = async (trainingId) => {
    const [result] = await db.query(
        `
        UPDATE tbl_trainings
        SET enrollment_status = 'OPEN',
            enrollment_closed_at = NULL
        WHERE training_id = ?
        `,
        [trainingId]
    );

    return result;
};

/* STOP ENROLLMENT */
exports.stopEnrollmentModel = async (trainingId) => {
    const [result] = await db.query(
        `
        UPDATE tbl_trainings
        SET enrollment_status = 'CLOSED',
            enrollment_closed_at = NOW()
        WHERE training_id = ?
        `,
        [trainingId]
    );

    return result;
};