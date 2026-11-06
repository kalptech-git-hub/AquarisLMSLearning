-- =========================================== START HERE ================================================


-- If you want to delete the whole database
DROP DATABASE company_lms;  

-- Initial step create database
CREATE DATABASE IF NOT EXISTS company_lms;

-- Use database 
USE company_lms;

-- New table Role master table
CREATE Table IF NOT EXISTS tbl_roles(
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(5) UNIQUE NOT NULL,
    role_name varchar(100) UNIQUE NOT NULL,

    is_active BIT(1) DEFAULT b'1',
    created_at dateTime DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT '0',
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT  DEFAULT '0'
);

-- Company table -- NEW
CREATE TABLE IF NOT EXISTS tbl_companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,

    company_name VARCHAR(255) NOT NULL,
    company_email VARCHAR(255),
    company_mobile_no VARCHAR(20),
    company_address TEXT,

    is_active BIT(1) DEFAULT b'1',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)
);

-- Users table
CREATE TABLE IF NOT EXISTS tbl_users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_full_name VARCHAR(255),
    user_mobile_no VARCHAR(20) UNIQUE,
    username varchar(100) UNIQUE,
    user_profile_photo VARCHAR(500),
    user_profile_cloud_id VARCHAR(255), --ADDED FOR CLOUDINARY IMAGE ID STORAGE
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_qualification VARCHAR(255),
    user_postal_address TEXT,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    
    user_last_login DATETIME NULL,
    
    role_id INT NOT NULL,
    company_id INT NULL,

    is_active BIT(1) DEFAULT b'1',
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT '0',
    updated_at dateTime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT  DEFAULT '0',

    FOREIGN KEY (role_id) REFERENCES tbl_roles(role_id),

    CONSTRAINT fk_users_company
        FOREIGN KEY (company_id)
        REFERENCES tbl_companies(company_id)
);

ALTER TABLE tbl_users
ADD UNIQUE KEY uq_users_user_company (user_id, company_id);

-- ALTER TABLE tbl_users
-- ADD COLUMN company_id INT NULL AFTER role_id,
-- ADD CONSTRAINT fk_users_company
--     FOREIGN KEY (company_id)
--     REFERENCES tbl_companies(company_id);


-- Company Admin table - NEW - not needed - delete
CREATE TABLE IF NOT EXISTS tbl_company_admins (
    company_admin_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    company_id INT NOT NULL,

    admin_designation VARCHAR(255),
    admin_department VARCHAR(255),

    is_active BIT(1) DEFAULT b'1',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,

    UNIQUE KEY uq_company_admin_user (user_id),

    CONSTRAINT fk_company_admin_user_company
        FOREIGN KEY (user_id, company_id)
        REFERENCES tbl_users(user_id, company_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_company_admin_company
        FOREIGN KEY (company_id)
        REFERENCES tbl_companies(company_id),

    CONSTRAINT fk_company_admin_created_by
        FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    CONSTRAINT fk_company_admin_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)
);


-- Employee Table - NEW - not needed - delete
CREATE TABLE IF NOT EXISTS tbl_employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    company_id INT NOT NULL,

    emp_code VARCHAR(100) NOT NULL,
    emp_department VARCHAR(255),
    emp_designation VARCHAR(255),

    joining_date DATE NULL,

    is_active BIT(1) DEFAULT b'1',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,

    UNIQUE KEY uq_employee_user (user_id),
    UNIQUE KEY uq_company_employee_code (company_id, emp_code),

    CONSTRAINT fk_employee_user_company
        FOREIGN KEY (user_id, company_id)
        REFERENCES tbl_users(user_id, company_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_company
        FOREIGN KEY (company_id)
        REFERENCES tbl_companies(company_id),

    CONSTRAINT fk_employee_created_by
        FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    CONSTRAINT fk_employee_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)
);

