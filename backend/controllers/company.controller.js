const bcrypt = require("bcrypt");
const db = require("../models/db");
const uploadFileToCloudinary = require("../utils/uploadFileToCloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const {
    getStudentRoleId,
    checkDuplicateUser,
    InsertEmployee,
    getCompanyEmployees,
    getCompanyCourses,
    enrollEmployeeInTrainings,
    getAllCompanies,
    getEmployeeVideoActivityModel,
} = require("../models/company.model");



exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await getAllCompanies();

        return res.status(200).json({
            success: true,
            message: "Companies fetched successfully.",
            companies
        });

    } catch (error) {
        console.error("Get All Companies Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch companies."
        });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const companyId = req.user?.company_id;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "Company access denied"
            });
        }

        const employees = await getCompanyEmployees(companyId);

        return res.status(200).json({
            success: true,
            data: employees
        });

    } catch (error) {
        console.error("Get Employees Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.getEmployeeVideoActivity = async (req, res) => {
    console.log("called fetch video logs")
    try {
        const companyId = req.user?.company_id;
        const userId = Number(req.params.userId);

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "Company access denied"
            });
        }

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid trainee ID"
            });
        }

        const result = await getEmployeeVideoActivityModel(
            companyId,
            userId
        );

        if (!result.authorized) {
            return res.status(404).json({
                success: false,
                message: "Trainee not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error("GET EMPLOYEE VIDEO ACTIVITY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch trainee video activity"
        });
    }
};

exports.getEmployeeTrainingProgress = async (req, res) => {
  const { userId } = req.params;
  const companyId = req.user?.company_id;

  try {
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company access denied",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const [students] = await db.query(
      `
      SELECT
          t.training_id,
          t.training_title,

          COUNT(DISTINCT tl.lesson_id) AS total_lessons,

          COUNT(
              DISTINCT CASE
                  WHEN lp.lesson_progress_completed = TRUE
                  THEN tl.lesson_id
              END
          ) AS completed_lessons,

          CASE
              WHEN COUNT(DISTINCT tl.lesson_id) = 0 THEN 0
              ELSE ROUND(
                  COUNT(
                      DISTINCT CASE
                          WHEN lp.lesson_progress_completed = TRUE
                          THEN tl.lesson_id
                      END
                  ) * 100.0 / COUNT(DISTINCT tl.lesson_id)
              )
          END AS progress

      FROM tbl_enrollments e

      INNER JOIN tbl_users u
          ON u.user_id = e.user_id

      INNER JOIN tbl_trainings t
          ON t.training_id = e.training_id

      INNER JOIN tbl_company_trainings ct
          ON ct.training_id = e.training_id
          AND ct.company_id = u.company_id

      LEFT JOIN tbl_training_topics tt
          ON tt.training_id = e.training_id

      LEFT JOIN tbl_training_lessons tl
          ON tl.topic_id = tt.topic_id
          AND tl.lesson_content_type <> 'live'

      LEFT JOIN tbl_lesson_progress lp
          ON lp.user_id = e.user_id
          AND lp.lesson_id = tl.lesson_id

      WHERE e.user_id = ?
        AND e.enroll_status = 'A'
        AND u.company_id = ?
        AND u.role_id = (
            SELECT role_id
            FROM tbl_roles
            WHERE role_code = 'STD'
            LIMIT 1
        )

      GROUP BY
          t.training_id,
          t.training_title

      ORDER BY t.training_title ASC
      `,
      [userId, companyId]
    );

    return res.status(200).json({
      success: true,
      data: students,
    });

  } catch (error) {
    console.error("GET EMPLOYEE COURSE PROGRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee training progress",
      error: error.message,
    });
  }
};


