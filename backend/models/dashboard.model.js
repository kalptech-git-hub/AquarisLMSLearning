const db = require("./db");
require("dotenv").config();


exports.getDashboardStatsModel = async () => {
  const [
    [[courseCount]],
    [[activeCourseCount]],
    [[trainingCount]],
    [[activeTrainingCount]],
    [[inactiveTrainingCount]],
    [[completedTrainingCount]],
    [[studentCount]],
    [[enrollmentCount]],
    [[instructorCount]],
    [[companyCount]],
  ] = await Promise.all([
    db.query(`
      SELECT COUNT(*) AS totalCourses
      FROM tbl_courses
    `),

    db.query(`
      SELECT COUNT(*) AS totalActiveCourses
      FROM tbl_courses
      WHERE CAST(is_active AS UNSIGNED) = 1
    `),

    db.query(`
      SELECT COUNT(*) AS totalTrainings
      FROM tbl_trainings
    `),

    db.query(`
      SELECT COUNT(*) AS totalActiveTrainings
      FROM tbl_trainings
      WHERE CAST(is_active AS UNSIGNED) = 1
        AND training_status = 'ACTIVE'
    `),

    db.query(`
      SELECT COUNT(*) AS totalInactiveTrainings
      FROM tbl_trainings
      WHERE CAST(is_active AS UNSIGNED) = 0
        AND training_status = 'ACTIVE'
    `),

    db.query(`
      SELECT COUNT(*) AS totalCompletedTrainings
      FROM tbl_trainings
      WHERE training_status = 'COMPLETED'
    `),

    db.query(`
      SELECT COUNT(*) AS totalStudents
      FROM tbl_users u
      INNER JOIN tbl_roles r
        ON u.role_id = r.role_id
      WHERE r.role_name = 'student'
        AND u.is_active = 1
    `),

    db.query(`
      SELECT COUNT(*) AS totalEnrollments
      FROM tbl_enrollments
    `),

    db.query(`
      SELECT COUNT(*) AS totalInstructors
      FROM tbl_instructors i
      INNER JOIN tbl_users u
        ON i.user_id = u.user_id
      WHERE CAST(i.is_active AS UNSIGNED) = 1
        AND CAST(u.is_active AS UNSIGNED) = 1
    `),

    db.query(`
      SELECT COUNT(*) AS totalCompanies
      FROM tbl_companies
    `),
  ]);

  return {
    totalCourses: courseCount.totalCourses,
    totalActiveCourses: activeCourseCount.totalActiveCourses,

    totalTrainings: trainingCount.totalTrainings,
    totalActiveTrainings: activeTrainingCount.totalActiveTrainings,
    totalInactiveTrainings: inactiveTrainingCount.totalInactiveTrainings,
    totalCompletedTrainings: completedTrainingCount.totalCompletedTrainings,

    totalStudents: studentCount.totalStudents,
    totalEnrollments: enrollmentCount.totalEnrollments,
    totalInstructors: instructorCount.totalInstructors,
    totalCompanies: companyCount.totalCompanies,
  };
};

