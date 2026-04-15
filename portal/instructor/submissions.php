<?php
require_once __DIR__ . '/../auth.php';
require_instructor();

$aid = (int) ($_GET['assignment'] ?? 0);
$a_stmt = db()->prepare('SELECT * FROM assignments WHERE id = ?');
$a_stmt->execute([$aid]);
$assignment = $a_stmt->fetch();
if (!$assignment) { http_response_code(404); die('Assignment not found.'); }

$s_stmt = db()->prepare("
    SELECT s.*, u.full_name, u.email, u.student_id
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    WHERE s.assignment_id = ?
    ORDER BY s.submitted_at DESC
");
$s_stmt->execute([$aid]);
$subs = $s_stmt->fetchAll();

$page_title = 'Submissions: ' . $assignment['title'];
require __DIR__ . '/../header.php';
?>

<p class="text-small"><a href="index.php">&larr; Back to instructor dashboard</a></p>

<h1><?= h($assignment['title']) ?></h1>
<p class="text-muted">
    Due <?= h(date('M j, Y g:i A', strtotime($assignment['due_date']))) ?>
    &bull; Max points: <?= (int)$assignment['max_points'] ?>
</p>

<h2>Submissions (<?= count($subs) ?>)</h2>

<?php if (!$subs): ?>
    <div class="card card-muted"><p>No submissions yet.</p></div>
<?php else: ?>
    <table class="data">
        <thead>
            <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>File</th>
                <th>Grade</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($subs as $s): ?>
            <tr>
                <td>
                    <strong><?= h($s['full_name']) ?></strong><br>
                    <small class="text-muted"><?= h($s['email']) ?> <?= $s['student_id'] ? '&bull; ID ' . h($s['student_id']) : '' ?></small>
                </td>
                <td>
                    <?= h(date('M j, Y g:i A', strtotime($s['submitted_at']))) ?>
                    <?php if (strtotime($s['submitted_at']) > strtotime($assignment['due_date'])): ?>
                        <span class="badge badge-warn">Late</span>
                    <?php endif; ?>
                </td>
                <td>
                    <a href="download.php?sid=<?= (int)$s['id'] ?>">
                        <?= h($s['file_name']) ?>
                    </a>
                </td>
                <td>
                    <?php if ($s['grade'] !== null): ?>
                        <span class="badge badge-success"><?= h((string)$s['grade']) ?> / <?= (int)$assignment['max_points'] ?></span>
                    <?php else: ?>
                        <span class="badge badge-warn">Pending</span>
                    <?php endif; ?>
                </td>
                <td>
                    <a class="btn btn-small" href="grade.php?sid=<?= (int)$s['id'] ?>">
                        <?= $s['grade'] !== null ? 'Re-grade' : 'Grade' ?>
                    </a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<?php require __DIR__ . '/../footer.php'; ?>
