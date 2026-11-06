const db = require("../models/db");
const { getKuroshiro } = require("../utils/kuroshiroInstance");
const { getSpeakingExerciseById } = require("../models/speaking.model");
const { checkCourseExists } = require("../models/training.model");

const {
    getSpeakingExercisesByCourseIdAdmin,
    getSpeakingExercisesByCourseId,
    insertSpeakingExercises,
    deleteSpeakingExercises,
    deleteSingleSpeakingExercise
} = require("../models/speaking.model");

/* GET SPEAKING EXERCISES BY COURSE (ADMIN/INSTRUCTOR - FOR MANAGE VIEW) */
exports.getSpeakingExercisesByCourse = async (req, res) => {

    try {

        const { courseId } = req.params;

        const exercises = await getSpeakingExercisesByCourseIdAdmin(courseId);

        return res.status(200).json({
            success: true,
            exercises
        });

    } catch (error) {

        console.log("Get Speaking Exercises Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* ADD / REPLACE SPEAKING EXERCISES FOR A COURSE (ADMIN) */
exports.addSpeakingExercises = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();
        await connection.beginTransaction();

        const { courseId } = req.params;

        let { exercises } = req.body;

        exercises =
            typeof exercises === "string"
                ? JSON.parse(exercises)
                : exercises;

        //---------------- Validation ----------------//

        const course = await checkCourseExists(
            connection,
            courseId
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                // message: "Course not found."
                message: "Course category not found."
            });
        }

        if (!Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one phrase is required."
            });
        }

        for (const exercise of exercises) {

            if (!exercise.japanese || !exercise.japanese.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Japanese phrase text is required for all entries."
                });
            }

            if (
                exercise.phraseType &&
                !["WORD", "PHRASE"].includes(exercise.phraseType)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phrase type."
                });
            }

            if (
                exercise.difficulty &&
                !["EASY", "MEDIUM", "HARD"].includes(exercise.difficulty)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid difficulty level."
                });
            }

        }

        //---------------- Delete then Re-insert (same pattern as Books) ----------------//

        await deleteSpeakingExercises(connection, courseId);

        await insertSpeakingExercises(
            connection,
            courseId,
            exercises
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Speaking exercises saved successfully."
        });

    } catch (error) {

        if (connection) await connection.rollback();

        console.log("Add Speaking Exercises Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        if (connection) connection.release();

    }

};

/* DELETE A SINGLE SPEAKING EXERCISE (ADMIN) */
exports.deleteSpeakingExercise = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        const { speakingExerciseId } = req.params;

        const result = await deleteSingleSpeakingExercise(
            connection,
            speakingExerciseId
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Speaking exercise not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Speaking exercise deleted successfully."
        });

    } catch (error) {

        console.log("Delete Speaking Exercise Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        if (connection) connection.release();

    }

};

/* COMPARE STUDENT TRANSCRIPT AGAINST EXPECTED PHRASE */
exports.compareSpeakingAttempt = async (req, res) => {

    try {

        const { speaking_exercise_id, transcript } = req.body;

        if (!speaking_exercise_id || !transcript || !transcript.trim()) {
            return res.status(400).json({
                success: false,
                message: "Exercise ID and transcript are required."
            });
        }

        const exercise = await getSpeakingExerciseById(speaking_exercise_id);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: "Speaking exercise not found."
            });
        }

        const kuroshiro = await getKuroshiro();

        const cleanText = (text) => {
            return text
                .replace(/[。、！？\s.,!?]/g, "")
                .trim();
        };

        const normalizedExpected = await kuroshiro.convert(
            cleanText(exercise.speaking_phrase_japanese),
            { to: "hiragana" }
        );

        const normalizedTranscript = await kuroshiro.convert(
            cleanText(transcript),
            { to: "hiragana" }
        );

        console.log("Expected (normalized):", normalizedExpected);
        console.log("Recognized (normalized):", normalizedTranscript);

        const isCorrect =
            normalizedExpected.trim() === normalizedTranscript.trim();

        return res.status(200).json({
            success: true,
            isCorrect,
            expected: exercise.speaking_phrase_japanese,
            recognized: transcript.trim()
        });

    } catch (error) {

        console.log("Compare Speaking Attempt Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* GET SPEAKING EXERCISES FOR A COURSE (STUDENT - PRACTICE SESSION) */
exports.getSpeakingExercisesForStudent = async (req, res) => {

    try {

        const { courseId } = req.params;

        const exercises = await getSpeakingExercisesByCourseId(courseId);

        return res.status(200).json({
            success: true,
            exercises
        });

    } catch (error) {

        console.log("Get Speaking Exercises For Student Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};
const {
    getSpeakingProgress,
    upsertSpeakingProgress,
    deleteSpeakingProgress
} = require("../models/speaking.model");

/* GET SAVED PROGRESS (STUDENT - ON TAB OPEN) */
exports.getStudentSpeakingProgress = async (req, res) => {

    try {

        const { courseId } = req.params;
        const userId = req.user.user_id;

        const progress = await getSpeakingProgress(userId, courseId);

        return res.status(200).json({
            success: true,
            progress // null if nothing saved yet
        });

    } catch (error) {

        console.log("Get Speaking Progress Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* SAVE PROGRESS (STUDENT - ON LEVEL PICK / PHRASE CHANGE / CORRECT ANSWER) */
exports.saveStudentSpeakingProgress = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const { courseId, difficulty, phraseIndex, correctCount } = req.body;

        if (!courseId || !difficulty) {
            return res.status(400).json({
                success: false,
                message: "courseId and difficulty are required."
            });
        }

        if (!["EASY", "MEDIUM", "HARD", "ALL"].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: "Invalid difficulty level."
            });
        }

        await upsertSpeakingProgress(
            userId,
            courseId,
            difficulty,
            phraseIndex || 0,
            correctCount || 0
        );

        return res.status(200).json({
            success: true,
            message: "Progress saved."
        });

    } catch (error) {

        console.log("Save Speaking Progress Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

/* CLEAR PROGRESS (STUDENT - BACK TO PICKER) */
exports.resetStudentSpeakingProgress = async (req, res) => {

    try {

        const { courseId } = req.params;
        const userId = req.user.user_id;

        await deleteSpeakingProgress(userId, courseId);

        return res.status(200).json({
            success: true,
            message: "Progress reset."
        });

    } catch (error) {

        console.log("Reset Speaking Progress Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};