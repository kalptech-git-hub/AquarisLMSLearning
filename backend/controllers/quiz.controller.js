const db = require("../models/db");

const {
    insertQuiz,
    insertQuizQuestion,
    insertQuizOption,
    updateQuiz,
    getQuizByLessonId,
    getQuizQuestionsByQuizId,
    getQuestionOptionsByQuestionId,
    updateQuizQuestion,
    deleteQuizQuestion,
    updateQuizOption,
    deleteQuizOption,
    updateQuizTotals,
    checkQuizExistsForLesson,
    getQuizQuestionById,
    getQuizById,
    getNextAttemptNumber,
    createQuizAttempt,
    getAttemptsByQuizAndUser,
    getAttemptById,
    getQuizOptionsByQuestionId,
    getCorrectOptionsByQuestionId,
    insertQuizAttemptAnswer,
    insertQuizAnswer,
    submitQuizAttempt,
    getAttemptAnswers,
    getAttemptHistory,
    deleteQuiz
} = require("../models/quiz.model");

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") return ["true", "1", "yes"].includes(value.trim().toLowerCase());
    return false;
};

const normalizeQuestionType = (value) => {
    if (!value) return "single_mcq";
    return String(value).trim().toLowerCase();
};

const parseNumeric = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getQuizPayloadSource = (payload = {}) => {
    if (payload && typeof payload === "object" && payload.quiz && typeof payload.quiz === "object") {
        return payload.quiz;
    }

    return payload;
};

const validateQuestionPayload = (question, index) => {
    const questionText = String(question?.question_text ?? "").trim();
    const questionType = normalizeQuestionType(question?.question_type);
    const questionMarks = parseNumeric(question?.question_marks, 0);

    if (!questionText) {
        const error = new Error(`Question ${index + 1} text is required.`);
        error.statusCode = 400;
        throw error;
    }

    if (!["single_mcq", "multiple_mcq", "true_false"].includes(questionType)) {
        const error = new Error(`Question ${index + 1} has an invalid type.`);
        error.statusCode = 400;
        throw error;
    }

    if (questionMarks <= 0) {
        const error = new Error(`Question ${index + 1} marks must be greater than 0.`);
        error.statusCode = 400;
        throw error;
    }

    const options = Array.isArray(question?.options)
        ? question.options
        : Array.isArray(question?.quiz_options)
            ? question.quiz_options
            : [];

    if (options.length < 2) {
        const error = new Error(`Question ${index + 1} must have at least 2 options.`);
        error.statusCode = 400;
        throw error;
    }

    if (questionType === "true_false" && options.length !== 2) {
        const error = new Error("True/False questions must have exactly 2 options.");
        error.statusCode = 400;
        throw error;
    }

    let correctCount = 0;
    const seenOptionTexts = new Set();

    options.forEach((option, optionIndex) => {
        const optionText = String(option?.option_text ?? "").trim();

        if (!optionText) {
            const error = new Error(`Question ${index + 1} option ${optionIndex + 1} text is required.`);
            error.statusCode = 400;
            throw error;
        }

        const lowerOption = optionText.toLowerCase();
        if (seenOptionTexts.has(lowerOption)) {
            const error = new Error(`Question ${index + 1} has duplicate option: "${optionText}". All options must be unique.`);
            error.statusCode = 400;
            throw error;
        }
        seenOptionTexts.add(lowerOption);

        const isCorrect = normalizeBoolean(option?.is_correct);

        if (isCorrect) {
            correctCount += 1;
        }
    });

    if (questionType === "single_mcq" && correctCount !== 1) {
        const error = new Error(`Single-choice question ${index + 1} must have exactly one correct option.`);
        error.statusCode = 400;
        throw error;
    }

    if (questionType === "multiple_mcq" && correctCount < 1) {
        const error = new Error(`Multiple-choice question ${index + 1} must have at least one correct option.`);
        error.statusCode = 400;
        throw error;
    }

    return {
        question_id: question?.question_id ?? question?.id ?? null,
        question_text: questionText,
        question_type: questionType,
        question_marks: questionMarks,
        question_order: Number(question?.question_order ?? index + 1),
        options
    };
};

