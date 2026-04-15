<?php
require_once __DIR__ . '/../auth.php';
require_instructor();

$sid = (int) ($_GET['sid'] ?? 0);
$stmt = db()->prepare('SELECT file_path, file_name FROM submissions WHERE id = ?');
$stmt->execute([$sid]);
$row = $stmt->fetch();
if (!$row || !is_file($row['file_path'])) {
    http_response_code(404);
    die('File not found.');
}

// Sanity-check the path is inside UPLOAD_DIR to prevent path-traversal
$real_upload = realpath(UPLOAD_DIR);
$real_file   = realpath($row['file_path']);
if ($real_upload === false || $real_file === false || strpos($real_file, $real_upload) !== 0) {
    http_response_code(403);
    die('Forbidden.');
}

$size = filesize($real_file);
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . addslashes($row['file_name']) . '"');
header('Content-Length: ' . $size);
header('Cache-Control: private, max-age=0');
readfile($real_file);
exit;
