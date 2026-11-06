const db = require("./models/db");
const speakingWords = require("./data/speakingWords.json");
const { insertSpeakingExercises, deleteSpeakingExercises } = require("./models/speaking.model");

const run = async () => {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        for (const courseId of Object.keys(speakingWords)) {

            const exercises = speakingWords[courseId];

            console.log(`Seeding ${exercises.length} exercises for course_id ${courseId}...`);

            // Clear existing exercises for this course before re-seeding
            await deleteSpeakingExercises(connection, courseId);

            await insertSpeakingExercises(connection, courseId, exercises);

        }

        await connection.commit();

        console.log("✅ Seeding completed successfully.");

    } catch (error) {

        await connection.rollback();
        console.error("❌ Seeding failed:", error);

    } finally {

        connection.release();
        process.exit();

    }

};

run();