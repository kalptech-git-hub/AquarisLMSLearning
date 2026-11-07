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

/* Combine function instead of separate. */
exports.InsertEmployee = async (connection, employeeData) => {
    const userSql = `
        INSERT INTO tbl_users (
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    return {
        userId: userResult.insertId

    };
};
