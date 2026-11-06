const db = require("./db");

/* GET ALL SPEAKING EXERCISES FOR A COURSE (ADMIN VIEW) */
exports.getSpeakingExercisesByCourseIdAdmin = async (course_id) => {

    const sql = `
        SELECT
            speaking_exercise_id,
            course_id,
            speaking_phrase_japanese,
            speaking_phrase_pronunciation,
            speaking_phrase_translation,
            phrase_type,
            speaking_difficulty,
            CAST(is_active AS UNSIGNED) AS is_active
        FROM tbl_training_speaking_exercises
        WHERE course_id = ?
        ORDER BY
            FIELD(phrase_type, 'WORD', 'PHRASE'),
            speaking_exercise_id ASC
    `;

    const [rows] = await db.query(sql, [course_id]);

    return rows;
};

/* INSERT SPEAKING EXERCISES (BULK) */
exports.insertSpeakingExercises = async (
    connection,
    courseId,
    exercises
) => {

    const sql = `
        INSERT INTO tbl_training_speaking_exercises
        (
            course_id,
            speaking_phrase_japanese,
            speaking_phrase_pronunciation,
            speaking_phrase_translation,
            phrase_type,
            speaking_difficulty
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const exercise of exercises) {

        await connection.query(sql, [
            courseId,
            exercise.japanese,
            exercise.pronunciation || null,
            exercise.translation || null,
            exercise.phraseType || "WORD",
            exercise.difficulty || "EASY"
        ]);

    }

};

/* DELETE ALL SPEAKING EXERCISES FOR A COURSE (USED ON RE-SAVE) */
exports.deleteSpeakingExercises = async (
    connection,
    courseId
) => {

    const sql = `
        DELETE FROM tbl_training_speaking_exercises
        WHERE course_id = ?
    `;

    await connection.query(sql, [courseId]);
};

/* DELETE A SINGLE SPEAKING EXERCISE */
exports.deleteSingleSpeakingExercise = async (
    connection,
    speakingExerciseId
) => {

    const sql = `
        DELETE FROM tbl_training_speaking_exercises
        WHERE speaking_exercise_id = ?
    `;

    const [result] = await connection.query(sql, [speakingExerciseId]);

    return result;
};

/* GET ACTIVE SPEAKING EXERCISES FOR A COURSE (STUDENT PRACTICE) */
exports.getSpeakingExercisesByCourseId = async (course_id) => {

    const sql = `
        SELECT
            speaking_exercise_id,
            course_id,
            speaking_phrase_japanese,
            speaking_phrase_pronunciation,
            speaking_phrase_translation,
            phrase_type,
            speaking_difficulty
        FROM tbl_training_speaking_exercises
        WHERE course_id = ?
        AND is_active = b'1'
        ORDER BY
            FIELD(phrase_type, 'WORD', 'PHRASE'),
            speaking_exercise_id ASC
    `;

    const [rows] = await db.query(sql, [course_id]);

    return rows;
};

/* GET A SINGLE SPEAKING EXERCISE BY ID (FOR COMPARISON) */
exports.getSpeakingExerciseById = async (speaking_exercise_id) => {

    const sql = `
        SELECT
            speaking_exercise_id,
            speaking_phrase_japanese
        FROM tbl_training_speaking_exercises
        WHERE speaking_exercise_id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [speaking_exercise_id]);

    return rows[0];
};

/* GET SAVED PROGRESS FOR A STUDENT ON A COURSE */
exports.getSpeakingProgress = async (userId, courseId) => {

    const sql = `
        SELECT
            speaking_difficulty,
            speaking_phrase_index,
            speaking_correct_count
        FROM tbl_speaking_progress
        WHERE user_id = ?
        AND course_id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [userId, courseId]);

    return rows[0] || null;
};

/* SAVE / UPDATE PROGRESS (UPSERT) */
exports.upsertSpeakingProgress = async (
    userId,
    courseId,
    difficulty,
    phraseIndex,
    correctCount
) => {

    const sql = `
        INSERT INTO tbl_speaking_progress
        (
            user_id,
            course_id,
            speaking_difficulty,
            speaking_phrase_index,
            speaking_correct_count
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            speaking_difficulty = VALUES(speaking_difficulty),
            speaking_phrase_index = VALUES(speaking_phrase_index),
            speaking_correct_count = VALUES(speaking_correct_count)
    `;

    await db.query(sql, [
        userId,
        courseId,
        difficulty,
        phraseIndex,
        correctCount
    ]);
};

/* CLEAR PROGRESS (STUDENT CHOOSES A DIFFERENT LEVEL / STARTS OVER) */
exports.deleteSpeakingProgress = async (userId, courseId) => {

    const sql = `
        DELETE FROM tbl_speaking_progress
        WHERE user_id = ?
        AND course_id = ?
    `;

    await db.query(sql, [userId, courseId]);
};