-- Instructors table
CREATE TABLE IF NOT EXISTS tbl_instructors (
    instructor_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL UNIQUE,

    ins_bio TEXT,
    ins_qualification VARCHAR(255),
    ins_experience VARCHAR(255),

    is_active BIT(1) DEFAULT b'1',
    created_at dateTime DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at dateTime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);
  

-- Courses table - on ui side we called it Course Category
CREATE TABLE IF NOT EXISTS tbl_courses ( 
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(100) UNIQUE NOT NULL,  -- unique code for the course
    course_name VARCHAR(255) NOT NULL,  -- name of the course
    course_level VARCHAR(100),  -- level of the course (e.g., Beginner, Intermediate, Advanced)
    
    is_active BIT(1) DEFAULT b'1',  -- status of the course
    created_by INT,  -- user ID of the creator
    updated_by INT,  -- user ID of the last updater

    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at dateTime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);

-- Trainings table - On UI side we called it Courses
CREATE TABLE IF NOT EXISTS tbl_trainings (
    training_id INT PRIMARY KEY AUTO_INCREMENT,

    course_id INT NOT NULL,
    
    training_title VARCHAR(255) NOT NULL,
    training_description TEXT,

    training_thumbnail VARCHAR(500),
    training_thumbnail_cloud_id VARCHAR(255),
    -- training_duration VARCHAR(100),
    training_duration_hours INT NOT NULL,  -- Total duration of the course in hours (e.g., 10 for 10 hrs)

    training_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL DEFAULT 'ONLINE',

    training_exam_name VARCHAR(255),     -- exam name for the course eg. JLPT N5
    training_exam_frequency VARCHAR(200),  

    -- Instead of storing textbook details in the trainings table,
    -- we can create a separate table for training textbooks and link it to the trainings table.
    training_textbook_name VARCHAR(255),
    training_textbook_chapters VARCHAR(255),

    training_fee DECIMAL(10,2),

    training_start_date DATETIME NULL,
    training_end_date DATETIME NULL,

    training_status ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    publish_status ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    enrollment_status ENUM('NOT_STARTED', 'OPEN', 'CLOSED') NOT NULL DEFAULT 'NOT_STARTED',

    publish_at DATETIME NULL,

    enrollment_closed_at DATETIME NULL,

    is_active BIT(1) DEFAULT b'1',

    created_at dateTime DEFAULT CURRENT_TIMESTAMP,
    updated_at dateTime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (course_id) REFERENCES tbl_courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);


-- ALTER TABLE tbl_trainings
-- ADD COLUMN training_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID')
-- NOT NULL DEFAULT 'ONLINE'
-- AFTER training_duration_hours;

-- Company trainings table 
CREATE TABLE IF NOT EXISTS tbl_company_trainings (
    company_trainings_id INT PRIMARY KEY AUTO_INCREMENT,

    company_id INT NOT NULL,
    training_id INT NOT NULL,

    training_users_limit INT NOT NUll,
    training_expiry_on DATETIME NOT NULL,

    -- is_active ENUM('A', 'R') DEFAULT 'A',  -- A= Assigned/Active, R = Revoked
    is_active BIT(1) DEFAULT b'1',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NOT NULL,    

    FOREIGN KEY (company_id)
        REFERENCES tbl_companies(company_id),

    FOREIGN KEY (training_id)
        REFERENCES tbl_trainings(training_id),

    FOREIGN KEY (assigned_by)
        REFERENCES tbl_users(user_id),

    UNIQUE KEY uq_company_training (company_id, training_id)
);

-- training instructors table- which course instructors
CREATE TABLE IF NOT EXISTS tbl_training_instructors (
    training_instructor_id INT PRIMARY KEY AUTO_INCREMENT,

    training_id INT NOT NULL,
    instructor_id INT NOT NULL,

    is_active BIT(1) DEFAULT b'1',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (training_id) REFERENCES tbl_trainings(training_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES tbl_instructors(instructor_id) ON DELETE CASCADE,

    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id),

    UNIQUE(training_id, instructor_id)
);

