const db = require("./db");

/* GET LESSONS BY TOPIC */
exports.fetchLessonsByTopic = async (topicId) => {

    const sql = `
        SELECT
            l.lesson_id,
            l.topic_id,
            l.lesson_title,
            l.lesson_content_type,
            l.lesson_duration,
            l.lesson_video_url,
            l.lesson_cloud_file_id,
            l.lesson_order,
            l.lesson_is_free_preview,
            l.lesson_is_published,
            l.created_at,
            l.updated_at,
            q.quiz_id,
            q.quiz_duration_minutes
            -- q.quiz_passing_percentage,
            -- q.quiz_allowed_attempts,
            -- q.quiz_instructions,
            -- q.quiz_start_datetime,
            -- q.quiz_end_datetime
        FROM tbl_training_lessons l
        LEFT JOIN tbl_quizzes q
            ON q.lesson_id = l.lesson_id
        WHERE l.topic_id = ?
        ORDER BY l.lesson_order ASC
    `;

    const [rows] = await db.query(sql, [topicId]);

    return rows;

};

/* CHECK TOPIC EXISTS */
exports.checkTopicExists = async (
    connection,
    topicId
) => {

    const sql = `
        SELECT topic_id
        FROM tbl_training_topics
        WHERE topic_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [topicId]
    );

    return rows[0];

};

/* CHECK DUPLICATE LESSON */
exports.checkDuplicateLesson = async (
    connection,
    topicId,
    lessonTitle
) => {

    const sql = `
        SELECT lesson_id
        FROM tbl_training_lessons
        WHERE topic_id = ?
        AND LOWER(lesson_title) = LOWER(?)
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [
            topicId,
            lessonTitle
        ]
    );

    return rows[0];

};

/* GET NEXT LESSON ORDER */
exports.getNextLessonOrder = async (
    connection,
    topicId
) => {

    const sql = `
        SELECT
            COALESCE(MAX(lesson_order),0)+1
            AS lesson_order
        FROM tbl_training_lessons
        WHERE topic_id = ?
    `;

    const [rows] = await connection.query(
        sql,
        [topicId]
    );

    return rows[0].lesson_order;

};

/* GET RESOURCE/FILE LESSON - FOR VIEW */
exports.getLessonResourceByLessonIdModel = async (lessonId) => {

    const [rows] = await db.query(
        `
            SELECT
                resource_id,
                lesson_id,
                resource_title,
                resource_type,
                resource_url,
                resource_cloud_file_id
            FROM tbl_lesson_resources
            WHERE lesson_id = ?
            LIMIT 1
            `,
        [lessonId]
    );

    return rows[0] || null;
};


/* INSERT LESSON */
exports.insertLesson = async (
    connection,
    lesson
) => {

    const sql = `
        INSERT INTO tbl_training_lessons(

            topic_id,
            lesson_title,
            lesson_content_type,
            lesson_duration,
            lesson_video_url,
            lesson_cloud_file_id,
            lesson_order,
            lesson_is_free_preview,
            lesson_is_published,
            created_by,
            updated_by

        )

        VALUES(

            ?,?,?,?,?,?,?,?,?,?,?

        )
    `;

    const [result] = await connection.query(

        sql,

        [

            lesson.topic_id,
            lesson.lesson_title,
            lesson.lesson_content_type,
            lesson.lesson_duration,
            lesson.lesson_video_url,
            lesson.lesson_cloud_file_id,
            lesson.lesson_order,
            lesson.lesson_is_free_preview,
            lesson.lesson_is_published,
            lesson.created_by,
            lesson.updated_by

        ]

    );

    return result.insertId;

};

// GET LESSON BY ID FOR EDIT
exports.getLessonByIdForEdit = async (
    connection,
    lessonId
) => {

    const [rows] = await connection.query(

        `
        SELECT *
        FROM tbl_training_lessons
        WHERE lesson_id = ?
        LIMIT 1
        `,

        [lessonId]

    );

    return rows[0];

};

// KEEP THE ORIGINAL MODEL NAME AVAILABLE FOR EXISTING CALLS
exports.getLessonById = exports.getLessonByIdForEdit;

