const db = require("./db");

// GET ACTIVE ADMINS
exports.getActiveAdmins = async (connection) => {

    const sql = `
        SELECT 
            u.user_id
        FROM tbl_users u
        INNER JOIN tbl_roles r
            ON u.role_id = r.role_id
        WHERE r.role_code = 'ADM'
          AND CAST(u.is_active AS UNSIGNED) = 1
    `;

    const [rows] = await connection.query(sql);

    return rows;
};

// CREATE ONE NOTIFICATION
exports.createNotification = async (connection, notification) => {

    const sql = `
        INSERT INTO tbl_notifications (
            user_id,
            notification_type,
            title,
            message,
            live_session_id,
            enroll_id,
            training_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(sql, [
        notification.user_id,
        notification.notification_type,
        notification.title,
        notification.message,
        notification.live_session_id || null,
        notification.enroll_id || null,
        notification.training_id || null
    ]);

    return result.insertId;
};


// GET USER NOTIFICATIONS
// exports.getUserNotifications = async (userId) => {

//     const sql = `
//         SELECT
//             notification_id,
//             user_id,
//             notification_type,
//             title,
//             message,
//             live_session_id,
//             enroll_id,
//             training_id,
//             CAST(is_read AS UNSIGNED) AS is_read,
//             created_at
//         FROM tbl_notifications
//         WHERE user_id = ?
//         ORDER BY created_at DESC
//     `;

//     const [rows] = await db.query(sql, [userId]);

//     return rows;
// };

exports.getUserNotifications = async (userId) => {

    const sql = `
        SELECT
            n.notification_id,
            n.user_id,
            n.notification_type,
            n.title,
            n.message,
            n.live_session_id,
            n.enroll_id,
            n.training_id,
            CAST(n.is_read AS UNSIGNED) AS is_read,
            n.created_at,

            l.lesson_title,

            t.training_title,

            ls.start_time AS session_start_time

        FROM tbl_notifications n

        LEFT JOIN tbl_live_sessions ls
            ON n.live_session_id = ls.live_session_id

        LEFT JOIN tbl_training_lessons l
            ON ls.lesson_id = l.lesson_id

        LEFT JOIN tbl_trainings t
            ON n.training_id = t.training_id

        WHERE n.user_id = ?

        ORDER BY n.created_at DESC
    `;

    const [rows] = await db.query(sql, [userId]);

    return rows;
};

// GET UNREAD COUNT
exports.getUnreadNotificationCount = async (userId) => {

    const sql = `
        SELECT COUNT(*) AS unread_count
        FROM tbl_notifications
        WHERE user_id = ?
          AND is_read = 0
    `;

    const [rows] = await db.query(sql, [userId]);

    return rows[0].unread_count;
};


// MARK ONE AS READ
exports.markNotificationAsRead = async (userId, notificationId) => {

    const sql = `
        UPDATE tbl_notifications
        SET is_read = 1
        WHERE notification_id = ?
          AND user_id = ?
    `;

    const [result] = await db.execute(sql, [
        notificationId,
        userId
    ]);

    return result.affectedRows > 0;
};


// MARK ALL AS READ
exports.markAllNotificationsAsRead = async (userId) => {

    const sql = `
        UPDATE tbl_notifications
        SET is_read = 1
        WHERE user_id = ?
          AND is_read = 0
    `;

    const [result] = await db.execute(sql, [userId]);

    return result.affectedRows;
};