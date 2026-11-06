//student-activity.model.js
const db = require("./db");


exports.logActivityModel = async (userId) => {

    const sql = `
        INSERT INTO tbl_student_activity_log
            (user_id, activity_date, activity_count)
        VALUES
            (?, CURDATE(), 1)
        ON DUPLICATE KEY UPDATE
            activity_count = activity_count + 1
    `;

    const [result] = await db.query(sql, [userId]);

    return result;

};


exports.getActivityByUserModel = async (
    userId,
    days
) => {

    const sql = `
        SELECT
            DATE_FORMAT(activity_date, '%Y-%m-%d') AS activity_date,
            activity_count
        FROM tbl_student_activity_log
        WHERE
            user_id = ?
            AND activity_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY activity_date ASC
    `;

    const [rows] = await db.query(sql, [userId, days]);

    return rows;

};


/* LAST VIEWED LESSON PER COURSE (for My Learning page) */
exports.getRecentLearningForStudent = async (userId) => {

    const sql = `
        SELECT
            t.training_id,
            l.lesson_id      AS last_lesson_id,
            l.lesson_title   AS last_lesson_title,
            tt.topic_title,
            lp.updated_at    AS last_activity_at
        FROM tbl_lesson_progress lp
        INNER JOIN tbl_training_lessons l
            ON l.lesson_id = lp.lesson_id
        INNER JOIN tbl_training_topics tt
            ON tt.topic_id = l.topic_id
        INNER JOIN tbl_trainings t
            ON t.training_id = tt.training_id
        WHERE lp.user_id = ?
            AND l.lesson_is_published = TRUE
            AND (
                lp.lesson_progress_completed = TRUE
                OR lp.lesson_progress_last_watch_seconds > 0
                OR lp.lesson_progress_percentage > 0
            )
            AND lp.updated_at = (
                SELECT MAX(lp2.updated_at)
                FROM tbl_lesson_progress lp2
                INNER JOIN tbl_training_lessons l2
                    ON l2.lesson_id = lp2.lesson_id
                INNER JOIN tbl_training_topics tt2
                    ON tt2.topic_id = l2.topic_id
                WHERE lp2.user_id = lp.user_id
                    AND tt2.training_id = t.training_id
                    AND (
                        lp2.lesson_progress_completed = TRUE
                        OR lp2.lesson_progress_last_watch_seconds > 0
                        OR lp2.lesson_progress_percentage > 0
                    )
            )
        ORDER BY lp.updated_at DESC
        LIMIT 30
    `;

    const [rows] = await db.query(sql, [userId]);

    // A tie on updated_at can return two lessons for one course: keep the first.
    // Return up to 10 courses; the page drops completed / locked ones and shows 2.
    const seen = new Set();
    const result = [];

    for (const row of rows) {

        if (seen.has(row.training_id)) continue;

        seen.add(row.training_id);
        result.push(row);

        if (result.length === 10) break;

    }

    return result;

};