exports.getInstructorDashboardStatsModel = async (userId) => {

    // ==========================
    // GET INSTRUCTOR ID
    // ==========================

    const [instructorRows] = await db.query(

        `
            SELECT instructor_id
            FROM tbl_instructors
            WHERE user_id = ?
            AND CAST(is_active AS UNSIGNED) = 1
            LIMIT 1
        `,

        [userId]

    );

    if (instructorRows.length === 0) {

        throw new Error("Instructor not found.");

        }

    const instructorId = instructorRows[0].instructor_id;

    // ==========================
    // GET DASHBOARD COUNTS
    // ==========================

    const [

        [[courseCount]],
        [[studentCount]],
        [studentsEnrolledPerCourse],
        [[contentStats]],
        [[totalContentStats]],
        [topicProgressByCourse]

    ] = await Promise.all([

        db.query(
            `
                SELECT
                    COUNT(*) AS totalCoursesTeaching
                FROM tbl_training_instructors
                WHERE instructor_id = ?
                AND CAST(is_active AS UNSIGNED) = 1
            `,
            [instructorId]
        ),

        db.query(
            `
                SELECT
                    COUNT(*) AS totalStudentsEnrolled
                FROM tbl_enrollments e
                INNER JOIN tbl_training_instructors ti
                    ON e.training_id = ti.training_id
                WHERE ti.instructor_id = ?
                AND CAST(ti.is_active AS UNSIGNED) = 1
                AND e.enroll_status = 'A'
            `,
            [instructorId]
        ),

        db.query(
            `
                SELECT
                    t.training_id,
                    t.training_title,
                    COUNT(DISTINCT e.user_id) AS total_students
                FROM tbl_trainings t
                INNER JOIN tbl_training_instructors ti
                    ON t.training_id = ti.training_id
                    AND CAST(ti.is_active AS UNSIGNED) = 1
                INNER JOIN tbl_instructors i
                    ON ti.instructor_id = i.instructor_id
                LEFT JOIN tbl_enrollments e
                    ON t.training_id = e.training_id
                    AND e.enroll_status = 'A'
                WHERE i.instructor_id = ?
                  AND CAST(t.is_active AS UNSIGNED) = 1
                GROUP BY
                    t.training_id,
                    t.training_title
                ORDER BY
                    total_students DESC,
                    t.training_title ASC
            `,
            [instructorId]
        ),

        // Course material uploaded by this specific instructor (user),
        // not co-instructors on shared trainings.
        db.query(
            `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM tbl_training_lessons
                        WHERE lesson_content_type = 'video'
                          AND created_by = ?
                    ) AS videos,

                    (
                        SELECT COUNT(*)
                        FROM tbl_quizzes
                        WHERE created_by = ?
                    ) AS quizzes,

                    (
                        (
                            SELECT COUNT(*)
                            FROM tbl_training_lesson_contents
                            WHERE content_type = 'pdf'
                              AND created_by = ?
                        )
                        +
                        (
                            SELECT COUNT(*)
                            FROM tbl_lesson_resources
                            WHERE resource_type = 'pdf'
                              AND created_by = ?
                        )
                    ) AS pdfs
            `,
            [userId, userId, userId, userId]
        ),

                // Total course material across ALL instructors on this instructor's trainings
        db.query(
            `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM tbl_training_lessons l
                        INNER JOIN tbl_training_topics tt
                            ON l.topic_id = tt.topic_id
                        INNER JOIN tbl_training_instructors ti
                            ON tt.training_id = ti.training_id
                        WHERE l.lesson_content_type = 'video'
                          AND ti.instructor_id = ?
                          AND CAST(ti.is_active AS UNSIGNED) = 1
                    ) AS videos,

                    (
                        SELECT COUNT(*)
                        FROM tbl_quizzes q
                        INNER JOIN tbl_training_lessons l
                            ON q.lesson_id = l.lesson_id
                        INNER JOIN tbl_training_topics tt
                            ON l.topic_id = tt.topic_id
                        INNER JOIN tbl_training_instructors ti
                            ON tt.training_id = ti.training_id
                        WHERE ti.instructor_id = ?
                          AND CAST(ti.is_active AS UNSIGNED) = 1
                    ) AS quizzes,

                    (
                        (
                            SELECT COUNT(*)
                            FROM tbl_training_lesson_contents c
                            INNER JOIN tbl_training_lessons l
                                ON c.lesson_id = l.lesson_id
                            INNER JOIN tbl_training_topics tt
                                ON l.topic_id = tt.topic_id
                            INNER JOIN tbl_training_instructors ti
                                ON tt.training_id = ti.training_id
                            WHERE c.content_type = 'pdf'
                              AND ti.instructor_id = ?
                              AND CAST(ti.is_active AS UNSIGNED) = 1
                        )
                        +
                        (
                            SELECT COUNT(*)
                            FROM tbl_lesson_resources r
                            INNER JOIN tbl_training_lessons l
                                ON r.lesson_id = l.lesson_id
                            INNER JOIN tbl_training_topics tt
                                ON l.topic_id = tt.topic_id
                            INNER JOIN tbl_training_instructors ti
                                ON tt.training_id = ti.training_id
                            WHERE r.resource_type = 'pdf'
                              AND ti.instructor_id = ?
                              AND CAST(ti.is_active AS UNSIGNED) = 1
                        )
                    ) AS pdfs
            `,
            [instructorId, instructorId, instructorId, instructorId]
        ),

        db.query(
            `
                SELECT
                    c.course_id,
                    c.course_name AS course_title,
                    COALESCE(SUM(
                        CASE
                            WHEN topic_stats.total_lessons > 0
                              AND topic_stats.completed_lessons = topic_stats.total_lessons
                            THEN 1
                            ELSE 0
                        END
                    ), 0) AS completed,
                    COALESCE(SUM(
                        CASE
                            WHEN topic_stats.total_lessons > 0
                              AND topic_stats.completed_lessons < topic_stats.total_lessons
                            THEN 1
                            ELSE 0
                        END
                    ), 0) AS remaining
                FROM tbl_courses c
                INNER JOIN tbl_trainings t
                    ON c.course_id = t.course_id
                    AND CAST(t.is_active AS UNSIGNED) = 1
                INNER JOIN tbl_training_instructors ti
                    ON t.training_id = ti.training_id
                    AND CAST(ti.is_active AS UNSIGNED) = 1
                INNER JOIN tbl_instructors i
                    ON ti.instructor_id = i.instructor_id
                INNER JOIN tbl_training_topics tt
                    ON t.training_id = tt.training_id
                LEFT JOIN (
                    SELECT
                        tt.topic_id,
                        COUNT(l.lesson_id) AS total_lessons,
                        COUNT(DISTINCT CASE
                            WHEN lp.lesson_progress_completed = TRUE
                            THEN l.lesson_id
                        END) AS completed_lessons
                    FROM tbl_training_topics tt
                    LEFT JOIN tbl_training_lessons l
                        ON tt.topic_id = l.topic_id
                    LEFT JOIN tbl_lesson_progress lp
                        ON lp.lesson_id = l.lesson_id
                    LEFT JOIN tbl_enrollments e
                        ON lp.user_id = e.user_id
                        AND e.training_id = tt.training_id
                        AND e.enroll_status = 'A'
                    GROUP BY tt.topic_id
                ) AS topic_stats
                    ON topic_stats.topic_id = tt.topic_id
                WHERE i.instructor_id = ?
                  AND CAST(c.is_active AS UNSIGNED) = 1
                GROUP BY
                    c.course_id,
                    c.course_name
                ORDER BY
                    completed DESC,
                    c.course_name ASC
            `,
            [instructorId]
        )

    ]);

    return {
        totalCoursesTeaching:
            courseCount.totalCoursesTeaching,

        totalStudentsEnrolled:
            studentCount.totalStudentsEnrolled,

        studentsEnrolledPerCourse,

        contentStats: {
            videos: Number(contentStats.videos),
            pdfs: Number(contentStats.pdfs),
            quizzes: Number(contentStats.quizzes),
        },

        totalContentStats: {
            videos: Number(totalContentStats.videos),
            pdfs: Number(totalContentStats.pdfs),
            quizzes: Number(totalContentStats.quizzes),
        },

        topicProgressByCourse,
    };

};

exports.getTopCoursesByEnrollmentsModel = async () => {
    const [rows] = await db.query(`
        SELECT
            c.course_id,
            c.course_name,
            COUNT(e.enroll_id) AS totalEnrollments
        FROM tbl_courses c

        INNER JOIN tbl_trainings t
            ON c.course_id = t.course_id

        LEFT JOIN tbl_enrollments e
            ON t.training_id = e.training_id
            AND e.enroll_status = 'A'

        WHERE CAST(c.is_active AS UNSIGNED) = 1
          AND CAST(t.is_active AS UNSIGNED) = 1

        GROUP BY
            c.course_id,
            c.course_name

        ORDER BY totalEnrollments DESC,
                 c.course_name ASC

        LIMIT 5
    `);

    return rows;
};