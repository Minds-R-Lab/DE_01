-- ============================================================
-- DE Course Student Portal - Database Schema
-- Run this once in phpMyAdmin after creating the database.
-- ============================================================

-- Users: both students and instructors live in this table, distinguished by `role`.
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(255)    NOT NULL,
    student_id      VARCHAR(50)     NULL,
    role            ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments: created by an instructor. One assignment has many submissions.
CREATE TABLE IF NOT EXISTS assignments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    due_date        DATETIME        NOT NULL,
    max_points      INT             NOT NULL DEFAULT 100,
    created_by      INT             NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    is_published    TINYINT(1)      NOT NULL DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_due (due_date),
    INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submissions: each student can submit at most once per assignment (unique constraint).
-- Re-submitting overwrites the previous file and resets grade status.
CREATE TABLE IF NOT EXISTS submissions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    assignment_id   INT             NOT NULL,
    file_path       VARCHAR(500)    NOT NULL,
    file_name       VARCHAR(255)    NOT NULL,
    notes           TEXT            NULL,
    submitted_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    grade           DECIMAL(5,2)    NULL,
    feedback        TEXT            NULL,
    graded_by       INT             NULL,
    graded_at       TIMESTAMP       NULL,
    FOREIGN KEY (user_id)        REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (assignment_id)  REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by)      REFERENCES users(id)       ON DELETE SET NULL,
    UNIQUE KEY unique_submission (user_id, assignment_id),
    INDEX idx_graded (graded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcements: simple one-line notes the instructor can post to the dashboard.
CREATE TABLE IF NOT EXISTS announcements (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    body            TEXT            NULL,
    created_by      INT             NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the initial instructor account.
-- The password below is 'change-me-now-please' (hashed with bcrypt).
-- Log in with this, then IMMEDIATELY change your password.
-- Email: m.a.mabrok@gmail.com  |  Password: change-me-now-please
INSERT INTO users (email, password_hash, full_name, role) VALUES
    ('m.a.mabrok@gmail.com',
     '$2y$10$lPANYfozgdSphEoH4EKXdeh9/nBhFWHSCY12b5npB/0vmPiCD1vKq',
     'Dr. Mohamed Mabrok',
     'instructor')
ON DUPLICATE KEY UPDATE id = id;
