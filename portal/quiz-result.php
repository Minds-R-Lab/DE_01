<?php
require_once 'auth.php';
require_login();

$user = current_user();
$pdo  = db();
$aid  = (int) ($_GET['attempt'] ?? 0);

// Fetch attempt + quiz (must belong to this user, unless instructor)
$stmt = $pdo->prepare("
    SELECT a.*, q.title, q.mode, q.description AS quiz_description,
           u.full_name AS student_name
    FROM quiz_attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
");
$stmt->execute([$aid]);
$attempt = $stmt->fetch();
if (!$attempt) { http_response_code(404); die('Attempt not found.'); }

// Authorization: either the student's own attempt OR an instructor viewing
$is_instructor = in_array($user['role'], ['instructor','admin'], true);
if ($attempt['user_id'] != $user['id'] && !$is_instructor) {
    http_response_code(403);
    die('You can only view your own quiz attempts.');
}

if (!$attempt['submitted_at']) {
    flash('That attempt has not been submitted yet.', 'error');
    header('Location: /quizzes.php');
    exit;
}

// Fetch question-by-question results
$detail = $pdo->prepare("
    SELECT q.id, q.stem, q.explanation, qq.points,
           a.selected_option_id, a.is_correct, a.points_earned
    FROM quiz_questions qq
    JOIN questions q ON q.id = qq.question_id
    LEFT JOIN quiz_answers a ON a.attempt_id = ? AND a.question_id = q.id
    WHERE qq.quiz_id = ?
    ORDER BY qq.sort_order, qq.question_id
");
$detail->execute([$aid, $attempt['quiz_id']]);
$rows = $detail->fetchAll();

foreach ($rows as &$r) {
    $o = $pdo->prepare('SELECT id, option_text, is_correct FROM question_options WHERE question_id = ? ORDER BY sort_order, id');
    $o->execute([$r['id']]);
    $r['options'] = $o->fetchAll();
}
unset($r);

$pct = $attempt['max_score'] > 0 ? round(100 * $attempt['score'] / $attempt['max_score']) : 0;

$page_title = 'Result: ' . $attempt['title'];
require 'header.php';
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>

<p class="text-small">
    <?php if ($is_instructor && $attempt['user_id'] != $user['id']): ?>
        <a href="/instructor/quiz-results.php?id=<?= (int)$attempt['quiz_id'] ?>">&larr; Back to all results</a>
    <?php else: ?>
        <a href="/quizzes.php">&larr; Back to quizzes</a>
    <?php endif; ?>
</p>

<h1><?= h($attempt['title']) ?></h1>
<?php if ($is_instructor && $attempt['user_id'] != $user['id']): ?>
    <p class="text-muted">Student: <strong><?= h($attempt['student_name']) ?></strong></p>
<?php endif; ?>

<div class="card card-highlight">
    <div class="flex-between">
        <div>
            <div class="text-small text-muted">Score</div>
            <div style="font-size:2.2rem; font-weight:700; color:var(--primary);">
                <?= (int)$attempt['score'] ?> / <?= (int)$attempt['max_score'] ?>
            </div>
            <div>
                <span class="badge <?= $pct >= 80 ? 'badge-success' : ($pct >= 50 ? 'badge-warn' : 'badge-danger') ?>">
                    <?= $pct ?>%
                </span>
            </div>
        </div>
        <div style="text-align:right;">
            <div class="text-small text-muted">Submitted</div>
            <div><?= h(date('M j, Y g:i A', strtotime($attempt['submitted_at']))) ?></div>
            <?php if ($attempt['time_spent_sec']): ?>
                <div class="text-small text-muted mt-1">
                    Time spent: <?= (int)round($attempt['time_spent_sec']/60) ?> min
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<h2>Question-by-question review</h2>

<?php foreach ($rows as $idx => $r): ?>
    <div class="card" style="border-left:4px solid <?= $r['is_correct'] ? 'var(--success)' : 'var(--danger)' ?>;">
        <div class="flex-between">
            <strong>Q<?= $idx+1 ?>.</strong>
            <span>
                <?php if ($r['is_correct']): ?>
                    <span class="badge badge-success">Correct &mdash; +<?= (int)$r['points_earned'] ?></span>
                <?php else: ?>
                    <span class="badge badge-danger">Incorrect &mdash; 0 / <?= (int)$r['points'] ?></span>
                <?php endif; ?>
            </span>
        </div>
        <div style="margin:0.6rem 0;"><?= $r['stem'] ?></div>

        <?php foreach ($r['options'] as $opt):
            $was_selected = ($r['selected_option_id'] == $opt['id']);
            $color = 'transparent';
            if ($opt['is_correct']) $color = '#d1fae5';
            elseif ($was_selected) $color = '#fee2e2';
            ?>
            <div style="padding:0.5rem 0.75rem; border-radius:6px; background:<?= $color ?>;
                        border:1px solid <?= $opt['is_correct'] ? 'var(--success)' : ($was_selected ? 'var(--danger)' : '#e2e8f0') ?>;
                        margin-bottom:0.35rem;">
                <?php if ($was_selected): ?><strong>&#10148; Your answer:</strong> <?php endif; ?>
                <?= $opt['option_text'] ?>
                <?php if ($opt['is_correct']): ?>
                    <span style="color:var(--success); float:right;">&#10003; Correct</span>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>

        <?php if ($r['explanation']): ?>
            <div class="card card-muted" style="margin-top:0.6rem;">
                <strong>Explanation:</strong>
                <div style="margin-top:0.3rem;"><?= $r['explanation'] ?></div>
            </div>
        <?php endif; ?>
    </div>
<?php endforeach; ?>

<script>
document.addEventListener('DOMContentLoaded', function() {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$',  right: '$',  display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ]
        });
    }
});
</script>

<?php require 'footer.php'; ?>