const validateQuizPayload = (payload = {}) => {
    const quizSource = getQuizPayloadSource(payload);
    const quizTitle = String(quizSource.quiz_title ?? quizSource.title ?? "").trim();

    if (!quizTitle) {
        const error = new Error("Quiz title is required.");
        error.statusCode = 400;
        throw error;
    }

    if (quizTitle.length < 3 || quizTitle.length > 255) {
        const error = new Error("Quiz title must be between 3 and 255 characters.");
        error.statusCode = 400;
        throw error;
    }

    const rawQuestions = Array.isArray(quizSource.questions)
        ? quizSource.questions
        : Array.isArray(quizSource.quiz_questions)
            ? quizSource.quiz_questions
            : [];

    if (!rawQuestions.length) {
        const error = new Error("At least one question is required.");
        error.statusCode = 400;
        throw error;
    }

    const questions = rawQuestions.map((question, index) => validateQuestionPayload(question, index));

    return {
        lesson_id: Number(quizSource.lesson_id ?? quizSource.lessonId ?? payload.lesson_id ?? payload.lessonId),
        quiz_title: quizTitle,
        quiz_instructions: String(quizSource.quiz_instructions ?? "").trim(),
        allowed_attempts: parseNumeric(quizSource.allowed_attempts, 1),
        grading_method: String(quizSource.grading_method ?? "latest_attempt").trim().toLowerCase(),
        passing_marks: parseNumeric(quizSource.passing_marks, 0),
        quiz_duration_minutes: quizSource.quiz_duration_minutes === undefined || quizSource.quiz_duration_minutes === null || quizSource.quiz_duration_minutes === ""
            ? null
            : parseNumeric(quizSource.quiz_duration_minutes, 0),
        quiz_start_datetime: quizSource.quiz_start_datetime || null,
        quiz_end_datetime: quizSource.quiz_end_datetime || null,
        show_result_immediately: normalizeBoolean(quizSource.show_result_immediately ?? true),
        show_correct_answers: normalizeBoolean(quizSource.show_correct_answers ?? true),
        is_published: normalizeBoolean(quizSource.is_published ?? false),
        created_by: quizSource.created_by ?? quizSource.user_id ?? payload.created_by ?? payload.user_id ?? null,
        updated_by: quizSource.updated_by ?? quizSource.user_id ?? payload.updated_by ?? payload.user_id ?? null,
        questions
    };
};

