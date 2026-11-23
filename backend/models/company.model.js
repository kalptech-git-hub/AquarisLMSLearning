const db = require("./db");



exports.getStudentRoleId = async (connection = db) => {
    const [rows] = await connection.query(
        `
        SELECT role_id
        FROM tbl_roles
        WHERE role_code = 'STD'
          AND is_active = b'1'
        LIMIT 1
        `
    );

    if (!rows.length) {
        throw new Error(
            "Student role (STD) does not exist or is inactive."
        );
    }

    return rows[0].role_id;
};

exports.checkDuplicateUser = async (
    connection = db,
    {
        email = null,
        username = null,
        mobile = null,
        excludeUserId = null
    } = {}
) => {
    const conditions = [];
    const params = [];

    const normalizedEmail = email
        ? String(email).trim().toLowerCase()
        : null;

    const normalizedUsername = username
        ? String(username).trim()
        : null;

    const normalizedMobile = mobile
        ? String(mobile).trim()
        : null;

    if (normalizedEmail) {
        conditions.push("user_email = ?");
        params.push(normalizedEmail);
    }

    if (normalizedUsername) {
        conditions.push("username = ?");
        params.push(normalizedUsername);
    }

    if (normalizedMobile) {
        conditions.push("user_mobile_no = ?");
        params.push(normalizedMobile);
    }

    // Nothing to check.
    if (conditions.length === 0) {
        return [];
    }

    let sql = `
        SELECT
            user_id,
            user_email,
            username,
            user_mobile_no
        FROM tbl_users
        WHERE (${conditions.join(" OR ")})
    `;

    if (excludeUserId !== null && excludeUserId !== undefined) {
        sql += ` AND user_id != ?`;
        params.push(excludeUserId);
    }

    const [rows] = await connection.query(sql, params);

    return rows;
};



/* */
// exports.getAllCompanies = async () => {
//     const sql = `
//         SELECT 
//             c.company_id,
//             c.company_name,
//             c.company_email,
//             c.company_mobile_no,
//             c.company_address,

//             CAST(c.is_active AS UNSIGNED) AS is_active,

//             c.created_at,
//             c.updated_at,
//             c.created_by,
//             c.updated_by,

//             ct.company_trainings_id,
//             ct.training_id,
//             ct.training_users_limit,
//             ct.training_expiry_on,
//             CAST(ct.is_active AS UNSIGNED) AS training_is_active,
//             ct.created_at AS training_assigned_at,
//             ct.created_by AS training_assigned_by,
//             ct.updated_at AS training_updated_at,
//             ct.updated_by AS training_updated_by,

//             t.training_title,
//             t.course_id,
//             co.course_name

//         FROM tbl_companies c

//         LEFT JOIN tbl_company_trainings ct
//             ON ct.company_id = c.company_id

//         LEFT JOIN tbl_trainings t
//             ON t.training_id = ct.training_id

//         LEFT JOIN tbl_courses co
//             ON co.course_id = t.course_id

//         ORDER BY c.company_id DESC, ct.company_trainings_id DESC
//     `;

//     const [companies] = await db.query(sql);

//     return companies;
// };

/* */
// exports.getAllCompanies = async () => {
//     const sql = `
//         SELECT
//             c.company_id,
//             c.company_name,
//             c.company_email,
//             c.company_mobile_no,
//             c.company_address,
//             CAST(c.is_active AS UNSIGNED) AS is_active,

//             ct.company_trainings_id,
//             ct.training_id,
//             ct.training_users_limit,
//             ct.training_expiry_on,
//             CAST(ct.is_active AS UNSIGNED) AS training_is_active,

//             t.training_title,
//             t.course_id,
//             co.course_name

//         FROM tbl_companies c

//     LEFT JOIN tbl_company_trainings ct
//         ON c.company_id = ct.company_id

//     LEFT JOIN tbl_trainings t
//         ON ct.training_id = t.training_id

//     LEFT JOIN tbl_courses co
//         ON t.course_id = co.course_id

//     ORDER BY c.company_id DESC, ct.company_trainings_id DESC`;

//     const [companies] = await db.query(sql);