exports.getCompanyById = async (req, res) => {
    let connection;

    try {
        const companyId = Number(req.params.companyId);

        if (!Number.isInteger(companyId) || companyId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid company ID."
            });
        }

        connection = await db.getConnection();

        // -----------------------------------
        // 1. FETCH COMPANY DETAILS
        // -----------------------------------

        const [companies] = await connection.execute(
            `
            SELECT
                company_id,
                company_name,
                company_email,
                company_mobile_no,
                company_address,
                is_active,
                created_by,
                updated_by,
                created_at,
                updated_at

            FROM tbl_companies

            WHERE company_id = ?

            LIMIT 1
            `,
            [companyId]
        );

        if (companies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found."
            });
        }

        const company = companies[0];

        // -----------------------------------
        // 2. FETCH COMPANY ADMIN DETAILS
        // -----------------------------------

        const [admins] = await connection.execute(
            `
            SELECT
                u.user_id,
                u.user_full_name,
                u.username,
                u.user_email,
                u.user_mobile_no,
                u.is_active,
                u.created_at,
                u.updated_at

            FROM tbl_users u

            INNER JOIN tbl_roles r
                ON r.role_id = u.role_id

            WHERE
                u.company_id = ?
                AND r.role_code = 'CAD'

            LIMIT 1
            `,
            [companyId]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company Admin not found."
            });
        }

        const admin = admins[0];

        // -----------------------------------
        // 3. FETCH ASSIGNED TRAININGS
        // -----------------------------------

        const [trainings] = await connection.execute(
            `
            SELECT
                ct.company_trainings_id,
                ct.training_id,
                t.training_title,
                ct.training_users_limit,

                DATE_FORMAT(
                    ct.training_expiry_on,
                    '%Y-%m-%d'
                ) AS training_expiry_on,

                ct.is_active

            FROM tbl_company_trainings ct

            INNER JOIN tbl_trainings t
                ON t.training_id = ct.training_id

            WHERE
                ct.company_id = ?
                AND ct.is_active = b'1'

            ORDER BY ct.company_trainings_id ASC
            `,
            [companyId]
        );

        // -----------------------------------
        // 4. RETURN DETAILS
        // -----------------------------------

        return res.status(200).json({
            success: true,
            message: "Company details fetched successfully.",

            data: {
                company,
                admin,
                trainings
            }
        });

    } catch (error) {

        console.error("Get Company Details Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch company details.",
            error: error.message
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};

exports.createCompany = async (req, res) => {
    let connection;

    try {
        const superAdminId = req.user.user_id;

        const { company, admin } = req.body;

        // -----------------------------------
        // 1. BASIC VALIDATION
        // -----------------------------------

        if (
            !company ||
            !company.company_name?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Company name is required."
            });
        }

        if (
            !admin ||
            !admin.user_full_name?.trim() ||
            !admin.username?.trim() ||
            !admin.user_email?.trim() ||
            !admin.password
        ) {
            return res.status(400).json({
                success: false,
                message: "Complete Company Admin details are required."
            });
        }



        // -----------------------------------
        // 3. START TRANSACTION
        // -----------------------------------

        connection = await db.getConnection();

        await connection.beginTransaction();

        // -----------------------------------
        // 4. CHECK COMPANY ADMIN DUPLICATES
        // -----------------------------------

        const [existingUsers] = await connection.execute(
            `
            SELECT user_id, username, user_email, user_mobile_no
            FROM tbl_users
            WHERE username = ?
               OR user_email = ?
               OR (
                    ? IS NOT NULL
                    AND ? != ''
                    AND user_mobile_no = ?
               )
            LIMIT 1
            `,
            [
                admin.username.trim(),
                admin.user_email.trim(),
                admin.user_mobile_no || null,
                admin.user_mobile_no || "",
                admin.user_mobile_no || null
            ]
        );

        if (existingUsers.length > 0) {

            const existing = existingUsers[0];

            let message = "Company Admin details already exist.";

            if (existing.username === admin.username.trim()) {
                message = "Username already exists.";
            } else if (
                existing.user_email === admin.user_email.trim()
            ) {
                message = "Email already exists.";
            } else if (
                admin.user_mobile_no &&
                existing.user_mobile_no === admin.user_mobile_no
            ) {
                message = "Mobile number already exists.";
            }

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message
            });
        }

        // -----------------------------------
        // 5. GET COMPANY ADMIN ROLE
        // -----------------------------------

        const [roles] = await connection.execute(
            `
            SELECT role_id
            FROM tbl_roles
            WHERE role_code = 'CAD'
            LIMIT 1
            `
        );

        if (roles.length === 0) {
            throw new Error("Company Admin role not found.");
        }

        const companyAdminRoleId = roles[0].role_id;


        // -----------------------------------
        // 7. CREATE COMPANY
        // -----------------------------------

        const [companyResult] = await connection.execute(
            `
            INSERT INTO tbl_companies (
                company_name,
                company_email,
                company_mobile_no,
                company_address,
                is_active,
                created_by,
                updated_by
            )
            VALUES (?, ?, ?, ?, b'1', ?, ?)
            `,
            [
                company.company_name.trim(),
                company.company_email || null,
                company.company_mobile_no || null,
                company.company_address || null,
                superAdminId,
                superAdminId
            ]
        );

        const companyId = companyResult.insertId;

        // -----------------------------------
        // 8. HASH COMPANY ADMIN PASSWORD
        // -----------------------------------

        const hashedPassword = await bcrypt.hash(
            admin.password,
            10
        );

        // -----------------------------------
        // 9. CREATE COMPANY ADMIN USER
        // -----------------------------------

        const [adminResult] = await connection.execute(
            `
            INSERT INTO tbl_users (
                user_full_name,
                username,
                user_email,
                user_mobile_no,
                user_password,
                role_id,
                company_id,
                is_active,
                created_by,
                updated_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, b'1', ?, ?)
            `,
            [
                admin.user_full_name.trim(),
                admin.username.trim(),
                admin.user_email.trim(),
                admin.user_mobile_no || null,
                hashedPassword,
                companyAdminRoleId,
                companyId,
                superAdminId,
                superAdminId
            ]
        );

        const companyAdminId = adminResult.insertId;


        // -----------------------------------
        // 11. COMMIT TRANSACTION
        // -----------------------------------

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Company and Company Admin created successfully.",
            data: {
                company_id: companyId,
                company_admin_id: companyAdminId,
            }
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Create Company Error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Duplicate company admin username, email or mobile number."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create company.",
            error: error.message
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};

