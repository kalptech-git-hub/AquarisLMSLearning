const { welcomeEmailTemplate } = require("../utils/emailTemplate");
const transporter = require("../utils/transporter");
const bcrypt = require("bcrypt");

const db = require("./db");
require("dotenv").config();

exports.getStudentRole = async () => {

  const sql = `
        SELECT role_id
        FROM tbl_roles
        WHERE role_code = 'STD'
        LIMIT 1
    `;

  const [rows] = await db.query(sql);

  return rows[0];
};

exports.getRoleByCode = async (connection, roleCode) => {

  const sql = `
        SELECT role_id
        FROM tbl_roles
        WHERE role_code = ?
        LIMIT 1
    `;

  const [rows] = await connection.query(sql, [roleCode]);

  return rows[0];
};

exports.insertUser = async (connection, user) => {
  // Check duplicate email/username/mobile
  try {
    const checkQuery = `
        SELECT * FROM tbl_users
        WHERE user_email=? OR username=? OR user_mobile_no=?
    `;

    const [existingUsers] = await connection.query(checkQuery, [
      user.user_email,
      user.username,
      user.user_mobile_no
    ]);

    if (existingUsers.length > 0) {
      const errors = [];

      existingUsers.forEach(u => {

        if (u.user_email === user.user_email)
          errors.push("Email already exists");

        if (u.username === user.username)
          errors.push("Username already exists");

        if (u.user_mobile_no === user.user_mobile_no)
          errors.push("Mobile number already exists");

      });

      const error = new Error(errors.join(", "));
      error.code = "DUPLICATE_ENTRY";
      throw error;
    }

    const insertQuery = `
      INSERT INTO tbl_users(
        user_full_name, user_mobile_no, username, user_profile_photo,
        user_email, user_password, role_id, created_by, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const hashedPassword = await bcrypt.hash(user.user_password, 10);

    const [result] = await connection.query(insertQuery, [
      user.user_full_name,
      user.user_mobile_no,
      user.username,
      user.user_profile_photo,
      user.user_email,
      hashedPassword,
      user.role_id,
      user.created_by || 0,
      user.updated_by || 0,
      user.created_at,
      user.updated_at,
    ]);

    const createdAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    console.log(`User created at: ${createdAt}`);

    // const role = um_role == 3 ? "Tester" : "Developer";

    // console.log("Before sendMail");

    // console.log(transporter);
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: user.user_email,
    //   subject: "Welcome to Nihongo LMS!",
    //   html: welcomeEmailTemplate({
    //     recipientName: user.user_full_name,
    //     username: user.username,
    //     email: user.user_email,
    //     role: "Student",
    //     date: new Date().toLocaleString("en-IN", {
    //       timeZone: "Asia/Kolkata"
    //     })
    //   })
    // });

    // console.log("After sendMail");
    // console.log(info);

    return result.insertId;
  } catch (error) {
    throw error;
  }
};

exports.updateUserPhoto = async (connection, userId, photoPath, photoCloudId = null) => {

  const sql = `
        UPDATE tbl_users
        SET user_profile_photo = ?,
            user_profile_cloud_id = ?
        WHERE user_id = ?
    `;

  await connection.execute(sql, [photoPath, photoCloudId, userId]);

};

exports.updateUserProfile = async (connection, userId, profile) => {
  const duplicateQuery = `
    SELECT user_id, user_email, username, user_mobile_no
    FROM tbl_users
    WHERE (user_email = ? OR username = ? OR user_mobile_no = ?)
      AND user_id <> ?
    LIMIT 1
  `;

  const [duplicates] = await connection.query(duplicateQuery, [
    profile.user_email,
    profile.username,
    profile.user_mobile_no,
    userId
  ]);

  if (duplicates.length > 0) {
    const duplicate = duplicates[0];
    const errors = [];

    if (duplicate.user_email?.toLowerCase() === profile.user_email?.toLowerCase()) {
      errors.push("Email already exists");
    }

    if (duplicate.username?.toLowerCase() === profile.username?.toLowerCase()) {
      errors.push("Username already exists");
    }

    if (duplicate.user_mobile_no === profile.user_mobile_no) {
      errors.push("Mobile number already exists");
    }

    const error = new Error(errors.join(", "));
    error.code = "DUPLICATE_ENTRY";
    throw error;
  }

  await connection.query(
    `
      UPDATE tbl_users
      SET user_full_name = ?,
          user_mobile_no = ?,
          username = ?,
          user_email = ?,
          updated_at = NOW()
      WHERE user_id = ?
    `,
    [
      profile.user_full_name,
      profile.user_mobile_no,
      profile.username,
      profile.user_email,
      userId
    ]
  );

  if (profile.role_code === "INS") {
    await connection.query(
      `
        UPDATE tbl_instructors
        SET ins_bio = ?,
            ins_qualification = ?,
            ins_experience = ?,
            updated_at = NOW()
        WHERE user_id = ?
      `,
      [
        profile.biography,
        profile.qualification,
        profile.experience,
        userId
      ]
    );
  }

  if (profile.role_code === "STD" && profile.address !== undefined) {
    await connection.query(
      `
        UPDATE tbl_enrollments
        SET enroll_postal_address = ?,
            updated_at = NOW()
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [profile.address, userId]
    );
  }
};