/* GET LESSON RESOURCE BY LESSON ID */
exports.getLessonResourceByLessonId = async (
    connection,
    lessonId
) => {

    const [rows] = await connection.query(

        `
        SELECT
            resource_id,
            resource_title,
            resource_type,
            resource_url,
            resource_cloud_file_id
        FROM tbl_lesson_resources
        WHERE lesson_id = ?
        LIMIT 1
        `,

        [lessonId]

    );

    return rows[0];

};

/* UPDATE LESSON RESOURCE */
exports.updateLessonResource = async (
    connection,
    lessonId,
    resource
) => {

    await connection.query(

        `
        UPDATE tbl_lesson_resources
        SET resource_title = ?,
            resource_type = ?,
            resource_url = ?,
            resource_cloud_file_id = ?,
            updated_by = ?
        WHERE lesson_id = ?
        `,

        [
            resource.resource_title,
            resource.resource_type,
            resource.resource_url,
            resource.resource_cloud_file_id,
            resource.updated_by,
            lessonId
        ]

    );

};


// UPDATE LESSON -
exports.checkDuplicateLessonForUpdate = async (
    connection,
    topicId,
    lessonTitle,
    lessonId
) => {

    const [rows] = await connection.query(

        `
        SELECT lesson_id
        FROM tbl_training_lessons
        WHERE topic_id = ?
        AND LOWER(lesson_title)=LOWER(?)
        AND lesson_id <> ?
        LIMIT 1
        `,

        [
            topicId,
            lessonTitle,
            lessonId
        ]

    );

    return rows[0];

};

/* UPDATE LESSON */
exports.updateLesson = async (
    connection,
    lessonId,
    lesson
) => {

    await connection.query(
        `
        UPDATE tbl_training_lessons
        SET lesson_title = ?,
            lesson_content_type = ?,
            lesson_duration = ?,
            lesson_video_url = ?,
            lesson_cloud_file_id = ?,
            lesson_is_free_preview = ?,
            lesson_is_published = ?,
            updated_by = ?
        WHERE lesson_id = ?
        `,
        [
            lesson.lesson_title,
            lesson.lesson_content_type,
            lesson.lesson_duration,
            lesson.lesson_video_url,
            lesson.lesson_cloud_file_id,
            lesson.lesson_is_free_preview,
            lesson.lesson_is_published,
            lesson.updated_by,
            lessonId
        ]
    );

};

// DELETE LESSON
exports.deleteLesson = async (
    connection,
    lessonId
) => {

    await connection.query(

        `
        DELETE
        FROM tbl_training_lessons
        WHERE lesson_id=?
        `,

        [lessonId]

    );

};

/* Reorder lessons after deletion to keep lesson_order consecutive. */
exports.reorderLessonDisplayOrder = async (
    connection,
    topicId
) => {

    const [lessons] = await connection.query(
        `
        SELECT lesson_id
        FROM tbl_training_lessons
        WHERE topic_id = ?
        ORDER BY lesson_order, lesson_id
        `,
        [topicId]
    );

    for (let i = 0; i < lessons.length; i++) {

        await connection.query(
            `
            UPDATE tbl_training_lessons
            SET lesson_order = ?
            WHERE lesson_id = ?
            `,
            [i + 1, lessons[i].lesson_id]
        );

    }

};

/* INSERT LESSON RESOURCE */
exports.insertLessonResource = async (
    connection,
    resource
) => {

    const sql = `
        INSERT INTO tbl_lesson_resources(

            lesson_id,
            resource_title,
            resource_type,
            resource_url,
            resource_cloud_file_id,
            created_by,
            updated_by

        )

        VALUES(?,?,?,?,?,?,?)
    `;

    const [result] = await connection.query(

        sql,

        [

            resource.lesson_id,
            resource.resource_title,
            resource.resource_type,
            resource.resource_url,
            resource.resource_cloud_file_id,
            resource.created_by,
            resource.updated_by

        ]

    );

    return result.insertId;

};

exports.deleteLessonResource = async (connection, lessonId) => {

    const sql = `
        DELETE FROM tbl_lesson_resources
        WHERE lesson_id = ?
    `;

    await connection.query(sql, [lessonId]);

};

exports.deleteQuizByLessonId = async (connection, lessonId) => {

    const sql = `
        DELETE FROM tbl_quizzes
        WHERE lesson_id = ?
    `;

    await connection.query(sql, [lessonId]);

};