/* ASSIGN TRAININGS TO COMPANY */
exports.assignTrainingsToCompany = async (req, res) => {
    let connection;

    try {
        const companyId = Number(req.params.companyId);
        const superAdminId = req.user.user_id;

        const { trainings } = req.body;

        // 1. Validate company ID
        if (!Number.isInteger(companyId) || companyId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid company ID."
            });
        }

        // 2. Validate selected courses
        if (!Array.isArray(trainings) || trainings.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one course."
            });
        }

        const trainingIds = trainings.map(
            item => Number(item.training_id)
        );

        if (
            trainingIds.some(
                id => !Number.isInteger(id) || id <= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID."
            });
        }

        if (new Set(trainingIds).size !== trainingIds.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate courses are not allowed."
            });
        }

        // 3. Validate user limit and expiry
        for (const training of trainings) {
            const limit = Number(training.training_users_limit);
            const expiryDate = new Date(training.training_expiry_on);

            if (!Number.isInteger(limit) || limit <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Course user limit must be greater than zero."
                });
            }

            if (
                !training.training_expiry_on ||
                Number.isNaN(expiryDate.getTime()) ||
                expiryDate <= new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid future expiry date."
                });
            }
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 4. Verify company exists and is active
        const [companies] = await connection.execute(
            `
            SELECT company_id
            FROM tbl_companies
            WHERE company_id = ?
              AND is_active = b'1'
            FOR UPDATE
            `,
            [companyId]
        );

        if (companies.length === 0) {
            throw new Error("Company does not exist or is inactive.");
        }

        // 5. Verify all selected courses exist and are active
        const placeholders = trainingIds.map(() => "?").join(",");

        const [existingTrainings] = await connection.execute(
            `
            SELECT training_id, training_title
            FROM tbl_trainings
            WHERE training_id IN (${placeholders})
              AND is_active = b'1'
              AND publish_status = 'PUBLISHED'
              AND training_status = 'ACTIVE'
            `,
            trainingIds
        );

        if (existingTrainings.length !== trainingIds.length) {
            throw new Error(
                "One or more selected courses are invalid, inactive, or unpublished."
            );
        }

        // 6. Check existing company assignments
        const [existingAssignments] = await connection.execute(
            `
            SELECT training_id
            FROM tbl_company_trainings
            WHERE company_id = ?
              AND training_id IN (${placeholders})
            FOR UPDATE
            `,
            [companyId, ...trainingIds]
        );

        if (existingAssignments.length > 0) {
            const existingIds = existingAssignments.map(
                row => Number(row.training_id)
            );

            const existingNames = existingTrainings
                .filter(item => existingIds.includes(Number(item.training_id)))
                .map(item => item.training_title);

            throw new Error(
                `Already assigned to this company: ${existingNames.join(", ")}.`
            );
        }

        // 7. Insert course assignments
        const values = [];
        const placeholdersForInsert = trainings.map(training => {
            values.push(
                companyId,
                Number(training.training_id),
                Number(training.training_users_limit),
                `${training.training_expiry_on} 23:59:59`,
                superAdminId,
                superAdminId
            );

            return "(?, ?, ?, ?, b'1', ?, ?)";
        });

        await connection.execute(
            `
            INSERT INTO tbl_company_trainings (
                company_id,
                training_id,
                training_users_limit,
                training_expiry_on,
                is_active,
                created_by,
                updated_by
            )
            VALUES ${placeholdersForInsert.join(", ")}
            `,
            values
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Courses assigned to company successfully.",
            data: {
                company_id: companyId,
                assigned_courses: trainings.length
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Assign Courses To Company Error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to assign courses."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};



exports.createEmployee = async (req, res) => {
    let connection;
    let uploadedCloudId = null;
    let transactionStarted = false;

    try {
        const companyId = req.user.company_id;
        const adminUserId = req.user.user_id;

        const {
            user_full_name,
            username,
            user_email,
            user_mobile_no,
            user_password,
            user_qualification,
            user_postal_address,
            is_active
        } = req.body;

        // 1. Basic validation
        if (
            !user_full_name?.trim() ||
            !user_email?.trim() ||
            !user_password
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required."
            });
        }

        if (!companyId || !adminUserId) {
            return res.status(403).json({
                success: false,
                message: "Invalid company admin account."
            });
        }

        const normalizedEmail = user_email.trim().toLowerCase();
        const normalizedMobile = user_mobile_no?.trim() || null;

        const finalUsername = (
            username?.trim() ||
            normalizedEmail.split("@")[0]
        );

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (
            is_active !== undefined &&
            !["0", "1", 0, 1].includes(is_active)
        ) {
            return res.status(400).json({
                success: false,
                message: "is_active must be either 0 or 1."
            });
        }

        const activeStatus = Number(is_active ?? 1);

        connection = await db.getConnection();

        // 2. Validate employee role
        const roleId = await getStudentRoleId(connection);

        // 3. Check duplicate email, username and mobile
        const duplicates = await checkDuplicateUser(connection, {
            email: normalizedEmail,
            username: finalUsername,
            mobile: normalizedMobile
        });

        if (duplicates.length) {
            return res.status(409).json({
                success: false,
                message: "Email, username or mobile number already exists."
            });
        }

        // 4. Upload profile photo
        let profilePhotoUrl = null;

        if (req.file) {
            const uploadResult = await uploadFileToCloudinary(
                req.file.buffer,
                "user_profile_photos",
                "image"
            );

            profilePhotoUrl = uploadResult.secure_url;
            uploadedCloudId = uploadResult.public_id;
        }

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(user_password, 10);

        // 6. Start transaction
        await connection.beginTransaction();
        transactionStarted = true;

        // 7. Create employee in tbl_users only
        const result = await InsertEmployee(connection, {
            user_full_name: user_full_name.trim(),
            username: finalUsername,
            user_email: normalizedEmail,
            user_mobile_no: normalizedMobile,
            user_password: hashedPassword,

            user_qualification:
                user_qualification?.trim() || null,

            user_postal_address:
                user_postal_address?.trim() || null,

            company_id: companyId,
            role_id: roleId,

            is_active: activeStatus,

            user_profile_photo: profilePhotoUrl,
            user_profile_cloud_id: uploadedCloudId,

            created_by: adminUserId
        });

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Employee created successfully.",
            data: {
                user_id: result.user_id
            }
        });

    } catch (error) {

        if (connection && transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        // Remove uploaded photo if database operation fails
        if (uploadedCloudId) {
            try {
                await deleteFromCloudinary(
                    uploadedCloudId,
                    "image"
                );
            } catch (cleanupError) {
                console.error(
                    "Cloudinary cleanup error:",
                    cleanupError
                );
            }
        }

        console.error("Create Employee Error:", error);

        const duplicateError = error.code === "ER_DUP_ENTRY";

        return res.status(
            error.statusCode || (duplicateError ? 409 : 500)
        ).json({
            success: false,
            message: duplicateError
                ? "Email, username or mobile number already exists."
                : error.message || "Failed to create employee."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};



exports.getCourses = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const courses = await getCompanyCourses(companyId);

        return res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Company Courses Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch company courses",
        });
    }
};


