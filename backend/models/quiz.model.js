const db = require("./db");

exports.checkQuizExistsForLesson = async (connection, lessonId) => {
    const sql = `
        SELECT quiz_id
        FROM tbl_quizzes
        WHERE lesson_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [lessonId]);

    return rows[0] || null;
};

exports.getQuizByLessonId = async (connection, lessonId) => {
    const sql = `
        SELECT *
        FROM tbl_quizzes
        WHERE lesson_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [lessonId]);

    return rows[0] || null;
};

exports.insertQuiz = async (connection, quiz) => {
    const sql = `
        INSERT INTO tbl_quizzes (
            lesson_id,
            quiz_title,
            quiz_instructions,
            total_questions,
            total_marks,
            passing_marks,
            allowed_attempts,
            grading_method,
            quiz_duration_minutes,
            quiz_start_datetime,
            quiz_end_datetime,
            show_result_immediately,
            show_correct_answers,
            is_published,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
        quiz.lesson_id,
        quiz.quiz_title,
        quiz.quiz_instructions || null,
        quiz.passing_marks ?? 0,
        quiz.allowed_attempts ?? 1,
        quiz.grading_method || "latest_attempt",
        quiz.quiz_duration_minutes ?? null,
        quiz.quiz_start_datetime ?? null,
        quiz.quiz_end_datetime ?? null,
        quiz.show_result_immediately ?? true,
        quiz.show_correct_answers ?? true,
        quiz.is_published ?? false,
        quiz.created_by ?? null,
        quiz.updated_by ?? null
    ]);

    return result.insertId;
};

exports.updateQuiz = async (connection, lessonId, quiz) => {
    const sql = `
        UPDATE tbl_quizzes
        SET quiz_title = ?,
            quiz_instructions = ?,
            passing_marks = ?,
            allowed_attempts = ?,
            grading_method = ?,
            quiz_duration_minutes = ?,
            quiz_start_datetime = ?,
            quiz_end_datetime = ?,
            show_result_immediately = ?,
            show_correct_answers = ?,
            is_published = ?,
            updated_by = ?
        WHERE lesson_id = ?
    `;

    await connection.query(sql, [
        quiz.quiz_title,
        quiz.quiz_instructions || null,
        quiz.passing_marks ?? 0,
        quiz.allowed_attempts ?? 1,
        quiz.grading_method || "latest_attempt",
        quiz.quiz_duration_minutes ?? null,
        quiz.quiz_start_datetime ?? null,
        quiz.quiz_end_datetime ?? null,
        quiz.show_result_immediately ?? true,
        quiz.show_correct_answers ?? true,
        quiz.is_published ?? false,
        quiz.updated_by ?? null,
        lessonId
    ]);
};

exports.getQuizQuestionsByQuizId = async (connection, quizId) => {
    const sql = `
        SELECT *
        FROM tbl_quiz_questions
        WHERE quiz_id = ?
        ORDER BY question_order ASC, question_id ASC
    `;

    const [rows] = await connection.query(sql, [quizId]);

    return rows;
};

exports.getQuizQuestionById = async (connection, questionId) => {
    const sql = `
        SELECT *
        FROM tbl_quiz_questions
        WHERE question_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [questionId]);

    return rows[0] || null;
};

exports.insertQuizQuestion = async (connection, quizId, question, userId) => {
    const sql = `
        INSERT INTO tbl_quiz_questions (
            quiz_id,
            question_text,
            question_type,
            question_marks,
            question_order,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
        quizId,
        question.question_text,
        question.question_type,
        question.question_marks,
        question.question_order ?? 1,
        userId ?? null,
        userId ?? null
    ]);

    return result.insertId;
};

exports.updateQuizQuestion = async (connection, questionId, question, userId) => {
    const sql = `
        UPDATE tbl_quiz_questions
        SET question_text = ?,
            question_type = ?,
            question_marks = ?,
            question_order = ?,
            updated_by = ?
        WHERE question_id = ?
    `;

    await connection.query(sql, [
        question.question_text,
        question.question_type,
        question.question_marks,
        question.question_order ?? 1,
        userId ?? null,
        questionId
    ]);
};

exports.deleteQuizQuestion = async (connection, questionId) => {
    const sql = `
        DELETE FROM tbl_quiz_questions
        WHERE question_id = ?
    `;

    await connection.query(sql, [questionId]);
};

exports.getQuestionOptionsByQuestionId = async (connection, questionId) => {
    const sql = `
        SELECT *
        FROM tbl_quiz_options
        WHERE question_id = ?
        ORDER BY option_order ASC, option_id ASC
    `;

    const [rows] = await connection.query(sql, [questionId]);

    return rows;
};

exports.insertQuizOption = async (connection, questionId, option) => {
    const sql = `
        INSERT INTO tbl_quiz_options (
            question_id,
            option_text,
            is_correct,
            option_order
        )
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
        questionId,
        option.option_text,
        option.is_correct ? 1 : 0,
        option.option_order ?? 1
    ]);

    return result.insertId;
};

exports.updateQuizOption = async (connection, optionId, option) => {
    const sql = `
        UPDATE tbl_quiz_options
        SET option_text = ?,
            is_correct = ?,
            option_order = ?
        WHERE option_id = ?
    `;

    await connection.query(sql, [
        option.option_text,
        option.is_correct ? 1 : 0,
        option.option_order ?? 1,
        optionId
    ]);
};