-- New Table added - Training Books
CREATE TABLE IF NOT EXISTS tbl_training_books (
    training_book_id INT PRIMARY KEY AUTO_INCREMENT,

    training_id INT NOT NULL,

    tb_book_name VARCHAR(255) NOT NULL,
    tb_book_chapters VARCHAR(255),

    is_active BIT(1) DEFAULT b'1',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (training_id)
        REFERENCES tbl_trainings(training_id)
        ON DELETE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id),

    UNIQUE (training_id, tb_book_name)    
);


--- Training Speaking Exercises (Pronunciation Practice)
CREATE TABLE IF NOT EXISTS tbl_training_speaking_exercises (
    speaking_exercise_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    speaking_phrase_japanese VARCHAR(500) NOT NULL,
    speaking_phrase_pronunciation VARCHAR(500),
    speaking_phrase_translation VARCHAR(500),
    phrase_type ENUM('WORD', 'PHRASE') DEFAULT 'WORD',
    speaking_difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'EASY',
    is_active BIT(1) DEFAULT b'1',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (training_id)
        REFERENCES tbl_courses(course_id)
        ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);

-- Enrollment table to track student enrollments in courses
CREATE TABLE IF NOT EXISTS tbl_enrollments (
    enroll_id INT PRIMARY KEY AUTO_INCREMENT,
    
    user_id INT NOT NULL,
    training_id INT NOT NULL,
    
    enroll_status ENUM(
        'P',
        'A',
        'R'
    ) DEFAULT 'P',

    -- enroll_postal_address TEXT,
    -- enroll_contact_number VARCHAR(20),
    -- enroll_qualification VARCHAR(255),

    -- THIS TWO ARE NOT NEEDED - REMOVE FROM DB
    -- enroll_photo VARCHAR(500),
    -- enroll_optional_upload VARCHAR(500),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id),

    FOREIGN KEY (training_id) REFERENCES tbl_trainings(training_id),
    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);
  

