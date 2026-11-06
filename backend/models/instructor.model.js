const db = require("./db");
require("dotenv").config();

/* GET INSTRUCTORS */
exports.getInstructorModel = async () => {

    const sql =
        //     `
        //     SELECT
        //       i.instructor_id,
        //       u.user_id,
        //       u.user_full_name,
        //       u.username,
        //       u.user_email,
        //       u.user_mobile_no,
        //       u.user_profile_photo,
        //       i.ins_bio,
        //       i.ins_qualification,
        //       i.ins_experience,
        //       CAST(i.is_active AS UNSIGNED) AS is_active
        //     FROM tbl_instructors i
        //     INNER JOIN tbl_users u
        //       ON i.user_id = u.user_id
        //     ORDER BY i.instructor_id DESC
        //   `

        `
        SELECT
            i.instructor_id,
            u.user_id,
            u.user_full_name,
            u.username,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,

            r.role_name,

            i.ins_bio,
            i.ins_qualification,
            i.ins_experience,

            i.created_at,
            i.updated_at,

            i.created_by,
            i.updated_by,

            iu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name,

            CAST(i.is_active AS UNSIGNED) AS is_active

        FROM tbl_instructors i
        INNER JOIN tbl_users u
            ON i.user_id = u.user_id

        LEFT JOIN tbl_users iu
            ON iu.user_id = i.created_by  

        LEFT JOIN tbl_users uu
            ON uu.user_id = i.updated_by
           

        INNER JOIN tbl_roles r
            ON u.role_id = r.role_id

        ORDER BY i.instructor_id DESC
        `
        ;

    const [rows] = await db.query(sql);

    return rows;
};

/* CREATE INSTRUCTOR */
exports.insertInstructor = async (connection, instructor) => {

    const sql = `
        INSERT INTO tbl_instructors(
            user_id,
            ins_bio,
            ins_qualification,
            ins_experience,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
        instructor.user_id,
        instructor.ins_bio,
        instructor.ins_qualification,
        instructor.ins_experience,
        instructor.created_by,
        instructor.updated_by
    ]);

    return result.insertId;

};

/* GET ACTIVE INSTRUCTORS */
exports.getActiveInstructorModel = async () => {

    const sql = `
        SELECT
            i.instructor_id,
            u.user_id,
            u.user_full_name,
            u.username,
            u.user_email,
            u.user_mobile_no,
            u.user_profile_photo,
            i.ins_bio,
            i.ins_qualification,
            i.ins_experience,
            CAST(i.is_active AS UNSIGNED) AS instructor_active,
            CAST(u.is_active AS UNSIGNED) AS user_active
        FROM tbl_instructors i
        INNER JOIN tbl_users u
            ON i.user_id = u.user_id
        WHERE
            CAST(i.is_active AS UNSIGNED) = 1
            AND CAST(u.is_active AS UNSIGNED) = 1
        ORDER BY u.user_full_name ASC
    `;

    const [rows] = await db.query(sql);

    return rows;
};

/* UPDATE INSTRUCTOR MODELS --- */
/* GET INSTRUCTOR BY ID */
exports.getInstructorByUserId = async (
    connection,
    userId
) => {

    const sql =
        // `
        //     SELECT
        //         u.user_id,
        //         u.user_profile_photo,
        //         i.ins_id
        //     FROM tbl_users u
        //     INNER JOIN tbl_instructors i
        //         ON u.user_id = i.user_id
        //     WHERE u.user_id = ?
        //         AND u.is_active = 1
        //         AND i.is_active = 1
        // `

        `SELECT

    u.user_id,
    u.user_full_name,
    u.user_mobile_no,
    u.username,
    u.user_email,
    u.user_profile_photo,

    CAST(u.is_active AS UNSIGNED) AS user_active,

    i.instructor_id,
    i.ins_bio,
    i.ins_qualification,
    i.ins_experience,

    i.created_at,
    i.updated_at,

    i.created_by,
    i.updated_by,

    iu.user_full_name AS created_by_name,
    uu.user_full_name AS updated_by_name,

    CAST(i.is_active AS UNSIGNED) AS instructor_active

FROM tbl_users u

INNER JOIN tbl_instructors i
    ON u.user_id = i.user_id

LEFT JOIN tbl_users iu
    ON iu.user_id = i.created_by

LEFT JOIN tbl_users uu
    ON uu.user_id = i.updated_by

WHERE u.user_id = ?
LIMIT 1`
        ;

    const [rows] = await connection.query(sql, [userId]);

    const instructor = rows[0] || null;

    if (!instructor) {
        return null;
    }

    const assignedCoursesSql = `
        SELECT DISTINCT
            c.course_name,
            t.training_title
        FROM tbl_training_instructors ti
        INNER JOIN tbl_trainings t
            ON t.training_id = ti.training_id
        INNER JOIN tbl_courses c
            ON c.course_id = t.course_id
        INNER JOIN tbl_instructors i
            ON i.instructor_id = ti.instructor_id
        WHERE i.user_id = ?
        ORDER BY c.course_name ASC, t.training_title ASC
    `;

    const [assignedCourses] = await connection.query(
        assignedCoursesSql,
        [userId]
    );

    instructor.assignedCourses = assignedCourses;

    return instructor;

};