//     return companies;
// };


exports.getAllCompanies = async () => {
    const sql = `
        SELECT
            c.company_id,
            c.company_name,
            c.company_email,
            c.company_mobile_no,
            c.company_address,
            CAST(c.is_active AS UNSIGNED) AS is_active,
            c.created_at,
            c.updated_at,
            c.created_by,
            c.updated_by,

            created_user.user_full_name AS created_by_name,
            updated_user.user_full_name AS updated_by_name,

            ct.company_trainings_id,
            ct.training_id,
            ct.training_users_limit,
            ct.training_expiry_on,
            CAST(ct.is_active AS UNSIGNED) AS training_is_active,

            t.training_title,
            t.training_description,
            t.training_duration_hours,
            t.training_mode,
            t.training_status,
            t.publish_status,
            t.enrollment_status,

            t.course_id,
            co.course_name,
            co.course_code,
            co.course_level

        FROM tbl_companies c

        LEFT JOIN tbl_users created_user
            ON c.created_by = created_user.user_id

        LEFT JOIN tbl_users updated_user
            ON c.updated_by = updated_user.user_id

        LEFT JOIN tbl_company_trainings ct
            ON c.company_id = ct.company_id

        LEFT JOIN tbl_trainings t
            ON ct.training_id = t.training_id

        LEFT JOIN tbl_courses co
            ON t.course_id = co.course_id

        ORDER BY c.company_id DESC, ct.company_trainings_id DESC
    `;

    const [rows] = await db.query(sql);

    const companyMap = new Map();

    rows.forEach((row) => {
        if (!companyMap.has(row.company_id)) {
            companyMap.set(row.company_id, {
                company_id: row.company_id,
                company_name: row.company_name,
                company_email: row.company_email,
                company_mobile_no: row.company_mobile_no,
                company_address: row.company_address,
                is_active: row.is_active,
                created_at: row.created_at,
                updated_at: row.updated_at,

                created_by: row.created_by,
                created_by_name: row.created_by_name || "Unknown",

                updated_by: row.updated_by,
                updated_by_name: row.updated_by_name || "Unknown",

                assigned_trainings: []
            });
        }

        if (row.company_trainings_id !== null) {
            companyMap.get(row.company_id).assigned_trainings.push({
                company_trainings_id: row.company_trainings_id,
                training_id: row.training_id,

                training_title: row.training_title,
                training_description: row.training_description,
                training_duration_hours: row.training_duration_hours,
                training_mode: row.training_mode,
                training_status: row.training_status,
                publish_status: row.publish_status,
                enrollment_status: row.enrollment_status,

                course_id: row.course_id,
                course_name: row.course_name,
                course_code: row.course_code,
                course_level: row.course_level,

                training_users_limit: row.training_users_limit,
                training_expiry_on: row.training_expiry_on,
                training_is_active: row.training_is_active
            });
        }
    });

    return Array.from(companyMap.values());
};

// exports.getCompanyEmployees = async (companyId) => {
//     const sql = `
//     SELECT
//     u.user_id,
//         u.user_full_name,
//         u.username,
//         u.user_email,
//         u.user_mobile_no,
//         u.user_qualification,
//         u.user_postal_address,
//         u.user_profile_photo,

//         r.role_name,

//         u.created_at,
//         u.updated_at,
//         u.created_by,
//         u.updated_by,

//         cu.user_full_name AS created_by_name,
//             uu.user_full_name AS updated_by_name,

//                 CAST(u.is_active AS UNSIGNED) AS is_active

//         FROM tbl_users u

//         INNER JOIN tbl_roles r
//             ON u.role_id = r.role_id

//         LEFT JOIN tbl_users cu
//             ON cu.user_id = u.created_by

//         LEFT JOIN tbl_users uu
//             ON uu.user_id = u.updated_by

//         WHERE u.company_id = ?
//         AND r.role_code = 'STD'

//         ORDER BY u.user_id DESC
//         `;

//     const [rows] = await db.query(sql, [companyId]);
//     return rows;
// };


