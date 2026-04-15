-- ============================================================
-- DE Course Student Portal - MCQ Quizzes Extension Schema
-- Run this AFTER you've already imported schema.sql.
-- Safe to run more than once (uses CREATE TABLE IF NOT EXISTS).
-- ============================================================

-- Questions: the reusable question bank. One question can appear in many quizzes.
CREATE TABLE IF NOT EXISTS questions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    stem            TEXT            NOT NULL,
    explanation     TEXT            NULL,
    topic           VARCHAR(100)    NULL,
    chapter         VARCHAR(20)     NULL,
    difficulty      ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
    created_by      INT             NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_q_topic   (topic),
    INDEX idx_q_chapter (chapter),
    INDEX idx_q_diff    (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Options for each question (usually 4; one or more marked correct).
CREATE TABLE IF NOT EXISTS question_options (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    question_id     INT             NOT NULL,
    option_text     TEXT            NOT NULL,
    is_correct      TINYINT(1)      NOT NULL DEFAULT 0,
    sort_order      INT             NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_opt_q (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizzes: a collection of questions with rules (time limit, mode, etc.).
CREATE TABLE IF NOT EXISTS quizzes (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    title              VARCHAR(255)    NOT NULL,
    description        TEXT            NULL,
    mode               ENUM('practice','graded') NOT NULL DEFAULT 'graded',
    time_limit_sec     INT             NULL,
    due_date           DATETIME        NULL,
    is_published       TINYINT(1)      NOT NULL DEFAULT 0,
    shuffle_questions  TINYINT(1)      NOT NULL DEFAULT 0,
    shuffle_options    TINYINT(1)      NOT NULL DEFAULT 0,
    max_attempts       INT             NOT NULL DEFAULT 1,
    created_by         INT             NOT NULL,
    created_at         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_qz_pub  (is_published),
    INDEX idx_qz_mode (mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Many-to-many: which questions are in which quiz (and in what order, worth how many points).
CREATE TABLE IF NOT EXISTS quiz_questions (
    quiz_id        INT NOT NULL,
    question_id    INT NOT NULL,
    sort_order     INT NOT NULL DEFAULT 0,
    points         INT NOT NULL DEFAULT 1,
    PRIMARY KEY (quiz_id, question_id),
    FOREIGN KEY (quiz_id)     REFERENCES quizzes(id)   ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A student's attempt at a quiz. `submitted_at IS NULL` means still in progress.
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT             NOT NULL,
    quiz_id        INT             NOT NULL,
    started_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    submitted_at   TIMESTAMP       NULL,
    score          INT             NULL,
    max_score      INT             NULL,
    time_spent_sec INT             NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_att_uq  (user_id, quiz_id),
    INDEX idx_att_sub (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual answers within an attempt.
CREATE TABLE IF NOT EXISTS quiz_answers (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id         INT            NOT NULL,
    question_id        INT            NOT NULL,
    selected_option_id INT            NULL,
    is_correct         TINYINT(1)     NOT NULL DEFAULT 0,
    points_earned      INT            NOT NULL DEFAULT 0,
    FOREIGN KEY (attempt_id)         REFERENCES quiz_attempts(id)    ON DELETE CASCADE,
    FOREIGN KEY (question_id)        REFERENCES questions(id)        ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attempt_q (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