const createQuizInternal = async (connection, payload, currentUserId = null) => {
    if (!connection) {
        throw Object.assign(new Error("Database connection is required."), { statusCode: 500 });
    }

    const normalizedPayload = validateQuizPayload({
        ...payload,
        created_by: payload?.created_by ?? currentUserId,
        updated_by: payload?.updated_by ?? currentUserId
    });

    if (!normalizedPayload.lesson_id || Number.isNaN(normalizedPayload.lesson_id)) {
        const error = new Error("Valid lesson ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const existingQuiz = await checkQuizExistsForLesson(connection, normalizedPayload.lesson_id);

    if (existingQuiz) {
        const error = new Error("A quiz already exists for this lesson.");
        error.statusCode = 400;
        throw error;
    }

    const quizId = await insertQuiz(connection, normalizedPayload);

    for (let index = 0; index < normalizedPayload.questions.length; index += 1) {
        const question = normalizedPayload.questions[index];
        const questionOrder = Number(question.question_order ?? index + 1);

        const questionId = await insertQuizQuestion(
            connection,
            quizId,
            {
                question_text: question.question_text,
                question_type: question.question_type,
                question_marks: question.question_marks,
                question_order: questionOrder
            },
            normalizedPayload.created_by ?? currentUserId
        );

        const orderedOptions = [...question.options].map((option, optionIndex) => ({
            option_text: String(option.option_text ?? "").trim(),
            is_correct: normalizeBoolean(option.is_correct),
            option_order: Number(option.option_order ?? optionIndex + 1)
        }));

        for (let optionIndex = 0; optionIndex < orderedOptions.length; optionIndex += 1) {
            const option = orderedOptions[optionIndex];
            await insertQuizOption(connection, questionId, {
                option_text: option.option_text,
                is_correct: option.is_correct,
                option_order: option.option_order ?? optionIndex + 1
            });
        }
    }

    await updateQuizTotals(connection, quizId);

    return {
        success: true,
        message: "Quiz created successfully.",
        quizId
    };
};

 // Upsert quiz for a lesson, creating or updating as necessary
exports.upsertQuizForLesson = async (connection, lessonId, payload, currentUserId = null) => {
    const quizSource = getQuizPayloadSource(payload || {});

    if (!quizSource || !Object.keys(quizSource).length) {
        return null;
    }

    const quizPayload = {
        ...quizSource,
        lesson_id: lessonId,
        created_by: quizSource.created_by ?? currentUserId,
        updated_by: quizSource.updated_by ?? currentUserId
    };

    const existingQuiz = await getQuizByLessonId(connection, lessonId);

    if (!existingQuiz) {
        const result = await createQuizInternal(connection, quizPayload, currentUserId);
        return result;
    }

    const normalizedPayload = validateQuizPayload(quizPayload);

    await updateQuiz(connection, lessonId, normalizedPayload);

    const incomingQuestionIds = new Set(
        normalizedPayload.questions
            .filter((question) => question.question_id)
            .map((question) => Number(question.question_id))
            .filter((id) => !Number.isNaN(id))
    );

    const existingQuestions = await getQuizQuestionsByQuizId(connection, existingQuiz.quiz_id);

    for (const existingQuestion of existingQuestions) {
        const shouldDelete = !incomingQuestionIds.has(Number(existingQuestion.question_id));

        if (shouldDelete) {
            await deleteQuizQuestion(connection, existingQuestion.question_id);
        }
    }

    for (let index = 0; index < normalizedPayload.questions.length; index += 1) {
        const question = normalizedPayload.questions[index];
        const questionId = question.question_id ? Number(question.question_id) : null;
        const existingQuestion = questionId ? await getQuizQuestionById(connection, questionId) : null;

        if (existingQuestion) {
            await updateQuizQuestion(
                connection,
                questionId,
                {
                    question_text: question.question_text,
                    question_type: question.question_type,
                    question_marks: question.question_marks,
                    question_order: Number(question.question_order ?? index + 1)
                },
                normalizedPayload.updated_by ?? currentUserId
            );

            const incomingOptionIds = new Set(
                (Array.isArray(question.options) ? question.options : [])
                    .filter((option) => option.option_id)
                    .map((option) => Number(option.option_id))
                    .filter((id) => !Number.isNaN(id))
            );

            const existingOptions = await getQuestionOptionsByQuestionId(connection, questionId);

            for (const existingOption of existingOptions) {
                if (!incomingOptionIds.has(Number(existingOption.option_id))) {
                    await deleteQuizOption(connection, existingOption.option_id);
                }
            }

            const orderedOptions = [...(Array.isArray(question.options) ? question.options : [])].map((option, optionIndex) => ({
                option_id: option.option_id ?? null,
                option_text: String(option.option_text ?? "").trim(),
                is_correct: normalizeBoolean(option.is_correct),
                option_order: Number(option.option_order ?? optionIndex + 1)
            }));

            for (let optionIndex = 0; optionIndex < orderedOptions.length; optionIndex += 1) {
                const option = orderedOptions[optionIndex];
                if (option.option_id) {
                    await updateQuizOption(connection, option.option_id, {
                        option_text: option.option_text,
                        is_correct: option.is_correct,
                        option_order: option.option_order ?? optionIndex + 1
                    });
                } else {
                    await insertQuizOption(connection, questionId, {
                        option_text: option.option_text,
                        is_correct: option.is_correct,
                        option_order: option.option_order ?? optionIndex + 1
                    });
                }
            }

            continue;
        }

        const newQuestionId = await insertQuizQuestion(
            connection,
            existingQuiz.quiz_id,
            {
                question_text: question.question_text,
                question_type: question.question_type,
                question_marks: question.question_marks,
                question_order: Number(question.question_order ?? index + 1)
            },
            normalizedPayload.updated_by ?? currentUserId
        );

        for (let optionIndex = 0; optionIndex < (Array.isArray(question.options) ? question.options : []).length; optionIndex += 1) {
            const option = question.options[optionIndex];
            await insertQuizOption(connection, newQuestionId, {
                option_text: String(option.option_text ?? "").trim(),
                is_correct: normalizeBoolean(option.is_correct),
                option_order: Number(option.option_order ?? optionIndex + 1)
            });
        }
    }

    await updateQuizTotals(connection, existingQuiz.quiz_id);

    return {
        success: true,
        message: "Quiz updated successfully.",
        quizId: existingQuiz.quiz_id
    };
};

exports.createQuiz = async (...args) => {
    if (args.length >= 2 && args[0] && typeof args[0] === "object" && args[0].body && args[0].query) {
        const [req, res] = args;
        let connection;

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const result = await createQuizInternal(connection, req.body, req.user?.user_id);

            await connection.commit();

            return res.status(201).json(result);
        } catch (error) {
            if (connection) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.log("Quiz rollback error:", rollbackError.message);
                }
            }

            const statusCode = error.statusCode || 500;
            const message = error.message || "Server Error";

            return res.status(statusCode).json({
                success: false,
                message
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    const [connection, payload, currentUserId] = args;

    return createQuizInternal(connection, payload || {}, currentUserId || null);
};

exports.startQuizAttempt = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const quizId = Number(req.params.quizId);
        const userId = req.user.user_id;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Valid quiz ID is required."
            });
        }

        const quiz = await getQuizById(connection, quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });
        }

        const now = new Date();
        if (quiz.quiz_start_datetime && new Date(quiz.quiz_start_datetime) > now) {
            return res.status(403).json({
                success: false,
                message: `This quiz is scheduled to open on ${new Date(quiz.quiz_start_datetime).toLocaleString()}. It is not accessible yet.`
            });
        }

        if (quiz.quiz_end_datetime && new Date(quiz.quiz_end_datetime) < now) {
            return res.status(403).json({
                success: false,
                message: `This quiz closed on ${new Date(quiz.quiz_end_datetime).toLocaleString()}. It is no longer accessible.`
            });
        }

        const nextAttemptNumber = await getNextAttemptNumber(
            connection,
            quizId,
            userId
        );

        if (nextAttemptNumber > quiz.allowed_attempts) {
            return res.status(400).json({
                success: false,
                message: "Maximum quiz attempts reached."
            });
        }

        const attemptId = await createQuizAttempt(
            connection,
            quizId,
            userId,
            nextAttemptNumber
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Quiz attempt started successfully.",
            attemptId,
            attemptNumber: nextAttemptNumber
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Start Quiz Attempt Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};

