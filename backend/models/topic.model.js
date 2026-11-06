//topic.model.js
const db = require("./db");

exports.checkTrainingExists = async (connection, trainingId) => {

    const sql = `
        SELECT training_id
        FROM tbl_trainings
        WHERE training_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [trainingId]);

    return rows[0];
};

exports.checkDuplicateTopic = async (
    connection,
    trainingId,
    topicTitle
) => {

    const sql = `
        SELECT topic_id
        FROM tbl_training_topics
        WHERE training_id = ?
        AND LOWER(topic_title) = LOWER(?)
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [
            trainingId,
            topicTitle
        ]
    );

    return rows[0];
};

// ==========================
// Check Duplicate Topic (on update, excluding the topic being edited)
// ==========================
exports.checkDuplicateTopicForUpdate = async (
    connection,
    trainingId,
    topicTitle,
    topicId
) => {

    const sql = `
        SELECT topic_id
        FROM tbl_training_topics
        WHERE training_id = ?
        AND LOWER(topic_title) = LOWER(?)
        AND topic_id != ?
        LIMIT 1
    `;

    const [rows] = await connection.query(
        sql,
        [
            trainingId,
            topicTitle,
            topicId
        ]
    );

    return rows[0];
};

// ==========================
// Check Topic Exists
// ==========================
exports.checkTopicExists = async (connection, topicId) => {

    const sql = `
        SELECT topic_id, training_id, topic_title
        FROM tbl_training_topics
        WHERE topic_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [topicId]);

    return rows[0];
};

exports.getNextTopicDisplayOrder = async (
    connection,
    trainingId
) => {

    const sql = `
        SELECT
            COALESCE(MAX(topic_display_order), 0) + 1 AS topic_display_order
        FROM tbl_training_topics
        WHERE training_id = ?
    `;

    const [rows] = await connection.query(
        sql,
        [trainingId]
    );

    return rows[0].topic_display_order;
};

exports.insertTopic = async (
    connection,
    topic
) => {

    const sql = `
        INSERT INTO tbl_training_topics (
            training_id,
            topic_title,
            topic_description,
            topic_display_order,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(
        sql,
        [
            topic.training_id,
            topic.topic_title,
            topic.topic_description,
            topic.topic_display_order,
            topic.created_by,
            topic.updated_by
        ]
    );

    return result.insertId;
};

// ==========================
// Update Topic
// ==========================
exports.updateTopicModel = async (
    connection,
    topic
) => {

    const sql = `
        UPDATE tbl_training_topics
        SET
            topic_title = ?,
            topic_description = ?,
            updated_by = ?
        WHERE topic_id = ?
    `;

    const [result] = await connection.query(
        sql,
        [
            topic.topic_title,
            topic.topic_description,
            topic.updated_by,
            topic.topic_id
        ]
    );

    return result.affectedRows;
};

exports.getTopicByIdModel = async (topicId) => {
    const sql = `
        SELECT
            t.topic_id,
            t.training_id,
            tr.training_title,
            t.topic_title,
            t.topic_description,
            (
                SELECT COUNT(*)
                FROM tbl_training_lessons l
                WHERE l.topic_id = t.topic_id
            ) AS topic_recording_count,
            t.topic_display_order,
            t.created_at,
            t.updated_at,
            t.created_by,
            t.updated_by,
            cu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name
        FROM tbl_training_topics t
        INNER JOIN tbl_trainings tr
            ON tr.training_id = t.training_id
        LEFT JOIN tbl_users cu
            ON cu.user_id = t.created_by
        LEFT JOIN tbl_users uu
            ON uu.user_id = t.updated_by
        WHERE t.topic_id = ?
    `;

    const [rows] = await db.query(sql, [topicId]);

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};

// ==========================
// Check Topic Has Lessons (guard before delete)
// ==========================
exports.checkTopicHasLessons = async (
    connection,
    topicId
) => {

    const sql = `
        SELECT COUNT(*) AS lessonCount
        FROM tbl_training_lessons
        WHERE topic_id = ?
    `;

    const [rows] = await connection.query(sql, [topicId]);

    return rows[0].lessonCount > 0;
};

// ==========================
// Delete Topic
// ==========================
exports.deleteTopicModel = async (
    connection,
    topicId
) => {

    const sql = `
        DELETE FROM tbl_training_topics
        WHERE topic_id = ?
    `;

    const [result] = await connection.query(sql, [topicId]);

    return result.affectedRows;
};

/* Reording of topic - otherwise there will be gap in the topic  */
exports.reorderTopicDisplayOrder = async (
    connection,
    trainingId
) => {

    const [topics] = await connection.query(
        `
        SELECT topic_id
        FROM tbl_training_topics
        WHERE training_id = ?
        ORDER BY topic_display_order, topic_id
        `,
        [trainingId]
    );

    for (let i = 0; i < topics.length; i++) {

        await connection.query(
            `
            UPDATE tbl_training_topics
            SET topic_display_order = ?
            WHERE topic_id = ?
            `,
            [i + 1, topics[i].topic_id]
        );

    }

};


// exports.getTopicsByTrainingIDModel = async (trainingId) => {

//     const sql = `
//         SELECT
//             t.topic_id,
//             t.training_id,
//             t.topic_title,
//             t.topic_description,
//             (
//                 SELECT COUNT(*)
//                 FROM tbl_training_lessons l
//                 WHERE l.topic_id = t.topic_id
//             ) AS topic_recording_count,
//             t.topic_display_order,
//             t.created_at,
//             t.updated_at
//         FROM tbl_training_topics t
//         WHERE t.training_id = ?
//         ORDER BY t.topic_display_order ASC
//     `;

//     const [rows] = await db.query(sql, [trainingId]);

//     return rows;
// };

exports.getTopicsByTrainingIDModel = async (trainingId) => {

    const [topics] = await db.query(
        `
        SELECT
            t.topic_id,
            t.training_id,
            t.topic_title,
            t.topic_description,
            (
                SELECT COUNT(*)
                FROM tbl_training_lessons l
                WHERE l.topic_id = t.topic_id
            ) AS topic_recording_count,
            t.topic_display_order,
            t.created_at,
            t.updated_at
        FROM tbl_training_topics t
        WHERE t.training_id = ?
        ORDER BY t.topic_display_order ASC
        `,
        [trainingId]
    );

    const [lessons] = await db.query(
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

            q.quiz_id,
            q.quiz_duration_minutes

        FROM tbl_training_topics tt

        INNER JOIN tbl_training_lessons tl
            ON tt.topic_id = tl.topic_id

        LEFT JOIN tbl_quizzes q
            ON q.lesson_id = tl.lesson_id

        WHERE tt.training_id = ?

        ORDER BY
            tt.topic_display_order,
            tl.lesson_order
        `,
        [trainingId]
    );

    return topics.map(topic => ({
        ...topic,
        lessons: lessons.filter(
            lesson => lesson.topic_id === topic.topic_id
        )
    }));
};

// ==========================
// Check Training Has Enrolled Students
// ==========================
exports.checkTrainingHasEnrollments = async (
    connection,
    trainingId
) => {

    const sql = `
        SELECT COUNT(*) AS enrollmentCount
        FROM tbl_enrollments
        WHERE training_id = ?
        AND enroll_status = 'A'
    `;

    const [rows] = await connection.query(
        sql,
        [trainingId]
    );

    return rows[0].enrollmentCount > 0;
};