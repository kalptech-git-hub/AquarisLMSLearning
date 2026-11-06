//topic.controller.js
const db = require("../models/db");

const {
    insertTopic,
    getNextTopicDisplayOrder,
    checkTrainingExists,
    checkDuplicateTopic,
    getTopicByIdModel,
    checkTopicExists,
    checkDuplicateTopicForUpdate,
    updateTopicModel,
    checkTopicHasLessons,
    deleteTopicModel,
    getTopicsByTrainingIDModel,
    reorderTopicDisplayOrder,
    checkTrainingHasEnrollments
} = require("../models/topic.model");

exports.createTopic = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        let {
            training_id,
            topic_title,
            topic_description
        } = req.body;

        // Trim input
        topic_title = topic_title?.trim();
        topic_description = topic_description?.trim();

        // Convert training_id to number
        const trainingId = Number(training_id);

        // ==========================
        // Validation
        // ==========================

        if (!trainingId || isNaN(trainingId)) {
            return res.status(400).json({
                success: false,
                // message: "Valid training ID is required."
                message: "Valid course ID is required."
            });
        }

        if (!topic_title) {
            return res.status(400).json({
                success: false,
                message: "Module title is required."
            });
        }

        if (topic_title.length < 3 || topic_title.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Module title must be between 3 and 100 characters."
            });
        }

        if (
            topic_description &&
            topic_description.length > 700
        ) {
            return res.status(400).json({
                success: false,
                message: "Module description must not exceed 700 characters."
            });
        }

        // ==========================
        // Check Training Exists
        // ==========================

        const training = await checkTrainingExists(
            connection,
            trainingId
        );

        if (!training) {
            return res.status(404).json({
                success: false,
                // message: "Training not found."
                message: "Course not found."
            });
        }

        // ==========================
        // Check Duplicate Topic
        // ==========================

        const duplicateTopic = await checkDuplicateTopic(
            connection,
            trainingId,
            topic_title
        );

        if (duplicateTopic) {
            return res.status(400).json({
                success: false,
                // message: "Module already exists for this training."
                message: "Module already exists for this course."
            });
        }

        // ==========================
        // Get Next Display Order
        // ==========================

        const topicDisplayOrder =
            await getNextTopicDisplayOrder(
                connection,
                trainingId
            );

        // ==========================
        // Insert Topic
        // ==========================

        const topicId =
            await insertTopic(
                connection,
                {
                    training_id: trainingId,
                    topic_title,
                    topic_description,
                    topic_display_order: topicDisplayOrder,
                    created_by: req.user.user_id,
                    updated_by: req.user.user_id
                }
            );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Module created successfully.",
            topicId
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Create Topic Error:", error);

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