/* */
// exports.getCompanyEmployees = async (companyId) => {
//     const sql = `
//         SELECT
//             u.user_id,
//             u.user_full_name,
//             u.username,
//             u.user_email,
//             u.user_mobile_no,
//             u.user_qualification,
//             u.user_postal_address,
//             u.user_profile_photo,

//             r.role_name,

//             u.created_at,
//             u.updated_at,
//             u.created_by,
//             u.updated_by,

//             cu.user_full_name AS created_by_name,
//             uu.user_full_name AS updated_by_name,

//             CAST(u.is_active AS UNSIGNED) AS is_active,

//             -- Enrolled training details
//             GROUP_CONCAT(
//                 DISTINCT t.training_title
//                 ORDER BY t.training_title
//                 SEPARATOR ', '
//             ) AS training_titles,

//             COUNT(DISTINCT e.training_id) AS training_count

//         FROM tbl_users u

//         INNER JOIN tbl_roles r
//             ON u.role_id = r.role_id

//         LEFT JOIN tbl_users cu
//             ON cu.user_id = u.created_by

//         LEFT JOIN tbl_users uu
//             ON uu.user_id = u.updated_by

//         LEFT JOIN tbl_enrollments e
//             ON e.user_id = u.user_id

//         LEFT JOIN tbl_trainings t
//             ON t.training_id = e.training_id

//         WHERE u.company_id = ?
//             AND r.role_code = 'STD'

//         GROUP BY
//             u.user_id,
//             u.user_full_name,
//             u.username,
//             u.user_email,
//             u.user_mobile_no,
//             u.user_qualification,
//             u.user_postal_address,
//             u.user_profile_photo,
//             r.role_name,
//             u.created_at,
//             u.updated_at,
//             u.created_by,
//             u.updated_by,
//             cu.user_full_name,
//             uu.user_full_name,
//             u.is_active

//         ORDER BY u.user_id DESC
//     `;

//     const [rows] = await db.query(sql, [companyId]);
//     return rows;
// };

exports.getCompanyEmployees = async (companyId) => {
    const sql = `
        SELECT
            u.user_id,
            u.user_full_name,
            u.username,
            u.user_email,
            u.user_mobile_no,
            u.user_qualification,
            u.user_postal_address,
            u.user_profile_photo,

            r.role_name,

            u.created_at,
            u.updated_at,
            u.created_by,
            u.updated_by,

            cu.user_full_name AS created_by_name,
            uu.user_full_name AS updated_by_name,

            CAST(u.is_active AS UNSIGNED) AS is_active,

            -- Enrolled training details with IDs
            COALESCE(
                et.trainings,
                JSON_ARRAY()
            ) AS trainings,

            COALESCE(et.training_count, 0) AS training_count

        FROM tbl_users u

        INNER JOIN tbl_roles r
            ON u.role_id = r.role_id

        LEFT JOIN tbl_users cu
            ON cu.user_id = u.created_by

        LEFT JOIN tbl_users uu
            ON uu.user_id = u.updated_by

        LEFT JOIN (
            SELECT
                training_data.user_id,

                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'training_id', training_data.training_id,
                        'training_title', training_data.training_title
                    )
                ) AS trainings,

                COUNT(*) AS training_count

            FROM (
                SELECT DISTINCT
                    e.user_id,
                    t.training_id,
                    t.training_title

                FROM tbl_enrollments e

                INNER JOIN tbl_trainings t
                    ON t.training_id = e.training_id

            ) AS training_data

            GROUP BY training_data.user_id

        ) AS et
            ON et.user_id = u.user_id

        WHERE u.company_id = ?
            AND r.role_code = 'STD'

        ORDER BY u.user_id DESC
    `;

    const [rows] = await db.query(sql, [companyId]);

    return rows;
};

