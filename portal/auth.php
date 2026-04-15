<?php
/**
 * Session + authentication + CSRF helpers.
 * Every page that uses sessions should require this file FIRST.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Harden session cookies
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');
if (!empty($_SERVER['HTTPS'])) {
    ini_set('session.cookie_secure', '1');
}
session_name('deportal_sid');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** Is someone logged in? */
function is_logged_in(): bool {
    return !empty($_SESSION['user_id']);
}

/** Return current user record (or null). */
function current_user(): ?array {
    if (!is_logged_in()) return null;
    static $cached = null;
    if ($cached !== null) return $cached;
    $stmt = db()->prepare('SELECT id, email, full_name, student_id, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $cached = $stmt->fetch() ?: null;
    return $cached;
}

/** Redirect to login if not logged in. */
function require_login(): void {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

/** Redirect to login if not an instructor/admin. */
function require_instructor(): void {
    require_login();
    $u = current_user();
    if (!$u || !in_array($u['role'], ['instructor', 'admin'], true)) {
        http_response_code(403);
        die('Forbidden: you need instructor privileges to view this page.');
    }
}

/** Log a user in (call after verifying credentials). */
function do_login(int $user_id): void {
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user_id;
    $_SESSION['login_time'] = time();
}

/** Destroy the current session. */
function do_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

// ========= CSRF =========

/** Get (or create) the CSRF token for this session. */
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** Print a hidden <input> with the CSRF token. Use inside every <form>. */
function csrf_field(): void {
    echo '<input type="hidden" name="csrf" value="' . htmlspecialchars(csrf_token()) . '">';
}

/** Die if the POST doesn't carry a matching CSRF token. */
function csrf_verify(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
    $got = $_POST['csrf'] ?? '';
    if (!hash_equals(csrf_token(), $got)) {
        http_response_code(400);
        die('Invalid form submission (CSRF check failed). Please go back and try again.');
    }
}

// ========= Flash messages =========

function flash(string $msg, string $type = 'info'): void {
    $_SESSION['flash'][] = ['msg' => $msg, 'type' => $type];
}

function render_flashes(): void {
    if (empty($_SESSION['flash'])) return;
    foreach ($_SESSION['flash'] as $f) {
        $cls = ($f['type'] === 'error') ? 'flash-error' :
               (($f['type'] === 'success') ? 'flash-success' : 'flash-info');
        echo '<div class="flash ' . $cls . '">' . htmlspecialchars($f['msg']) . '</div>';
    }
    unset($_SESSION['flash']);
}

// ========= Tiny helpers =========

function h(?string $s): string { return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8'); }

function safe_redirect(string $path): void {
    // Only allow redirect to our own paths — no open redirects.
    if (!preg_match('#^/?[A-Za-z0-9/_\-\.]+$#', $path)) {
        $path = 'dashboard.php';
    }
    header('Location: ' . $path);
    exit;
}
