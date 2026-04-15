<?php
require_once 'auth.php';
require_login();

$user = current_user();

// All published assignments + this user's submission (if any).
$stmt = db()->prepare("
    SELECT a.id, a.title, a.description, a.due_date, a.max_points,
           s.id AS submission_id, s.submitted_at, s.grade, s.feedback, s.file_name
    FROM assignments a
    LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = ?
    WHERE a.is_published = 1
    ORDER BY a.due_date ASC
");
$stmt->execute([$user['id']]);
$assignments = $stmt->fetchAll();

// Latest announcements
$ann_stmt = db()->query("
    SELECT a.title, a.body, a.created_at, u.full_name
    FROM announcements a
    JOIN users u ON u.id = a.created_by
    ORDER BY a.created_at DESC LIMIT 5
");
$announcements = $ann_stmt->fetchAll();

$page_title = 'Dashboard';
require 'header.php';

function status_badge($a): string {
    $now = new DateTime();
    $due = new DateTime($a['due_date']);
    if (!empty($a['submission_id'])) {
        if ($a['grade'] !== null) {
            return '<span class="badge badge-success">Graded: ' . h((string)$a['grade']) . '/' . h((string)$a['max_points']) . '</span>';
        }
        return '<span class="badge badge-info">Submitted</span>';
    }
    if ($due < $now) {
        return '<span class="badge badge-danger">Past due</span>';
    }
    $interval = $now->diff($due);
    if ($interval->days === 0) return '<span class="badge badge-warn">Due today</span>';
    if ($interval->days <= 3) return '<span class="badge badge-warn">Due in ' . $interval->days . ' day' . ($interval->days===1?'':'s') . '</span>';
    return '<span class="badge badge-info">Open</span>';
}
?>

<h1>Welcome, <?= h($user['full_name']) ?></h1>
<p class="text-muted mb-3">
    Signed in as <?= h($user['email']) ?>. Role: <?= h($user['role']) ?>.
</p>

<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:0.75rem;" class="mb-3">
    <a class="btn" href="/quizzes.php">&#129504; Take a quiz</a>
    <a class="btn btn-secondary" href="#assignments">&#128196; My assignments</a>
</div>

<a id="assignments"></a>

<?php if ($announcements): ?>
<h2>Announcements</h2>
<?php foreach ($announcements as $a): ?>
    <div class="card">
        <strong><?= h($a['title']) ?></strong>
        <?php if ($a['body']): ?>
            <p class="mt-1"><?= nl2br(h($a['body'])) ?></p>
        <?php endif; ?>
        <small class="text-muted">Posted by <?= h($a['full_name']) ?> on <?= h($a['created_at']) ?></small>
    </div>
<?php endforeach; ?>
<?php endif; ?>

<h2>Assignments</h2>

<?php if (!$assignments): ?>
    <div class="card card-muted">
        <p>No assignments have been posted yet. Check back soon!</p>
    </div>
<?php else: ?>
    <?php foreach ($assignments as $a): ?>
        <div class="assignment-card">
            <div style="flex:1 1 320px;">
                <div class="title">
                    <a href="assignment.php?id=<?= (int)$a['id'] ?>"><?= h($a['title']) ?></a>
                </div>
                <div class="meta">
                    Due <?= h(date('M j, Y \a\t g:i A', strtotime($a['due_date']))) ?>
                    &bull; <?= (int)$a['max_points'] ?> pts
                </div>
            </div>
            <div style="text-align:right;">
                <?= status_badge($a) ?>
                <div class="mt-1">
                    <a class="btn btn-small" href="assignment.php?id=<?= (int)$a['id'] ?>">
                        <?= empty($a['submission_id']) ? 'Open &amp; submit' : 'View / re-submit' ?>
                    </a>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; ?>

<?php require 'footer.php'; ?>