exports.getQuizForAttempt = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const attemptId = Number(req.params.attemptId);
        const userId = req.user.user_id;

        const attempt = await getAttemptById(connection, attemptId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found."
            });
        }

        if (attempt.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (attempt.attempt_status !== "in_progress") {
            return res.status(400).json({
                success: false,
                message: "Attempt is already submitted."
            });
        }

        const quiz = await getQuizById(connection, attempt.quiz_id);

        const questions = await getQuizQuestionsByQuizId(
            connection,
            quiz.quiz_id
        );

        for (const question of questions) {
            question.options = await getQuestionOptionsByQuestionId(
                connection,
                question.question_id
            );

            // Don't expose answers before submission
            question.options = question.options.map(option => ({
                option_id: option.option_id,
                option_text: option.option_text,
                option_order: option.option_order
            }));
        }

        return res.json({
            success: true,
            attempt_id: attempt.attempt_id,
            quiz,
            questions
        });

    } catch (error) {

        console.error("Get Quiz For Attempt Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {
        if (connection) connection.release();
    }
};

exports.submitQuizAttempt = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();
        await connection.beginTransaction();

        const attemptId = Number(req.params.attemptId);

        const attempt = await getAttemptById(connection, attemptId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found."
            });
        }

        if (attempt.user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (attempt.attempt_status !== "in_progress") {
            return res.status(400).json({
                success: false,
                message: "Quiz already submitted."
            });
        }

        const quiz = await getQuizById(connection, attempt.quiz_id);

        const questions = await getQuizQuestionsByQuizId(
            connection,
            quiz.quiz_id
        );

        let score = 0;

        const submittedAnswers = req.body.answers || [];

        for (const question of questions) {

            const answer = submittedAnswers.find(
                a => Number(a.question_id) === Number(question.question_id)
            );

            if (!answer) continue;

            const correctOptions =
                await getCorrectOptionsByQuestionId(
                    connection,
                    question.question_id
                );

            const correctIds = correctOptions.map(o => Number(o.option_id));

            const selectedIds =
                (answer.selected_option_ids || []).map(Number);

            const isCorrect =
                JSON.stringify(correctIds.sort()) ===
                JSON.stringify(selectedIds.sort());

            const marks = isCorrect
                ? Number(question.question_marks)
                : 0;

            score += marks;

            for (const optionId of selectedIds) {

                await insertQuizAnswer(
                    connection,
                    attemptId,
                    question.question_id,
                    optionId,
                    marks,
                    isCorrect
                );
            }

        }

        const percentage =
            quiz.total_marks > 0
                ? (score / quiz.total_marks) * 100
                : 0;

        const passingPercentage = Number(quiz.passing_marks || 0);
        const passed = percentage >= passingPercentage;

        await submitQuizAttempt(
            connection,
            attemptId,
            score,
            percentage,
            passed
        );

        await connection.commit();

        return res.json({
            success: true,
            score,
            total_marks: Number(quiz.total_marks),
            percentage,
            passed
        });

    } catch (err) {

        if (connection)
            await connection.rollback();

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        if (connection)
            connection.release();
    }

};

