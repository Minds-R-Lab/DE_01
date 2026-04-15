<?php
/**
 * Database connection helper (PDO).
 * Returns a singleton PDO instance for the whole request.
 */

require_once __DIR__ . '/config.php';

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        if (defined('DEBUG') && DEBUG) {
            die('Database connection failed: ' . htmlspecialchars($e->getMessage()));
        }
        http_response_code(500);
        die('The portal is temporarily unavailable. Please try again in a few minutes.');
    }
    return $pdo;
}