exports.getEmployeeVideoActivityModel = async (
    companyId,
    userId
) => {

    // Step 1: Verify trainee belongs to this company
    const [employeeRows] = await db.query(
        `
        SELECT u.user_id
        FROM tbl_users u

        INNER JOIN tbl_roles r
            ON u.role_id = r.role_id

        WHERE u.user_id = ?
          AND u.company_id = ?
          AND r.role_code = 'STD'
        `,
        [userId, companyId]
    );

    if (employeeRows.length === 0) {
        return {
            authorized: false,
            data: []
        };
    }

    // Step 2: Fetch enrolled course video activity
    const [rows] = await db.query(
        `
        SELECT

            tr.training_id,
            tr.training_title,

            tp.topic_id,
            tp.topic_title,
            tp.topic_display_order,

            l.lesson_id,
            l.lesson_title,
            l.lesson_duration,
            l.lesson_order,

            COALESCE(
                lp.lesson_progress_completed,
                0
            ) AS is_completed,

            COALESCE(
                skips.skip_count,
                0
            ) AS skip_count

        FROM (
            SELECT DISTINCT user_id, training_id
            FROM tbl_enrollments
            WHERE user_id = ?
        ) e

        INNER JOIN tbl_trainings tr
            ON tr.training_id = e.training_id

        LEFT JOIN tbl_training_topics tp
            ON tp.training_id = tr.training_id

        LEFT JOIN tbl_training_lessons l
            ON l.topic_id = tp.topic_id
            AND l.lesson_content_type = 'video'

        LEFT JOIN tbl_lesson_progress lp
            ON lp.lesson_id = l.lesson_id
            AND lp.user_id = e.user_id

        LEFT JOIN (
            SELECT
                lesson_id,
                user_id,
                COUNT(*) AS skip_count

            FROM tbl_training_lesson_video_watch_log

            WHERE user_id = ?

            GROUP BY lesson_id, user_id

        ) skips
            ON skips.lesson_id = l.lesson_id
            AND skips.user_id = e.user_id

        ORDER BY
            tr.training_title,
            tp.topic_display_order,
            l.lesson_order
        `,
        [userId, userId]
    );

    // Step 3: Group results into training -> modules -> lessons

    const trainingMap = new Map();

    rows.forEach(row => {

        if (!trainingMap.has(row.training_id)) {
            trainingMap.set(row.training_id, {
                training_id: row.training_id,
                training_title: row.training_title,
                modules: []
            });
        }

        const training = trainingMap.get(row.training_id);

        // Skip module-less records
        if (!row.topic_id) return;

        let module = training.modules.find(
            item => item.module_id === row.topic_id
        );

        if (!module) {
            module = {
                module_id: row.topic_id,
                module_name: row.topic_title,
                lessons: []
            };

            training.modules.push(module);
        }

        // Skip records without a video lesson
        if (!row.lesson_id) return;

        module.lessons.push({
            lesson_id: row.lesson_id,
            lesson_title: row.lesson_title,

            // Stored in minutes
            video_duration: Number(row.lesson_duration || 0),

            is_completed: Boolean(row.is_completed),

            skip_count: Number(row.skip_count || 0)
        });

    });

    return {
        authorized: true,
        data: Array.from(trainingMap.values())
    };
};