exports.getAttemptResult = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const attemptId = Number(req.params.attemptId);
        const userId = req.user.user_id;

        const attempt = await getAttemptById(connection, attemptId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found."
            });
        }

        if (attempt.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const answers = await getAttemptAnswers(connection, attemptId);

        return res.json({
            success: true,
            attempt: {
                attempt_id: attempt.attempt_id,
                score: attempt.score,
                percentage: attempt.percentage,
                passed: Boolean(attempt.passed),
                status: attempt.attempt_status
            },
            answers
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {
        if (connection) connection.release();
    }
};

exports.getQuizAttemptHistory = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const quizId = Number(req.params.quizId);
        const userId = req.user.user_id;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Valid quiz ID is required."
            });
        }

        const quiz = await getQuizById(connection, quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });
        }

        const attempts = await getAttemptHistory(
            connection,
            quizId,
            userId
        );

        return res.status(200).json({
            success: true,
            total_attempts: attempts.length,
            attempts
        });

    } catch (error) {

        console.error("Get Attempt History Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};

exports.deleteQuiz = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const quizId = Number(req.params.quizId);

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Valid quiz ID is required."
            });
        }

        const quiz = await getQuizById(connection, quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });
        }

        await deleteQuiz(connection, quizId);

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully."
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Delete Quiz Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};

exports.getQuizByLesson = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        const lessonId = Number(req.params.lessonId);

        if (!lessonId || isNaN(lessonId)) {
            return res.status(400).json({
                success: false,
                message: "Valid lesson ID is required."
            });
        }

        const quiz = await getQuizByLessonId(connection, lessonId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found for this lesson."
            });
        }

        return res.status(200).json({
            success: true,
            quiz
        });

    } catch (error) {
        console.error("Get Quiz By Lesson Error:", error);

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