-- Course topics/section table to organize lessons into sections within a course
CREATE TABLE IF NOT EXISTS tbl_training_topics (
    topic_id INT PRIMARY KEY AUTO_INCREMENT,

    training_id INT NOT NULL,

    topic_title VARCHAR(255) NOT NULL,          -- title of the section e.g., 'Self-Introduction & Hiragana'
    topic_description TEXT,                     -- we needed we can have it later,  Optional section summary

    -- topic_duration_hours DECIMAL(5,2),                     -- Total duration of the section in hours (e.g., 10.5 for 10 hrs 30 mins)

    topic_recording_count INT DEFAULT 0,        -- Tracks number of recordings in this section
    topic_display_order INT NOT NULL,                   -- 1, 2, 3...

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,  
    updated_by INT,

    -- FOREIGN KEY (ct_cm_id) REFERENCES courses_master(cm_id) ON DELETE CASCADE
    FOREIGN KEY (training_id) REFERENCES tbl_trainings(training_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);   

-- Course lessons table to store individual lessons within a section of a course
CREATE TABLE IF NOT EXISTS tbl_training_lessons (
    lesson_id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT NOT NULL,
    lesson_title VARCHAR(255) NOT NULL,          -- e.g., 'Self-Introduction + Hiragana + Vocabulary'
    lesson_content_type ENUM('video', 'text', 'quiz', 'live') DEFAULT 'video',
    lesson_duration INT NOT NULL DEFAULT 0,                 -- Store in minutes for precision (e.g., 600 for 10 hrs)

    
    lesson_video_url VARCHAR(500),   -- Stores the Cloud URL
    
    lesson_cloud_file_id VARCHAR(255),    -- Store the unique File ID from S3 for deletion later

    -- lesson_video_path VARCHAR(500),              -- Stores the system file path or unique ID (e.g., '/uploads/video_123.mp4')

    lesson_order INT NOT NULL,                   -- Order within the section (1, 2, 3...), so that lessons will display in correct order
    lesson_is_free_preview BOOLEAN DEFAULT FALSE,-- Allow free preview?

    lesson_is_published BOOLEAN DEFAULT FALSE,  -- to check if lesson is published or not, cause sometimes it takes time to upload video.

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (topic_id) REFERENCES tbl_training_topics(topic_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES tbl_users(user_id),
    FOREIGN KEY (updated_by) REFERENCES tbl_users(user_id)
);

-- Live session - to store session details
CREATE TABLE IF NOT EXISTS tbl_live_sessions (
    live_session_id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,

    meeting_platform ENUM('zoom', 'google_meet') NOT NULL,
    meeting_link VARCHAR(1000) NOT NULL,
    meeting_password VARCHAR(255) DEFAULT NULL,
    session_status ENUM('SCHEDULED', 'CANCELLED', 'COMPLETED') DEFAULT 'SCHEDULED',

    start_time DATETIME NOT NULL,
    end_time DATETIME DEFAULT NULL,

    cancelled_at DATETIME DEFAULT NULL,
    cancelled_by INT DEFAULT NULL,

    created_by INT,
    updated_by INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_live_session_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES tbl_training_lessons(lesson_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_live_session_created_by
        FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_live_session_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_live_session_cancelled_by
        FOREIGN KEY (cancelled_by)
        REFERENCES tbl_users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tbl_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    notification_type VARCHAR(50) NOT NULL,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    live_session_id INT DEFAULT NULL,
    enroll_id INT DEFAULT NULL,
    training_id INT DEFAULT NULL,

    is_read BIT(1) DEFAULT b'0',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_enrollment
        FOREIGN KEY (enroll_id)
        REFERENCES tbl_enrollments(enroll_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_training
        FOREIGN KEY (training_id)
        REFERENCES tbl_trainings(training_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES tbl_users(user_id)
        ON DELETE CASCADE,

    -- CONSTRAINT fk_notification_live_session
    --     FOREIGN KEY (live_session_id)
    --     REFERENCES tbl_live_sessions(live_session_id)
    --     ON DELETE CASCADE

    -- Made it Null, so that previous notification will stay
    CONSTRAINT fk_notification_live_session
        FOREIGN KEY (live_session_id)
        REFERENCES tbl_live_sessions(live_session_id)
        ON DELETE SET NULL
);


-- table to store to student activity to display on student dashboard
CREATE TABLE IF NOT EXISTS tbl_student_activity_log (
    activity_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    activity_date   DATE NOT NULL,
    activity_count  INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_user_date (user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);

 
-- Table to store contents for each lesson
-- Used only when a Video lesson has extra material
CREATE TABLE IF NOT EXISTS tbl_training_lesson_contents (

    content_id INT PRIMARY KEY AUTO_INCREMENT,

    lesson_id INT NOT NULL,

    content_title VARCHAR(255) NOT NULL,

    content_type ENUM(
        -- 'video',
        'pdf',
        'image',
        'audio',
        -- 'quiz',
        'document'
    ) NOT NULL,

    content_file_name VARCHAR(255),

    -- content_url VARCHAR(500),
    content_url TEXT NOT NULL,
    download_url TEXT NULL,

    content_allow_download TINYINT(1) NOT NULL DEFAULT 0,

    content_size BIGINT NULL,


    content_cloud_file_id VARCHAR(255),

    content_order INT NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,

    updated_by INT,

    FOREIGN KEY (lesson_id)
        REFERENCES tbl_training_lessons(lesson_id)
        ON DELETE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)
);

-- ALTER TABLE tbl_training_lesson_contents
-- ADD COLUMN content_file_name VARCHAR(255);

-- Resource/text lesson - which will content file
-- used when the lesson itself is a file/resource
CREATE TABLE IF NOT EXISTS tbl_lesson_resources (

    resource_id INT PRIMARY KEY AUTO_INCREMENT,

    lesson_id INT NOT NULL UNIQUE,

    resource_title VARCHAR(255) NOT NULL,

    resource_type ENUM(
        'pdf',
        'image',
        'audio',
        'document'
    ) NOT NULL,

    resource_url TEXT NOT NULL,

    resource_cloud_file_id VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,

    updated_by INT,

    FOREIGN KEY (lesson_id)
        REFERENCES tbl_training_lessons(lesson_id)
        ON DELETE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)

);

-- Quiz Meta Data -
-- Used when lesson itself is a Quiz 
-- This table is only to store the title - not actual questions and options
-- UPDATED TABLE- 
CREATE TABLE IF NOT EXISTS tbl_quizzes (

    quiz_id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL UNIQUE,

    quiz_title VARCHAR(255) NOT NULL,
    -- quiz_description TEXT,
    quiz_instructions TEXT,

    total_questions INT DEFAULT 0,
    total_marks DECIMAL(10,2) DEFAULT 0,

    passing_marks DECIMAL(10,2) DEFAULT 0,
    allowed_attempts INT DEFAULT 1,

    grading_method ENUM(
        'first_attempt',
        'latest_attempt',
        'highest_score',
        'average_score'
    ) DEFAULT 'latest_attempt',

    quiz_duration_minutes INT NULL,

    quiz_start_datetime DATETIME NULL,
    quiz_end_datetime DATETIME NULL,

    show_result_immediately BOOLEAN DEFAULT TRUE,
    show_correct_answers BOOLEAN DEFAULT TRUE,

    is_published BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (lesson_id)
        REFERENCES tbl_training_lessons(lesson_id)
        ON DELETE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)
);


-- Quiz Questions
-- To store the actual questions, question type, marks per question
-- question order
CREATE TABLE IF NOT EXISTS tbl_quiz_questions (

    question_id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,

    question_text TEXT NOT NULL,

    question_type ENUM(
        'single_mcq',
        'multiple_mcq',
        'true_false',
        'short_answer'
    ) DEFAULT 'single_mcq',

    question_marks DECIMAL(5,2) DEFAULT 1,
    question_order INT DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,
    updated_by INT,

    FOREIGN KEY (quiz_id)
        REFERENCES tbl_quizzes(quiz_id)
        ON DELETE CASCADE,

    FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id)

);

-- Quiz Options - option text
CREATE TABLE IF NOT EXISTS tbl_quiz_options (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,

    option_text VARCHAR(500) NOT NULL,

    is_correct BOOLEAN DEFAULT FALSE,
    option_order INT DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (question_id)
        REFERENCES tbl_quiz_questions(question_id)
        ON DELETE CASCADE

);

-- Quiz attempts - number of attenpts allowed, score, percentage
CREATE TABLE IF NOT EXISTS tbl_quiz_attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT,

    quiz_id INT NOT NULL,
    user_id INT NOT NULL,

    attempt_number INT DEFAULT 1,

    score DECIMAL(6,2) DEFAULT 0,

    percentage DECIMAL(5,2) DEFAULT 0,

    passed BOOLEAN DEFAULT FALSE,

    attempt_status ENUM(
        'in_progress',
        'submitted',
        'expired'
    ) DEFAULT 'in_progress',

    started_at DATETIME,

    submitted_at DATETIME,

    time_taken_seconds INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quiz_id)
        REFERENCES tbl_quizzes(quiz_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES tbl_users(user_id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_attempt (
        quiz_id,
        user_id,
        attempt_number
    )    

);

-- Quiz answer
CREATE TABLE IF NOT EXISTS tbl_quiz_answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,

    attempt_id INT NOT NULL,
    question_id INT NOT NULL,

    option_id INT,

    answer_text TEXT NULL,

    is_selected BOOLEAN DEFAULT TRUE,

    marks_awarded DECIMAL(5,2) DEFAULT 0,

    is_correct BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (attempt_id)
        REFERENCES tbl_quiz_attempts(attempt_id)
        ON DELETE CASCADE,

    FOREIGN KEY (question_id)
        REFERENCES tbl_quiz_questions(question_id)
        ON DELETE CASCADE,

    FOREIGN KEY (option_id)
        REFERENCES tbl_quiz_options(option_id)
        ON DELETE SET NULL

);

-- To store the lesson progress
CREATE TABLE IF NOT EXISTS tbl_lesson_progress (
    lesson_progress_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    lesson_id INT NOT NULL,

    lesson_progress_completed BOOLEAN DEFAULT FALSE,

    lesson_progress_last_watch_seconds INT DEFAULT 0,

    lesson_progress_percentage DECIMAL(5,2) DEFAULT 0.00,

    lesson_completed_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    created_by INT,

    updated_by INT,    

    CONSTRAINT fk_lesson_progress_user
        FOREIGN KEY (user_id)
        REFERENCES tbl_users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES tbl_training_lessons(lesson_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_progress_created_by
        FOREIGN KEY (created_by)
        REFERENCES tbl_users(user_id),

    CONSTRAINT fk_lesson_progress_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES tbl_users(user_id),

    UNIQUE KEY uq_user_lesson (
        user_id,
        lesson_id
    )
);


-- Speaking Practice Progress (resume point per student per course)
CREATE TABLE IF NOT EXISTS tbl_speaking_progress (
    speaking_progress_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    course_id INT NOT NULL,          -- this is actually the trainingId, matching how speaking exercises already use "course_id"

    speaking_difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'ALL') NOT NULL DEFAULT 'EASY',
    speaking_phrase_index INT NOT NULL DEFAULT 0,
    speaking_correct_count INT NOT NULL DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,

    UNIQUE KEY uq_user_course_speaking (user_id, course_id)
);


-- Constrainints are added after table
ALTER TABLE tbl_enrollments
ADD CONSTRAINT unique_student_course
UNIQUE (user_id, training_id);

ALTER TABLE tbl_courses
ADD CONSTRAINT uq_course_name
UNIQUE (course_name);

ALTER TABLE tbl_live_sessions
ADD INDEX idx_live_session_lesson (lesson_id),
ADD INDEX idx_live_session_start_time (start_time),

ALTER TABLE tbl_notifications
ADD INDEX idx_notification_user (user_id),
ADD INDEX idx_notification_user_read (user_id, is_read),
ADD INDEX idx_notification_live_session (live_session_id),

-- no need
-- ALTER TABLE tbl_training_lessons
-- ADD COLUMN lesson_description TEXT;



INSERT INTO tbl_roles(role_code, role_name) values("ADM", "Admin");
INSERT INTO tbl_roles(role_code, role_name) values("STD", "Student");
INSERT INTO tbl_roles(role_code, role_name) values("INS", "Instructor");
INSERT INTO tbl_roles(role_code, role_name) values("CAD", "CompanyAdmin");


-- =========================================== END HERE ================================================



-- NOT USING - WILL REMOVE IT ONCE LMS IS WORKING
CREATE TABLE quiz_master (
    qm_id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    qm_question TEXT,
    qm_options JSON,  -- Store options as a JSON array
    qm_correct_answer VARCHAR(255),
    qm_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    qm_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id)
    REFERENCES tbl_training_lessons(lesson_id)
);

-- NOT USING - WILL REMOVE IT ONCE LMS IS WORKING
CREATE TABLE lesson_files (
    lf_id INT PRIMARY KEY AUTO_INCREMENT,

    lesson_id INT NOT NULL,

    lf_title VARCHAR(255) NOT NULL,

    lf_file_type ENUM(
        'pdf',
        'ppt',
        'doc',
        'docx',
        'audio',
        'zip',
        'image',
        'other'
    ) DEFAULT 'pdf',

    lf_file_url VARCHAR(500) NOT NULL,

    lf_cloud_file_id VARCHAR(255),

    lf_file_size BIGINT,

    lf_order INT DEFAULT 1,

    lf_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lf_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lesson_id)
        REFERENCES tbl_training_lessons(lesson_id)
        ON DELETE CASCADE
);