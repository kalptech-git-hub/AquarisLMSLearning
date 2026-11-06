const cloudinary = require("../utils/cloudinary");
const db = require("../models/db");


const {
    getLessonByIdModel,
    createLessonContentModel,
    getLessonContentsByLessonIdModel,
    deleteLessonContentModel,
    getLessonContentByIdModel,
    getNextContentOrder,
    reorderLessonContentOrder,
    updateLessonContentModel,
    checkDuplicateLessonContent,
    checkDuplicateLessonContentForUpdate
} = require("../models/lesson-content.model");

const uploadFileToCloudinary = require("../utils/uploadFileToCloudinary");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

/* CREATE LESSON CONTENT */
/* ONLY WHEN THE LESSON IS VIDEO, ADDITIONAL FILES/IMAGES CAN BE INSERTED. */
exports.createLessonContent = async (req, res) => {

    let connection;
    let contentCloudFileId = null;
    let transactionCommitted = false;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const { lessonId } = req.params;

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        let {
            content_title,
            content_type,
            content_allow_download,
            // content_order
        } = req.body;

        content_allow_download = content_allow_download === "true";

        content_title = content_title?.trim();

        if (!content_title) {
            throw new Error("Content title is required.");
        }

        if (
            content_title.length < 3 ||
            content_title.length > 255
        ) {
            return res.status(400).json({
                success: false,
                message: "Content title must be between 3 and 255 characters."
            });
        }

        if (!/[a-zA-Z0-9]/.test(content_title)) {
            return res.status(400).json({
                success: false,
                message: "Content title must contain at least one letter or number."
            });
        }

        if (!/[a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF]/.test(content_title)) {
            return res.status(400).json({
                success: false,
                message: "Content title cannot contain only symbols."
            });
        }

        if (!req.file) {
            throw new Error("Content file is required.");
        }



        // const [lessons] = await connection.query(
        //     `
        //     SELECT
        //         lesson_id,
        //         lesson_content_type
        //     FROM tbl_training_lessons
        //     WHERE lesson_id = ?
        //     `,
        //     [lessonId]
        // );

        // if (!lessons.length) {
        //     throw new Error("Lesson not found.");
        // }

        // if (lessons[0].lesson_content_type !== "video") {
        //     throw new Error(
        //         "Additional resources can only be added to video lessons."
        //     );
        // }

        const lesson = await getLessonByIdModel(
            connection,
            lessonId
        );

        if (!lesson) {
            throw new Error("Lesson not found.");
        }

        if (lesson.lesson_content_type !== "video") {
            throw new Error(
                "Additional resources can only be added to video lessons."
            );
        }

        const duplicateContent =
            await checkDuplicateLessonContent(
                connection,
                lessonId,
                content_title
            );

        if (duplicateContent) {

            return res.status(400).json({
                success: false,
                message: "Resource title already exists for this lesson."
            });

        }

        let resourceType = "auto";

        if (content_type === "pdf" || content_type === "document") {
            resourceType = "raw";
            // resourceType = "image";
        }

        if (content_type === "image") {
            resourceType = "image";
        }

        if (content_type === "audio") {
            resourceType = "video";
        }

        const uploadResult = await uploadFileToCloudinary(
            req.file.buffer,
            "lesson_contents",
            resourceType,
            req.file.originalname
        );

        /* Generate download url for all files */
        const downloadUrl = uploadResult.secure_url.replace(
            "/upload/",
            "/upload/fl_attachment/"
        );

        /* To get the size of the file */
        const contentSize = uploadResult.bytes;

        console.log("UPLOAD RESULT:", uploadResult);
        console.log(req.file.originalname);

        contentCloudFileId = uploadResult.public_id;

        // const [result] = await connection.query(
        //     `
        //     INSERT INTO tbl_training_lesson_contents
        //     (
        //         lesson_id,
        //         content_title,
        //         content_type,
        //         content_url,
        //         content_cloud_file_id,
        //         content_order,
        //         created_by
        //     )
        //     VALUES (?, ?, ?, ?, ?, ?, ?)
        //     `,
        //     [
        //         lessonId,
        //         content_title,
        //         content_type,
        //         uploadResult.secure_url,
        //         uploadResult.public_id,
        //         content_order || 1,
        //         req.user.user_id
        //     ]
        // );

        const contentOrder =
            await getNextContentOrder(
                connection,
                lessonId
            );

        const result = await createLessonContentModel(
            connection,
            {
                lesson_id: lessonId,
                content_title,
                content_type,
                content_url: uploadResult.secure_url,
                download_url: downloadUrl,
                content_size: contentSize,
                content_cloud_file_id: uploadResult.public_id,
                content_order: contentOrder,
                content_allow_download,
                created_by: req.user.user_id
            }
        );



        await connection.commit();
        transactionCommitted = true;

        return res.status(201).json({
            success: true,
            message: "Resource added successfully.",
            content_id: result.insertId
        });

    } catch (error) {
        console.error(
            "Create lesson content Error: ", error
        );

        if (connection && !transactionCommitted) {
            await connection.rollback();
        }

        if (contentCloudFileId) {
            await deleteFromCloudinary(contentCloudFileId);
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

};

/* GET CONTENTS FOR LESSON */
exports.getLessonContents = async (
    req,
    res
) => {

    try {

        const { lessonId } = req.params;

        const contents =
            await getLessonContentsByLessonIdModel(
                lessonId
            );

        return res.status(200).json({

            success: true,
            contents

        });

    } catch (error) {

        console.error("Get Lesson Contents Error: ", error);

        return res.status(500).json({
            success: false,
            message: error.message

        });

    }

};

/* PRELOAD DATA OF CONTENT FOR EDIT */
exports.getContentById = async (req, res) => {
    let connection;

    try {

        connection = await db.getConnection();

        const { contentId } = req.params;

        if (
            !contentId ||
            isNaN(contentId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid content ID is required."
            });
        }

        const content =
            await getLessonContentByIdModel(
                connection,
                contentId
            );

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found."
            });
        }

        return res.status(200).json({
            success: true,
            content
        });

    } catch (error) {

        console.error(
            "Get Content By Id Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

};

/* UPDATE LESSON CONTENT BY ID */
exports.updateLessonContent = async (
    req,
    res
) => {

    let connection;
    let newCloudFileId = null;
    let transactionCommitted = false;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const { contentId } = req.params;

        let {
            content_title,
            content_allow_download
        } = req.body;

        content_allow_download = content_allow_download === "true";

        content_title = content_title?.trim();

        if (
            content_title.length < 3 ||
            content_title.length > 255
        ) {
            return res.status(400).json({
                success: false,
                message: "Content title must be between 3 and 255 characters."
            });
        }

        if (!content_title) {

            return res.status(400).json({
                success: false,
                message: "Content title is required."
            });

        }

        if (!/[a-zA-Z0-9]/.test(content_title)) {
            return res.status(400).json({
                success: false,
                message: "Content title must contain at least one letter or number."
            });
        }

        if (!/[a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF]/.test(content_title)) {
            return res.status(400).json({
                success: false,
                message: "Content title cannot contain only symbols."
            });
        }

        const content =
            await getLessonContentByIdModel(
                connection,
                contentId
            );

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found."
            });

        }

        const duplicateContent =
            await checkDuplicateLessonContentForUpdate(
                connection,
                content.lesson_id,
                content_title,
                contentId
            );

        if (duplicateContent) {

            return res.status(400).json({
                success: false,
                message: "Content title already exists for this lesson."
            });

        }

        let contentUrl =
            content.content_url;

        let cloudFileId =
            content.content_cloud_file_id;

        let downloadUrl =
            content.download_url;

        let contentSize =
            content.content_size;

        // =====================================
        // FILE REPLACEMENT
        // =====================================

        if (req.file) {

            let resourceType = "auto";

            if (content.content_type === "pdf" || content.content_type === "document") {
                resourceType = "raw";
                // resourceType = "image";
            }

            if (content.content_type === "image") {
                resourceType = "image";
            }

            if (content.content_type === "audio") {
                resourceType = "video";
            }

            const uploadResult =
                await uploadFileToCloudinary(
                    req.file.buffer,
                    "lesson_contents",
                    resourceType,
                    req.file.originalname
                );

            newCloudFileId =
                uploadResult.public_id;

            contentUrl =
                uploadResult.secure_url;

            cloudFileId =
                uploadResult.public_id;

            /* Generate download url for all files */
            downloadUrl = uploadResult.secure_url.replace(
                "/upload/",
                "/upload/fl_attachment/"
            );
            console.log("Download url", downloadUrl);

            /* To get the size of the file */
            contentSize =  uploadResult.bytes || req.file.size;
            console.log("Content size",contentSize);


            // delete old file
            await deleteFromCloudinary(
                content.content_cloud_file_id,
                resourceType
            );

        }

        await updateLessonContentModel(
            connection,
            contentId,
            {
                content_title,
                content_allow_download,
                content_url: contentUrl,
                download_url: downloadUrl,
                content_size: contentSize,
                content_cloud_file_id: cloudFileId,
                updated_by: req.user.user_id
            }
        );

        await connection.commit();

        transactionCommitted = true;

        return res.status(200).json({
            success: true,
            message: "Content updated successfully."
        });

    } catch (error) {

        console.error(
            "Update lesson content Error:",
            error
        );

        if (
            connection &&
            !transactionCommitted
        ) {
            await connection.rollback();
        }

        // cleanup newly uploaded file if DB failed
        if (newCloudFileId) {

            try {

                await deleteFromCloudinary(
                    newCloudFileId,
                    "auto"
                );

            } catch (cleanupError) {

                console.error(
                    "Cloudinary cleanup error:",
                    cleanupError
                );

            }

        }

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

};

/* DELETE LESSON CONTENT */
exports.deleteLessonContent = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const { contentId } = req.params;

        const content =
            await getLessonContentByIdModel(
                connection,
                contentId
            );

        if (!content) {
            throw new Error(
                "Content not found."
            );
        }

        // let resourceType = "raw";
        let resourceType = "auto";

        if (content.content_type === "pdf" || content.content_type === "document") {
            resourceType = "raw";
            // resourceType = "image";
        }

        if (content.content_type === "image") {
            resourceType = "image";
        }

        if (content.content_type === "audio") {
            resourceType = "video";
        }

        await deleteFromCloudinary(
            content.content_cloud_file_id,
            resourceType
        );

        const lessonId = content.lesson_id;

        console.log("live session deletion")
        await deleteLessonContentModel(
            connection,
            contentId
        );

        await reorderLessonContentOrder(
            connection,
            lessonId
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Content deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete lesson content Error: ", error
        );

        if (connection) {
            await connection.rollback();
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

};