// exports.enrollEmployee = async (req, res) => {
//     let connection;

//     try {
//         const companyId = req.user.company_id;
//         const createdBy = req.user.user_id;

//         const { trainee_id, training_ids } = req.body;

//         if (!companyId) {
//             return res.status(403).json({
//                 success: false,
//                 message: "No company associated with this account."
//             });
//         }

//         if (!trainee_id) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please select a trainee."
//             });
//         }

//         if (
//             !Array.isArray(training_ids) ||
//             training_ids.length === 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please select at least one training."
//             });
//         }

//         connection = await db.getConnection();

//         await connection.beginTransaction();

//         const result = await enrollEmployeeInTrainings(
//             connection,
//             {
//                 companyId,
//                 traineeId: trainee_id,
//                 trainingIds: training_ids,
//                 createdBy
//             }
//         );

//         await connection.commit();

//         return res.status(200).json({
//             success: true,
//             message: result.enrolled > 0
//                 ? "Trainee enrollment completed successfully."
//                 : "Trainee is already enrolled in all selected trainings.",
//             data: result
//         });

//     } catch (error) {
//         if (connection) {
//             await connection.rollback();
//         }

//         console.error("Enroll Trainee Error:", error);

//         return res.status(400).json({
//             success: false,
//             message: error.message || "Failed to enroll trainee."
//         });

//     } finally {
//         if (connection) {
//             connection.release();
//         }
//     }
// };


exports.enrollEmployee = async (req, res) => {
    let connection;

    try {
        const companyId = req.user.company_id;
        const createdBy = req.user.user_id;

        const { user_id, training_ids } = req.body;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "No company associated with this account."
            });
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                // message: "Please select an employee."
                message: "Please select an trainee."
            });
        }

        if (
            !Array.isArray(training_ids) ||
            training_ids.length === 0
        ) {
            return res.status(400).json({
                success: false,
                // message: "Please select at least one training."
                message: "Please select at least one course."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        const result = await enrollEmployeeInTrainings(
            connection,
            {
                companyId,
                userId: user_id,
                trainingIds: training_ids,
                createdBy
            }
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: result.enrolled > 0
                // ? "Employee enrolled successfully."
                ? "Trainee enrolled successfully."
                // : "Employee is already enrolled in all selected trainings.",
                : "Trainee is already enrolled in all selected courses.",
            data: result
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        // console.error("Enroll Employee Error:", error);
        console.error("Enroll Trainee Error:", error);

        return res.status(400).json({
            success: false,
            // message: error.message || "Failed to enroll employee."
            message: error.message || "Failed to enroll employee."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

