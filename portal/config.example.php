<?php
/**
 * Copy this file to `config.php` and fill in your values.
 *
 * IMPORTANT: `config.php` must NEVER be committed to git.
 * It contains secrets (database credentials). Keep it only on the server.
 */

// ========== Database ==========
// Get these from cPanel > MySQL Databases after creating the DB + user.
define('DB_HOST', 'localhost');
define('DB_NAME', 'USERNAME_deportal');   // Something like mmabrok_deportal
define('DB_USER', 'USERNAME_deportal');   // The DB user you created
define('DB_PASS', 'PUT-YOUR-DB-PASSWORD-HERE');

// ========== Site ==========
define('SITE_NAME',  'Math 4 Student Portal');
define('SITE_URL',   'https://portal.mmabrok.com');  // no trailing slash
define('COURSE_URL', 'https://de.mmabrok.com');      // link back to course website

// ========== Uploads ==========
define('UPLOAD_DIR',       __DIR__ . '/uploads');    // absolute path on disk
define('UPLOAD_MAX_BYTES', 10 * 1024 * 1024);        // 10 MB per file
define('UPLOAD_ALLOWED_EXT', ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg']);

// ========== Registration ==========
// Leave empty to allow any email domain.
// Example: ['qu.edu.qa', 'student.qu.edu.qa'] restricts registration to QU emails.
define('ALLOWED_EMAIL_DOMAINS', []);

// If true, new registrants get role='student' automatically.
// If false, the instructor must manually promote them (not yet implemented; always true for now).
define('ALLOW_SELF_REGISTRATION', true);

// ========== Session ==========
// Generate a random string (e.g. run `openssl rand -hex 32`).
// This is used to sign session data; if it leaks, regenerate it and all sessions become invalid.
define('SESSION_SECRET', 'REPLACE-ME-WITH-A-RANDOM-STRING-AT-LEAST-32-CHARS');

// ========== Display errors? ==========
// Turn this OFF in production (false) so your error messages don't leak to users.
define('DEBUG', false);
