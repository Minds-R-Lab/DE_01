<?php
require_once __DIR__ . '/../auth.php';
require_instructor();
$pdo = db();

$qid = (int) ($_GET['id'] ?? 0);
$stmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
$stmt->execute([$qid]);
$quiz = $stmt->fetch();
if (!$quiz) { http_response_code(404); die('Quiz not found.'); }

// All submitted attempts, one row per student (best attempt per student)
$attempts = $pdo->prepare("
    SELECT a.id, a.user_id, a.score, a.max_score, a.submitted_at, a.time_spent_sec,
           u.full_name, u.email, u.student_id
    FROM quiz_attempts a
    JOIN users u ON u.id = a.user_id
    WHERE a.quiz_id = ? AND a.submitted_at IS NOT NULL
    ORDER BY a.submitted_at DESC
");
$attempts->execute([$qid]);
$rows = $attempts->fetchAll();

// Stats
$n = count($rows);
$avg_pct = null; $high_pct = null; $low_pct = null;
if ($n > 0 && $rows[0]['max_score'] > 0) {
    $pcts = array_map(fn($r) => 100.0 * $r['score'] / max(1, $r['max_score']), $rows);
    $avg_pct = round(array_sum($pcts) / count($pcts), 1);
    $high_pct = round(max($pcts), 1);
    $low_pct  = round(min($pcts), 1);
}

$page_title = 'Results: ' . $quiz['title'];
require __DIR__ . '/../header.php';
?>

<p class="text-small"><a href="/instructor/quizzes.php">&larr; All quizzes</a></p>

<h1><?= h($quiz['title']) ?></h1>
<p class="text-muted">
    <?php if ($quiz['mode']==='practice'): ?>
        <span class="badge badge-info">Practice</span>
    <?php else: ?>
        <span class="badge badge-warn">Graded</span>
    <?php endif; ?>
    &nbsp; <a href="/instructor/quiz-edit.php?id=<?= $qid ?>">Edit quiz</a>
</p>

<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem;" class="mb-3">
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--primary);"><?= $n ?></div>
        <div class="text-muted text-small">Attempts</div>
    </div>
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--success);"><?= $avg_pct !== null ? $avg_pct.'%' : '—' ?></div>
        <div class="text-muted text-small">Average</div>
    </div>
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--accent);"><?= $high_pct !== null ? $high_pct.'%' : '—' ?></div>
        <div class="text-muted text-small">Highest</div>
    </div>
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--warning);"><?= $low_pct !== null ? $low_pct.'%' : '—' ?></div>
        <div class="text-muted text-small">Lowest</div>
    </div>
</div>

<h2>All attempts</h2>

<?php if (!$rows): ?>
    <div class="card card-muted"><p>No submissions yet.</p></div>
<?php else: ?>
    <table class="data">
        <thead>
            <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Score</th>
                <th>%</th>
                <th>Time</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($rows as $r):
            $pct = $r['max_score'] > 0 ? round(100 * $r['score'] / $r['max_score']) : 0; ?>
            <tr>
                <td>
                    <strong><?= h($r['full_name']) ?></strong><br>
                    <small class="text-muted"><?= h($r['email']) ?> <?= $r['student_id']?'&bull; ID '.h($r['student_id']):'' ?></small>
                </td>
                <td><?= h(date('M j, Y g:i A', strtotime($r['submitted_at']))) ?></td>
                <td><?= (int)$r['score'] ?> / <?= (int)$r['max_score'] ?></td>
                <td>
                    <span class="badge <?= $pct>=80?'badge-success':($pct>=50?'badge-warn':'badge-danger') ?>">
                        <?= $pct ?>%
                    </span>
                </td>
                <td>
                    <?= $r['time_spent_sec'] ? (int)round($r['time_spent_sec']/60).' min' : '—' ?>
                </td>
                <td>
                    <a class="btn btn-small" href="/quiz-result.php?attempt=<?= (int)$r['id'] ?>">View</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<?php require __DIR__ . '/../footer.php'; ?>