exports.deleteQuizOption = async (connection, optionId) => {
    const sql = `
        DELETE FROM tbl_quiz_options
        WHERE option_id = ?
    `;

    await connection.query(sql, [optionId]);
};

exports.updateQuizTotals = async (connection, quizId) => {
    const sql = `
        UPDATE tbl_quizzes q
        SET
            total_questions = (
                SELECT COUNT(*)
                FROM tbl_quiz_questions qq
                WHERE qq.quiz_id = q.quiz_id
            ),
            total_marks = (
                SELECT COALESCE(SUM(qq.question_marks), 0)
                FROM tbl_quiz_questions qq
                WHERE qq.quiz_id = q.quiz_id
            )
        WHERE q.quiz_id = ?
    `;

    await connection.query(sql, [quizId]);
};

exports.recalculateQuizTotals = async (connection, quizId) => {
    await exports.updateQuizTotals(connection, quizId);
};

// Fetch all attempts by a student for a given quiz
exports.getAttemptsByQuizAndUser = async (connection, quizId, userId) => {
    const sql = `
        SELECT *
        FROM tbl_quiz_attempts
        WHERE quiz_id = ?
          AND user_id = ?
        ORDER BY attempt_number ASC
    `;

    const [rows] = await connection.query(sql, [quizId, userId]);

    return rows;
};

exports.getNextAttemptNumber = async (connection, quizId, userId) => {
    const sql = `
        SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt_number
        FROM tbl_quiz_attempts
        WHERE quiz_id = ?
          AND user_id = ?
    `;

    const [rows] = await connection.query(sql, [quizId, userId]);

    return rows[0].next_attempt_number;
};

exports.createQuizAttempt = async (
    connection,
    quizId,
    userId,
    attemptNumber
) => {
    const sql = `
        INSERT INTO tbl_quiz_attempts (
            quiz_id,
            user_id,
            attempt_number,
            attempt_status,
            started_at
        )
        VALUES (?, ?, ?, 'in_progress', NOW())
    `;

    const [result] = await connection.query(sql, [
        quizId,
        userId,
        attemptNumber
    ]);

    return result.insertId;
};

exports.getQuizById = async (connection, quizId) => {
    const sql = `
        SELECT *
        FROM tbl_quizzes
        WHERE quiz_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.query(sql, [quizId]);

    return rows[0] || null;
};

exports.getAttemptById = async (connection, attemptId) => {
    const [rows] = await connection.query(
        `SELECT * FROM tbl_quiz_attempts WHERE attempt_id = ? LIMIT 1`,
        [attemptId]
    );

    return rows[0] || null;
};

exports.getQuizOptionsByQuestionId = async (connection, questionId) => {
    const [rows] = await connection.query(
        `SELECT option_id, option_text, option_order
         FROM tbl_quiz_options
         WHERE question_id = ?
         ORDER BY option_order`,
        [questionId]
    );

    return rows;
};

exports.getCorrectOptionsByQuestionId = async (connection, questionId) => {
    const sql = `
        SELECT option_id
        FROM tbl_quiz_options
        WHERE question_id = ?
          AND is_correct = TRUE
    `;

    const [rows] = await connection.query(sql, [questionId]);

    return rows;
};

exports.insertQuizAnswer = async (
    connection,
    attemptId,
    questionId,
    optionId,
    marksAwarded,
    isCorrect
) => {

    const sql = `
        INSERT INTO tbl_quiz_answers
        (
            attempt_id,
            question_id,
            option_id,
            marks_awarded,
            is_correct
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    await connection.query(sql, [
        attemptId,
        questionId,
        optionId,
        marksAwarded,
        isCorrect
    ]);
};

exports.submitQuizAttempt = async (
    connection,
    attemptId,
    score,
    percentage,
    passed
) => {

    const sql = `
        UPDATE tbl_quiz_attempts
        SET
            score=?,
            percentage=?,
            passed=?,
            attempt_status='submitted',
            submitted_at=NOW()
        WHERE attempt_id=?
    `;

    await connection.query(sql, [
        score,
        percentage,
        passed,
        attemptId
    ]);
};

exports.getAttemptAnswers = async (connection, attemptId) => {
    const sql = `
        SELECT
            qa.answer_id,
            qa.question_id,
            qq.question_text,
            qa.option_id,
            qo.option_text AS selected_option,
            qa.marks_awarded,
            qa.is_correct
        FROM tbl_quiz_answers qa
        JOIN tbl_quiz_questions qq
            ON qa.question_id = qq.question_id
        LEFT JOIN tbl_quiz_options qo
            ON qa.option_id = qo.option_id
        WHERE qa.attempt_id = ?
        ORDER BY qq.question_order
    `;

    const [rows] = await connection.query(sql, [attemptId]);
    return rows;
};

exports.getAttemptHistory = async (connection, quizId, userId) => {
    const sql = `
        SELECT
            attempt_id,
            attempt_number,
            score,
            percentage,
            passed,
            attempt_status,
            started_at,
            submitted_at,
            time_taken_seconds,
            created_at
        FROM tbl_quiz_attempts
        WHERE quiz_id = ?
          AND user_id = ?
        ORDER BY attempt_number DESC
    `;

    const [rows] = await connection.query(sql, [quizId, userId]);

    return rows;
};

exports.deleteQuiz = async (connection, quizId) => {
    const sql = `
        DELETE FROM tbl_quizzes
        WHERE quiz_id = ?
    `;

    const [result] = await connection.query(sql, [quizId]);

    return result.affectedRows;
};