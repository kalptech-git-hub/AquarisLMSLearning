const db = require("../models/db");

const restrictCompletedTraining = async (req, res, next) => {
    try {
      let trainingId = null;

      // For topic update/delete routes: /api/topics/:topicId
      if (req.params.topicId) {
        const [rows] = await db.query(
          `
    SELECT
        t.training_id,
        t.training_status
    FROM tbl_training_topics tp
    INNER JOIN tbl_trainings t
        ON t.training_id = tp.training_id
    WHERE tp.topic_id = ?
    LIMIT 1
    `,
          [req.params.topicId],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Topic or training not found.",
            message: "Topic or course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      // For topic routes: training_id comes from request body
      if (
        req.body?.training_id &&
        !req.params.lessonId &&
        !req.params.contentId &&
        !req.params.quizId
      ) {
        const [rows] = await db.query(
          `
        SELECT
            training_id,
            training_status
        FROM tbl_trainings
        WHERE training_id = ?
        LIMIT 1
        `,
          [req.body.training_id],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Training not found.",
            message: "Course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      // For lesson creation: topic_id comes from request body
      if (req.body?.topic_id && !req.params.lessonId && !req.params.contentId) {
        const [rows] = await db.query(
          `
        SELECT
            t.training_id,
            t.training_status
        FROM tbl_training_topics tp
        INNER JOIN tbl_trainings t
            ON t.training_id = tp.training_id
        WHERE tp.topic_id = ?
        LIMIT 1
        `,
          [req.body.topic_id],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Topic or training not found.",
            message: "Topic or course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      // For quiz creation: lesson_id comes from request body
      if (req.body?.lesson_id && !req.params.lessonId && !req.params.quizId) {
        const [rows] = await db.query(
          `
        SELECT
            t.training_id,
            t.training_status
        FROM tbl_training_lessons l

        INNER JOIN tbl_training_topics tp
            ON tp.topic_id = l.topic_id

        INNER JOIN tbl_trainings t
            ON t.training_id = tp.training_id

        WHERE l.lesson_id = ?
        LIMIT 1
        `,
          [req.body.lesson_id],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Lesson or training not found.",
            message: "Lesson or course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      // For lesson routes: /api/lessons/:lessonId
      // For lesson-content routes: /api/lesson-content/:lessonId/contents
      if (req.params.lessonId) {
        const [rows] = await db.query(
          `
                SELECT t.training_id, t.training_status
                FROM tbl_training_lessons l
                INNER JOIN tbl_training_topics tp
                    ON tp.topic_id = l.topic_id
                INNER JOIN tbl_trainings t
                    ON t.training_id = tp.training_id
                WHERE l.lesson_id = ?
                LIMIT 1
                `,
          [req.params.lessonId],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Lesson or training not found.",
            message: "Lesson or course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      // For lesson-content edit/delete:
      // /api/lesson-content/contents/:contentId
      if (req.params.contentId) {
        const [rows] = await db.query(
          `
                SELECT
                    t.training_id,
                    t.training_status
                FROM tbl_training_lesson_contents lc

                INNER JOIN tbl_training_lessons l
                    ON l.lesson_id = lc.lesson_id

                INNER JOIN tbl_training_topics tp
                    ON tp.topic_id = l.topic_id

                INNER JOIN tbl_trainings t
                    ON t.training_id = tp.training_id

                WHERE lc.content_id = ?
                LIMIT 1
                `,
          [req.params.contentId],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Content or training not found.",
            message: "Content or course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      // For quiz routes: /api/quizzes/:quizId
      if (req.params.quizId) {
        const [rows] = await db.query(
          `
        SELECT
            t.training_id,
            t.training_status
        FROM tbl_quizzes q

        INNER JOIN tbl_training_lessons l
            ON l.lesson_id = q.lesson_id

        INNER JOIN tbl_training_topics tp
            ON tp.topic_id = l.topic_id

        INNER JOIN tbl_trainings t
            ON t.training_id = tp.training_id

        WHERE q.quiz_id = ?
        LIMIT 1
        `,
          [req.params.quizId],
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            // message: "Quiz or training not found.",
            message: "Quiz or course not found.",
          });
        }

        trainingId = rows[0].training_id;

        if (
          rows[0].training_status === "COMPLETED" &&
          req.user?.role_code !== "ADMIN"
        ) {
          return res.status(403).json({
            success: false,
            // message: "You cannot modify content of a completed training.",
            message: "You cannot modify content of a completed course.",
          });
        }
      }

      next();
    } catch (error) {
        console.error("Completed training restriction error:", error);

        return res.status(500).json({
            success: false,
            // message: "Failed to verify training status."
            message: "Failed to verify course status."
        });
    }
};

module.exports = restrictCompletedTraining;