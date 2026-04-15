<?php
require_once __DIR__ . '/../auth.php';
require_instructor();
csrf_verify();

$user  = current_user();
$title = trim($_POST['title'] ?? '');
$body  = trim($_POST['body']  ?? '');

if ($title === '') {
    flash('Announcement title is required.', 'error');
    header('Location: index.php');
    exit;
}

$ins = db()->prepare('INSERT INTO announcements (title, body, created_by) VALUES (?, ?, ?)');
$ins->execute([$title, $body ?: null, $user['id']]);

flash('Announcement posted.', 'success');
header('Location: index.php');
exit;