/* CHECK USERNAME EXISTS EXCEPT CURRENT USER'S */
exports.checkUsernameExistsExceptUser = async (
    connection,
    username,
    userId
) => {

    const sql = `
        SELECT user_id
        FROM tbl_users
        WHERE
            username = ?
            AND user_id <> ?
    `;

    const [rows] = await connection.query(sql, [
        username,
        userId
    ]);

    return rows.length > 0;

};

/* CHECK EMAIL EXISTS EXCEPT CURRETN USER'S */
exports.checkEmailExistsExceptUser = async (
    connection,
    email,
    userId
) => {

    const sql = `
        SELECT user_id
        FROM tbl_users
        WHERE
            user_email = ?
            AND user_id <> ?
    `;

    const [rows] = await connection.query(sql, [
        email,
        userId
    ]);

    return rows.length > 0;

};

/* CHECK MOBILE EXIST EXCEPT CURRENT USER'S */
exports.checkMobileExistsExceptUser = async (
    connection,
    mobile,
    userId
) => {

    const sql = `
        SELECT user_id
        FROM tbl_users
        WHERE
            user_mobile_no = ?
            AND user_id <> ?
    `;

    const [rows] = await connection.query(sql, [
        mobile,
        userId
    ]);

    return rows.length > 0;

};

/* TOTAL DISTINCT STUDENTS ACROSS ALL COURSES TAUGHT BY THIS INSTRUCTOR */
exports.getTotalStudentsForInstructorModel = async (userId) => {

    const sql = `
        SELECT COUNT(DISTINCT e.user_id) AS total_students
        FROM tbl_enrollments e
        INNER JOIN tbl_training_instructors ti
            ON e.training_id = ti.training_id
        INNER JOIN tbl_instructors i
            ON ti.instructor_id = i.instructor_id
        WHERE
            i.user_id = ?
            AND e.enroll_status = 'A'
    `;

    const [[row]] = await db.query(sql, [userId]);

    return row.total_students || 0;

};

/* UPDATE USER */
exports.updateUser = async (
    connection,
    userId,
    user
) => {

    const sql = `
        UPDATE tbl_users
        SET
            user_full_name = ?,
            user_mobile_no = ?,
            username = ?,
            user_email = ?,
            is_active = ?,
            updated_by = ?,
            updated_at = NOW()
        WHERE user_id = ?
    `;

    await connection.query(sql, [
        user.user_full_name,
        user.user_mobile_no,
        user.username,
        user.user_email,
        user.is_active,
        user.updated_by,
        userId
    ]);

};

/* UPDATE USER PASSWORD */
exports.updateUserPassword = async (
    connection,
    userId,
    password,
    updatedBy
) => {

    const sql = `
        UPDATE tbl_users
        SET
            user_password = ?,
            updated_by = ?,
            updated_at = NOW()
        WHERE user_id = ?
    `;

    await connection.query(sql, [

        password,
        updatedBy,
        userId

    ]);

};

/* UPDATE INSTRUCTOR */
exports.updateInstructorModel = async (
    connection,
    userId,
    instructor
) => {

    const sql = `
        UPDATE tbl_instructors
        SET
            ins_bio = ?,
            ins_qualification = ?,
            ins_experience = ?,

            is_active = ?,

            updated_by = ?,
            updated_at = NOW()
        WHERE user_id = ?
    `;

    await connection.query(sql, [
        instructor.ins_bio,
        instructor.ins_qualification,
        instructor.ins_experience,
        instructor.is_active,
        instructor.updated_by,
        userId
    ]);

};

// GET THE COURSES WHICH ARE ASSIGNED TO INSTRUCTOR
exports.fetchInstructorCourses = async (userId) => {
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
    t.publish_status,
    t.training_duration_hours, 
    t.training_mode, 

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

  INNER JOIN tbl_training_instructors ti
    ON ti.training_id = t.training_id

  INNER JOIN tbl_instructors i
    ON i.instructor_id = ti.instructor_id
    AND i.user_id = ?

  LEFT JOIN tbl_users cu 
    ON cu.user_id = t.created_by

  LEFT JOIN tbl_users uu 
    ON uu.user_id = t.updated_by

  LEFT JOIN tbl_enrollments e 
    ON e.training_id = t.training_id
    AND e.user_id = ?

 -- ORDER BY t.training_id DESC
 ORDER BY ti.created_at DESC
`;

    const [courses] = await db.query(
        sql,
        [userId, userId]
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

}