exports.findUserByEmail = async (email) => {

  const sql = `
    SELECT
      u.user_id,
      u.user_full_name,
      u.user_mobile_no,
      u.username,
      u.user_profile_photo,
      u.user_profile_cloud_id,
      u.user_email,
      u.user_password,
      u.role_id,
      u.company_id,
      u.created_at,
      (
        SELECT e.enroll_postal_address
        FROM tbl_enrollments e
        WHERE e.user_id = u.user_id
        ORDER BY e.created_at DESC
        LIMIT 1
      ) AS address,
      (
        SELECT COUNT(*)
        FROM tbl_enrollments e
        WHERE e.user_id = u.user_id
          AND e.enroll_status = 'A'
      ) AS enrolled_count,
      i.ins_qualification AS qualification,
      i.ins_experience AS experience,
      i.ins_bio AS biography,
      r.role_code,
      r.role_name,
      CAST(u.is_active AS UNSIGNED) AS is_active
    FROM tbl_users u
    INNER JOIN tbl_roles r
      ON u.role_id = r.role_id
    LEFT JOIN tbl_instructors i
      ON i.user_id = u.user_id
    WHERE u.user_email = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [email]);

  return rows[0];
};

exports.getUserById = async (id) => {
  const sql = `
    SELECT
      u.user_id,
      u.user_full_name,
      u.user_mobile_no,
      u.username,
      u.user_profile_photo,
      u.user_profile_cloud_id,
      u.user_email,
      u.role_id,
      u.company_id,
      u.created_at,
      u.updated_at,
      u.user_last_login,
      (
        SELECT e.enroll_postal_address
        FROM tbl_enrollments e
        WHERE e.user_id = u.user_id
        ORDER BY e.created_at DESC
        LIMIT 1
      ) AS address,
      (
        SELECT COUNT(*)
        FROM tbl_enrollments e
        WHERE e.user_id = u.user_id
          AND e.enroll_status = 'A'
      ) AS enrolled_count,
      i.ins_qualification AS qualification,
      i.ins_experience AS experience,
      i.ins_bio AS biography,
      r.role_code,
      r.role_name,
      CAST(u.is_active AS UNSIGNED) AS is_active
    FROM tbl_users u
    INNER JOIN tbl_roles r ON u.role_id = r.role_id
    LEFT JOIN tbl_instructors i ON i.user_id = u.user_id
    WHERE u.user_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [id]);

  return rows[0];
};
exports.saveResetToken = async (userId, token, expiry) => {

  const sql = `
    UPDATE tbl_users
    SET reset_token = ?, reset_token_expiry = ?
    WHERE user_id = ?
  `;

  await db.query(sql, [token, expiry, userId]);
};

exports.findUserByResetToken = async (token) => {

  const sql = `
    SELECT
      user_id,
      user_full_name,
      user_email,
      reset_token_expiry
    FROM tbl_users
    WHERE reset_token = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [token]);

  return rows[0];
};

exports.updateUserPassword = async (userId, hashedPassword) => {

  const sql = `
    UPDATE tbl_users
    SET user_password = ?, reset_token = NULL, reset_token_expiry = NULL
    WHERE user_id = ?
  `;

  await db.query(sql, [hashedPassword, userId]);
};

exports.updateUserLastLogin = async (userId) => {

  const sql = `
    UPDATE tbl_users
    SET user_last_login = NOW()
    WHERE user_id = ?
  `;

  await db.query(sql, [userId]);

};