exports.getTopicById = async (req, res) => {

    try {

        const { topicId } = req.params;

        if (!topicId || isNaN(topicId)) {

            return res.status(400).json({
                success: false,
                message: "Valid Module ID is required."
            });

        }

        const topic = await getTopicByIdModel(topicId);

        if (!topic) {

            return res.status(404).json({
                success: false,
                message: "Module not found."
            });

        }

        return res.status(200).json({
            success: true,
            topic
        });

    }
    catch (error) {

        console.log("Get Topic Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ==========================
// Update Topic
// ==========================
exports.updateTopic = async (req, res) => {

    let connection;

    try {
      connection = await db.getConnection();

      await connection.beginTransaction();

      const { topicId } = req.params;

      let { training_id, topic_title, topic_description } = req.body;

      // Trim input
      topic_title = topic_title?.trim();
      topic_description = topic_description?.trim();

      // Convert ids to number
      const trainingId = Number(training_id);

      // ==========================
      // Validation
      // ==========================

      if (!topicId || isNaN(topicId)) {
        return res.status(400).json({
          success: false,
          message: "Valid Module ID is required.",
        });
      }

      if (!trainingId || isNaN(trainingId)) {
        return res.status(400).json({
          success: false,
          // message: "Valid training ID is required."
          message: "Valid course ID is required.",
        });
      }

      if (!topic_title) {
        return res.status(400).json({
          success: false,
          message: "Module title is required.",
        });
      }

      if (topic_title.length < 3 || topic_title.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Module title must be between 3 and 100 characters.",
        });
      }

      if (topic_description && topic_description.length > 700) {
        return res.status(400).json({
          success: false,
          message: "Module description must not exceed 700 characters.",
        });
      }

      // ==========================
      // Check Topic Exists
      // ==========================

      const existingTopic = await checkTopicExists(connection, topicId);

      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          message: "Module not found.",
        });
      }

      // ==========================
      // Check if Module Title Changed
      // ==========================

      const titleChanged =
        existingTopic.topic_title.trim().toLowerCase() !==
        topic_title.trim().toLowerCase();

      // ==========================
      // Check Training Exists
      // ==========================

      const training = await checkTrainingExists(connection, trainingId);

      if (!training) {
        return res.status(404).json({
          success: false,
          // message: "Training not found."
          message: "Course not found.",
        });
      }

      // ==========================
      // Check Module Title Edit Restriction
      // ==========================

      if (titleChanged) {
        const topicHasLessons = await checkTopicHasLessons(connection, topicId);

        const trainingHasEnrollments = await checkTrainingHasEnrollments(
          connection,
          existingTopic.training_id,
        );

        if (topicHasLessons || trainingHasEnrollments) {
          return res.status(400).json({
            success: false,
            message:
              "Module title cannot be edited once lessons are added or students are enrolled in the course.",
          });
        }
      }

      // ==========================
      // Check Duplicate Topic
      // ==========================

      const duplicateTopic = await checkDuplicateTopicForUpdate(
        connection,
        trainingId,
        topic_title,
        topicId,
      );

      if (duplicateTopic) {
        return res.status(400).json({
          success: false,
          // message: "Module already exists for this training."
          message: "Module already exists for this course.",
        });
      }

      // ==========================
      // Update Topic
      // ==========================

      await updateTopicModel(connection, {
        topic_id: topicId,
        topic_title,
        topic_description,
        updated_by: req.user.user_id,
      });

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Module updated successfully.",
      });
    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Update Topic Error:", error);

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

// ==========================
// Delete Topic
// ==========================
exports.deleteTopic = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const { topicId } = req.params;

        // ==========================
        // Validation
        // ==========================

        if (!topicId || isNaN(topicId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Module ID is required."
            });
        }

        // ==========================
        // Check Topic Exists
        // ==========================

        const existingTopic = await checkTopicExists(
            connection,
            topicId
        );

        if (!existingTopic) {
            return res.status(404).json({
                success: false,
                message: "Module not found."
            });
        }

        // ==========================
        // Guard: Topic Has Lessons
        // ==========================

        const hasLessons = await checkTopicHasLessons(
            connection,
            topicId
        );

        if (hasLessons) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a module that still has lessons. Remove its lessons first."
            });
        }

        /* Get the training_id before deletion */
        const trainingId = existingTopic.training_id;

        // ==========================
        // Delete Topic
        // ==========================

        await deleteTopicModel(
            connection,
            topicId
        );

        await reorderTopicDisplayOrder(
            connection,
            trainingId
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Module deleted successfully."
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Delete Topic Error:", error);

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

// ==========================
// List Topics By Training
// ==========================
exports.listTopicsByTraining = async (req, res) => {

    try {

        const { trainingId } = req.params;

        if (!trainingId || isNaN(trainingId)) {

            return res.status(400).json({
                success: false,
                // message: "Valid training ID is required."
                message: "Valid course ID is required."
            });

        }

        const topics = await getTopicsByTrainingIDModel(trainingId);

        return res.status(200).json({
            success: true,
            topics
        });

    }
    catch (error) {

        console.log("List Topics Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};