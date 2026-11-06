const db = require("./db");

// exports.insertLessonContentModel = async (
//     content
// ) => {

//     const connection = await db.getConnection();

//     try {

//         const [orderResult] =
//             await connection.query(
//                 `
//                 SELECT
//                     COALESCE(
//                         MAX(content_order),
//                         0
//                     ) + 1 AS next_order
//                 FROM
//                     tbl_training_lesson_contents
//                 WHERE
//                     lesson_id = ?
//                 `,
//                 [content.lesson_id]
//             );

//         const nextOrder =
//             orderResult[0].next_order;

//         const [result] =
//             await connection.query(
//                 `
//                 INSERT INTO
//                 tbl_training_lesson_contents
//                 (
//                     lesson_id,
//                     content_title,
//                     content_type,
//                     content_url,
//                     content_order,
//                     created_by,
//                     updated_by
//                 )
//                 VALUES
//                 (
//                     ?, ?, ?, ?, ?, ?, ?
//                 )
//                 `,
//                 [
//                     content.lesson_id,
//                     content.content_title,
//                     content.content_type,
//                     content.content_url,
//                     nextOrder,
//                     content.created_by,
//                     content.updated_by
//                 ]
//             );

//         return result.insertId;

//     } finally {

//         connection.release();

//     }
// };

/* TO CHECK LESSON ID, AND CONTENT TYPE = VIDEO */
exports.getLessonByIdModel = async (
    connection,
    lessonId
) => {

    const [rows] = await connection.query(
        `
        SELECT
            lesson_id,
            lesson_content_type
        FROM tbl_training_lessons
        WHERE lesson_id = ?
        `,
        [lessonId]
    );

    return rows[0] || null;
};

/* CREATE LESSON CONTENT - CHECK DUPLICATE LESSON CONTENT TITLE UNDER LESSON */
exports.checkDuplicateLessonContent = async (
    connection,
    lessonId,
    contentTitle
) => {

    const [rows] = await connection.query(
        `
        SELECT content_id
        FROM tbl_training_lesson_contents
        WHERE lesson_id = ?
        AND LOWER(content_title) = LOWER(?)
        LIMIT 1
        `,
        [
            lessonId,
            contentTitle
        ]
    );

    return rows[0] || null;
};

/* GET NEXT ORDER FOR LESSON CONTENT */
exports.getNextContentOrder = async (
    connection,
    lessonId
) => {

    const [rows] = await connection.query(
        `
        SELECT
            COALESCE(MAX(content_order), 0) + 1
                AS content_order
        FROM tbl_training_lesson_contents
        WHERE lesson_id = ?
        `,
        [lessonId]
    );

    return rows[0].content_order;
};

/* CREATE LESSON CONTENT */
/* ONLY WHEN THE LESSON IS VIDEO, ADDITIONAL FILES/IMAGES CAN BE INSERTED. */
exports.createLessonContentModel = async (
    connection,
    lessonContentData
) => {

    const {
        lesson_id,
        content_title,
        content_type,
        content_url,
        download_url,
        content_allow_download,
        content_size,
        content_cloud_file_id,
        content_order,
        created_by
    } = lessonContentData;

    const [result] = await connection.query(
        `
        INSERT INTO tbl_training_lesson_contents
        (
            lesson_id,
            content_title,
            content_type,
            content_url,
            download_url,
            content_allow_download,
            content_size,
            content_cloud_file_id,
            content_order,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            lesson_id,
            content_title,
            content_type,
            content_url,
            download_url,
            content_allow_download,
            content_size,
            content_cloud_file_id,
            content_order,
            created_by
        ]
    );

    return result;
};

/* GET CONTENTS FOR LESSON */
exports.getLessonContentsByLessonIdModel = async (
    lessonId
) => {

    const [rows] = await db.query(
        `
        SELECT
            content_id,
            lesson_id,
            content_title,
            content_type,
            content_url,
            download_url,
            content_allow_download,
            content_size,
            content_order
        FROM tbl_training_lesson_contents
        WHERE lesson_id = ?
        ORDER BY content_order ASC, content_id ASC
        `,
        [lessonId]
    );

    return rows;

};

/* FETCH LESSON CONTENT BY ID  */
exports.getLessonContentByIdModel = async (
    connection,
    contentId
) => {

    const [rows] = await connection.query(
        `
        SELECT
            content_id,
            lesson_id,
            content_title,
            content_url,
            download_url,
            content_allow_download,
            content_cloud_file_id,
            content_type
        FROM tbl_training_lesson_contents
        WHERE content_id = ?
        `,
        [contentId]
    );

    return rows[0] || null;
};

/* UPDATE LESSON CONTENT - CHECK IF DUPLICATE LESSON CONTENT TITLE UNDER LESSON */
exports.checkDuplicateLessonContentForUpdate = async (
    connection,
    lessonId,
    contentTitle,
    contentId
) => {

    const [rows] = await connection.query(
        `
        SELECT content_id
        FROM tbl_training_lesson_contents
        WHERE lesson_id = ?
        AND LOWER(content_title) = LOWER(?)
        AND content_id != ?
        LIMIT 1
        `,
        [
            lessonId,
            contentTitle,
            contentId
        ]
    );

    return rows[0] || null;
};

/* UPDATE LESSON CONTENT BY ID */
exports.updateLessonContentModel = async (
    connection,
    contentId,
    updateData
) => {

    const {
        content_title,
        content_allow_download,
        content_url,
        download_url,
        content_size,
        content_cloud_file_id,
        updated_by
    } = updateData;

    const [result] = await connection.query(
        `
        UPDATE tbl_training_lesson_contents
        SET
            content_title = ?,
            content_allow_download = ?,
            content_url = ?,
            download_url = ?,
            content_size = ?,
            content_cloud_file_id = ?,
            updated_by = ?
        WHERE content_id = ?
        `,
        [
            content_title,
            content_allow_download,
            content_url,
            download_url,
            content_size,
            content_cloud_file_id,
            updated_by,
            contentId
        ]
    );

    return result;
};

/* REORDERING THE LESSON CONTENT AFTER DELETE */
exports.reorderLessonContentOrder = async (
    connection,
    lessonId
) => {

    const [contents] = await connection.query(
        `
        SELECT content_id
        FROM tbl_training_lesson_contents
        WHERE lesson_id = ?
        ORDER BY content_order, content_id
        `,
        [lessonId]
    );

    for (let i = 0; i < contents.length; i++) {

        await connection.query(
            `
            UPDATE tbl_training_lesson_contents
            SET content_order = ?
            WHERE content_id = ?
            `,
            [i + 1, contents[i].content_id]
        );

    }

};


/* DELETE LESSON CONTENT */
exports.deleteLessonContentModel = async (
    connection,
    contentId
) => {

    const [result] = await connection.query(
        `
        DELETE FROM tbl_training_lesson_contents
        WHERE content_id = ?
        `,
        [contentId]
    );

    return result;
};