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