/* Combine function instead of separate. */
exports.InsertEmployee = async (connection, employeeData) => {
    const userSql = `
        INSERT INTO tbl_users(
            user_full_name,
            username,
            user_email,
            user_mobile_no,
            user_password,

            user_qualification,
            user_postal_address,

            company_id,
            role_id,
            is_active,

            user_profile_photo,
            user_profile_cloud_id,
            created_by,
            updated_by
        )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const [userResult] = await connection.query(userSql, [
        employeeData.user_full_name,
        employeeData.username,
        employeeData.user_email,
        employeeData.user_mobile_no || null,
        employeeData.user_password,

        employeeData.user_qualification || null,
        employeeData.user_postal_address || null,

        employeeData.company_id,
        employeeData.role_id,
        employeeData.is_active ?? 1,

        employeeData.user_profile_photo || null,
        employeeData.user_profile_cloud_id || null,

        employeeData.created_by,
        employeeData.created_by
    ]);

    // return {
    //     userId: userResult.insertId

    // };
    return {
        user_id: userResult.insertId
    };
};




/* */
// exports.getCompanyCourses = async (companyId, connection = db) => {
//     const [rows] = await connection.query(
//         `
//     SELECT
//     ct.company_trainings_id,
//         ct.company_id,
//         ct.training_id,
//         ct.training_users_limit,
//         ct.training_expiry_on,
//         CAST(ct.is_active AS UNSIGNED) AS assignment_is_active,

//             t.course_id,
//             t.training_title,
//             t.training_description,
//             t.training_start_date,
//             t.training_end_date,
//             t.training_status,
//             t.publish_status,
//             t.enrollment_status,
//             t.publish_at,
//             t.enrollment_closed_at,

//             CAST(t.is_active AS UNSIGNED) AS is_active

//         FROM tbl_company_trainings ct

//         INNER JOIN tbl_trainings t
//             ON t.training_id = ct.training_id

//         INNER JOIN tbl_courses c
//             ON c.course_id = t.course_id

//     WHERE
//     ct.company_id = ?
//         AND ct.is_active = b'1'
//             AND ct.training_expiry_on > NOW()
//             AND t.is_active = b'1'
//             AND t.publish_status = 'PUBLISHED'
//             AND t.training_status = 'ACTIVE'

//         ORDER BY t.training_id DESC
//         `,
//         [companyId]
//     );

//     return rows;
// };


/* Updated - version  */

// exports.getCompanyCourses = async (companyId, connection = db) => {
//     const [rows] = await connection.query(
//         `
//         SELECT
//             ct.company_trainings_id,
//             ct.company_id,
//             ct.training_id,
//             ct.training_users_limit,
//             ct.training_expiry_on,
//             CAST(ct.is_active AS UNSIGNED) AS assignment_is_active,

//             t.course_id,
//             t.training_title,
//             t.training_description,
//             t.training_thumbnail,
//             t.training_duration_hours,
//             t.training_mode,

//             t.training_start_date,
//             t.training_end_date,
//             t.training_status,
//             t.publish_status,
//             t.enrollment_status,

//             t.publish_at,
//             t.enrollment_closed_at,

//             CAST(t.is_active AS UNSIGNED) AS is_active

//         FROM tbl_company_trainings ct

//         INNER JOIN tbl_trainings t
//             ON t.training_id = ct.training_id

//         INNER JOIN tbl_courses c
//             ON c.course_id = t.course_id

//         WHERE
//             ct.company_id = ?
//             AND ct.is_active = b'1'
//             AND ct.training_expiry_on > NOW()
//             AND t.is_active = b'1'
//             AND t.publish_status = 'PUBLISHED'
//             AND t.training_status = 'ACTIVE'

//         ORDER BY t.training_id DESC
//         `,
//         [companyId]
//     );

//     return rows;
// };


/* */
// exports.getCompanyCourses = async (companyId, connection = db) => {

//     const [rows] = await connection.query(
//         `
//         SELECT
//             -- Company training assignment details
//             ct.company_trainings_id,
//             ct.company_id,
//             ct.training_id,

//             ct.training_users_limit,
//             ct.training_expiry_on,

//             CAST(ct.is_active AS UNSIGNED)
//                 AS assignment_is_active,

//             -- Assignment created information
//             ct.created_by,
//             createdBy.user_full_name AS created_by_name,
//             ct.created_at,

//             -- Assignment updated information
//             ct.updated_by,
//             updatedBy.user_full_name AS updated_by_name,
//             ct.updated_at,

//             -- Course information
//             c.course_id,
//             c.course_name,
//             c.course_code,
//             c.course_level,

//             -- Training information
//             t.training_title,
//             t.training_description,
//             t.training_thumbnail,
//             t.training_duration_hours,
//             t.training_mode,

//             t.training_start_date,
//             t.training_end_date,
//             t.training_status,
//             t.publish_status,
//             t.enrollment_status,

//             t.publish_at,
//             t.enrollment_closed_at,

//             CAST(t.is_active AS UNSIGNED)
//                 AS training_is_active

//         FROM tbl_company_trainings ct

//         INNER JOIN tbl_trainings t
//             ON t.training_id = ct.training_id

//         INNER JOIN tbl_courses c
//             ON c.course_id = t.course_id

//         -- Super Admin who assigned the training
//         LEFT JOIN tbl_users createdBy
//             ON createdBy.user_id = ct.created_by

//         -- Super Admin who last updated the assignment
//         LEFT JOIN tbl_users updatedBy
//             ON updatedBy.user_id = ct.updated_by

//         WHERE
//             ct.company_id = ?
//             AND ct.is_active = b'1'
//             AND ct.training_expiry_on > NOW()
//             AND t.is_active = b'1'
//             AND t.publish_status = 'PUBLISHED'
//             AND t.training_status = 'ACTIVE'

//         ORDER BY
//             ct.created_at DESC
//         `,
//         [companyId]
//     );

//     return rows;
// };

exports.getCompanyCourses = async (companyId, connection = db) => {
    const [rows] = await connection.query(
        `
        SELECT
            -- Assignment details
            ct.company_trainings_id,
            ct.company_id,
            ct.training_id,
            ct.training_users_limit,
            ct.training_expiry_on,
            CAST(ct.is_active AS UNSIGNED) AS assignment_is_active,

            -- Assignment creator
            ct.created_by,
            creator.user_full_name AS created_by_name,
            ct.created_at,

            -- Assignment updater
            ct.updated_by,
            updater.user_full_name AS updated_by_name,
            ct.updated_at,

            -- Course details
            c.course_id,
            c.course_name,
            c.course_code,
            c.course_level,

            -- Training details
            t.training_title,
            t.training_description,
            t.training_thumbnail,
            t.training_duration_hours,
            t.training_mode,
            t.training_start_date,
            t.training_end_date,
            t.training_status,
            t.publish_status,
            t.enrollment_status,
            t.publish_at,
            t.enrollment_closed_at,
            CAST(t.is_active AS UNSIGNED) AS training_is_active

        FROM tbl_company_trainings ct

        INNER JOIN tbl_trainings t
            ON t.training_id = ct.training_id

        INNER JOIN tbl_courses c
            ON c.course_id = t.course_id

        LEFT JOIN tbl_users creator
            ON creator.user_id = ct.created_by

        LEFT JOIN tbl_users updater
            ON updater.user_id = ct.updated_by

        WHERE
            ct.company_id = ?
            AND ct.is_active = b'1'
            AND ct.training_expiry_on > NOW()
            AND t.is_active = b'1'
            AND t.publish_status = 'PUBLISHED'
            AND t.training_status = 'ACTIVE'

        ORDER BY ct.created_at DESC
        `,
        [companyId]
    );

    return rows;
};

/** */
// exports.enrollEmployeeInTrainings = async (
//     connection,
//     {
//         companyId,
//         traineeId,
//         trainingIds,
//         createdBy
//     }
// ) => {
//     // 1. Validate training IDs
//     if (!Array.isArray(trainingIds) || trainingIds.length === 0) {
//         throw new Error("Please select at least one training.");
//     }

//     const uniqueTrainingIds = [
//         ...new Set(trainingIds.map(Number))
//     ];

//     if (
//         uniqueTrainingIds.some(
//             id => !Number.isInteger(id) || id <= 0
//         )
//     ) {
//         throw new Error("Invalid training IDs.");
//     }

//     const userId = Number(traineeId);

//     if (!Number.isInteger(userId) || userId <= 0) {
//         throw new Error("Invalid trainee ID.");
//     }

//     // 2. Verify trainee belongs to this company and is active
//     const [trainees] = await connection.query(
//         `
//         SELECT user_id
//         FROM tbl_users
//         WHERE
//             user_id = ?
//             AND company_id = ?
//             AND is_active = b'1'
//         `,
//         [userId, companyId]
//     );

//     if (trainees.length === 0) {
//         throw new Error(
//             "Trainee does not belong to your company, is inactive, or does not exist."
//         );
//     }

//     // 3. Lock and verify company training assignments
//     // Sort IDs to maintain a consistent lock order.
//     const sortedTrainingIds = [...uniqueTrainingIds].sort(
//         (a, b) => a - b
//     );

//     const placeholders = sortedTrainingIds
//         .map(() => "?")
//         .join(",");

//     const [assignments] = await connection.query(
//         `
//         SELECT
//             ct.company_trainings_id,
//             ct.training_id,
//             ct.training_users_limit,
//             ct.training_expiry_on,

//             t.training_title

//         FROM tbl_company_trainings ct

//         INNER JOIN tbl_trainings t
//             ON t.training_id = ct.training_id

//         WHERE
//             ct.company_id = ?
//             AND ct.training_id IN (${placeholders})
//             AND ct.is_active = b'1'
//             AND ct.training_expiry_on > NOW()
//             AND t.is_active = b'1'
//             AND t.publish_status = 'PUBLISHED'
//             AND t.training_status = 'ACTIVE'

//         ORDER BY ct.training_id
//         FOR UPDATE
//         `,
//         [companyId, ...sortedTrainingIds]
//     );

//     if (assignments.length !== uniqueTrainingIds.length) {
//         throw new Error(
//             "One or more selected trainings are not assigned to your company, inactive, or expired."
//         );
//     }

//     const assignmentMap = new Map(
//         assignments.map(item => [
//             Number(item.training_id),
//             item
//         ])
//     );

//     // 4. Find existing pending/approved enrollments
//     const [existingEnrollments] = await connection.query(
//         `
//         SELECT training_id, user_id
//         FROM tbl_enrollments
//         WHERE
//             user_id = ?
//             AND training_id IN (${placeholders})
//             AND enroll_status IN ('P', 'A')
//         `,
//         [userId, ...sortedTrainingIds]
//     );

//     const alreadyEnrolled = new Set(
//         existingEnrollments.map(
//             row => Number(row.training_id)
//         )
//     );

//     const newTrainingIds = uniqueTrainingIds.filter(
//         id => !alreadyEnrolled.has(id)
//     );

//     // 5. Check company-wide training capacity
//     for (const trainingId of newTrainingIds) {
//         const assignment = assignmentMap.get(trainingId);

//         const [countRows] = await connection.query(
//             `
//             SELECT COUNT(DISTINCT e.user_id) AS enrolled_count
//             FROM tbl_enrollments e

//             INNER JOIN tbl_users u
//                 ON u.user_id = e.user_id

//             WHERE
//                 e.training_id = ?
//                 AND u.company_id = ?
//                 AND e.enroll_status IN ('P', 'A')
//             `,
//             [trainingId, companyId]
//         );

//         const enrolledCount = Number(
//             countRows[0].enrolled_count
//         );

//         const userLimit = Number(
//             assignment.training_users_limit
//         );

//         if (enrolledCount >= userLimit) {
//             throw new Error(
//                 `The enrollment limit for "${assignment.training_title}" has been reached.`
//             );
//         }
//     }

//     // 6. Insert approved enrollments
//     if (newTrainingIds.length > 0) {
//         const values = newTrainingIds
//             .map(() => "(?, ?, 'A', ?)")
//             .join(",");

//         const params = newTrainingIds.flatMap(
//             trainingId => [
//                 userId,
//                 trainingId,
//                 createdBy
//             ]
//         );

//         await connection.query(
//             `
//             INSERT INTO tbl_enrollments
//                 (user_id, training_id, enroll_status, created_by)
//             VALUES ${values}
//             `,
//             params
//         );
//     }

//     return {
//         requested: uniqueTrainingIds.length,
//         enrolled: newTrainingIds.length,
//         alreadyEnrolled: alreadyEnrolled.size,
//         enrolledTrainingIds: newTrainingIds,
//         alreadyEnrolledTrainingIds: [
//             ...alreadyEnrolled
//         ]
//     };
// };


exports.enrollEmployeeInTrainings = async (
    connection,
    {
        companyId,
        userId,
        trainingIds,
        createdBy
    }
) => {
    // 1. Validate training IDs
    if (!Array.isArray(trainingIds) || trainingIds.length === 0) {
        // throw new Error("Please select at least one training.");
        throw new Error("Please select at least one course.");
    }

    const uniqueTrainingIds = [
        ...new Set(trainingIds.map(Number))
    ];

    if (
        uniqueTrainingIds.some(
            id => !Number.isInteger(id) || id <= 0
        )
    ) {
        // throw new Error("Invalid training IDs.");
        throw new Error("Invalid course IDs.");
    }

    userId = Number(userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("Invalid user ID.");
    }

    // 2. Verify employee belongs to this company and is active
    const [employees] = await connection.query(
        `
        SELECT user_id
        FROM tbl_users
        WHERE
            user_id = ?
            AND company_id = ?
            AND is_active = b'1'
        `,
        [userId, companyId]
    );

    if (employees.length === 0) {
        throw new Error(
            // "Employee does not belong to your company, is inactive, or does not exist."
            "Trainee does not belong to your company, is inactive, or does not exist."
        );
    }

    // 3. Lock and verify company training assignments
    const sortedTrainingIds = [...uniqueTrainingIds].sort(
        (a, b) => a - b
    );

    const placeholders = sortedTrainingIds
        .map(() => "?")
        .join(",");

    const [assignments] = await connection.query(
        `
        SELECT
            ct.company_trainings_id,
            ct.training_id,
            ct.training_users_limit,
            ct.training_expiry_on,
            t.training_title

        FROM tbl_company_trainings ct

        INNER JOIN tbl_trainings t
            ON t.training_id = ct.training_id

        WHERE
            ct.company_id = ?
            AND ct.training_id IN (${placeholders})
            AND ct.is_active = b'1'
            AND ct.training_expiry_on > NOW()
            AND t.is_active = b'1'
            AND t.publish_status = 'PUBLISHED'
            AND t.training_status = 'ACTIVE'

        ORDER BY ct.training_id
        FOR UPDATE
        `,
        [companyId, ...sortedTrainingIds]
    );

    if (assignments.length !== uniqueTrainingIds.length) {
        throw new Error(
            // "One or more selected trainings are not assigned to your company, inactive, or expired."
            "One or more selected trainings are not assigned to your company, inactive, or expired."
        );
    }

    const assignmentMap = new Map(
        assignments.map(item => [
            Number(item.training_id),
            item
        ])
    );

    // 4. Find existing pending or approved enrollments
    const [existingEnrollments] = await connection.query(
        `
        SELECT training_id, user_id
        FROM tbl_enrollments
        WHERE
            user_id = ?
            AND training_id IN (${placeholders})
            AND enroll_status IN ('P', 'A')
        `,
        [userId, ...sortedTrainingIds]
    );

    const alreadyEnrolled = new Set(
        existingEnrollments.map(
            row => Number(row.training_id)
        )
    );

    const newTrainingIds = uniqueTrainingIds.filter(
        id => !alreadyEnrolled.has(id)
    );

    // 5. Check company-wide training capacity
    for (const trainingId of newTrainingIds) {
        const assignment = assignmentMap.get(trainingId);

        const [countRows] = await connection.query(
            `
            SELECT COUNT(DISTINCT e.user_id) AS enrolled_count

            FROM tbl_enrollments e

            INNER JOIN tbl_users u
                ON u.user_id = e.user_id

            WHERE
                e.training_id = ?
                AND u.company_id = ?
                AND e.enroll_status IN ('P', 'A')
            `,
            [trainingId, companyId]
        );

        const enrolledCount = Number(
            countRows[0].enrolled_count
        );

        const userLimit = Number(
            assignment.training_users_limit
        );

        if (enrolledCount >= userLimit) {
            throw new Error(
                `The enrollment limit for "${assignment.training_title}" has been reached.`
            );
        }
    }

    // 6. Insert new approved enrollments
    if (newTrainingIds.length > 0) {
        const values = newTrainingIds
            .map(() => "(?, ?, 'A', ?)")
            .join(",");

        const params = newTrainingIds.flatMap(
            trainingId => [
                userId,
                trainingId,
                createdBy
            ]
        );

        await connection.query(
            `
            INSERT INTO tbl_enrollments
                (user_id, training_id, enroll_status, created_by)
            VALUES ${values}
            `,
            params
        );
    }

    return {
        requested: uniqueTrainingIds.length,
        enrolled: newTrainingIds.length,
        alreadyEnrolled: alreadyEnrolled.size,
        enrolledTrainingIds: newTrainingIds,
        alreadyEnrolledTrainingIds: [...alreadyEnrolled]
    };
};
