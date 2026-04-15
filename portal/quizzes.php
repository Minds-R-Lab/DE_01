<?php
require_once 'auth.php';
require_login();

$user = current_user();
$pdo  = db();

// All published quizzes with this user's attempt stats
$stmt = $pdo->prepare("
    SELECT q.id, q.title, q.description, q.mode, q.time_limit_sec, q.due_date,
           q.max_attempts,
           (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS n_questions,
           (SELECT COUNT(*) FROM quiz_attempts a
                WHERE a.quiz_id = q.id AND a.user_id = ? AND a.submitted_at IS NOT NULL) AS n_attempts,
           (SELECT MAX(a.score) FROM quiz_attempts a
                WHERE a.quiz_id = q.id AND a.user_id = ? AND a.submitted_at IS NOT NULL) AS best_score,
           (SELECT MAX(a.max_score) FROM quiz_attempts a
                WHERE a.quiz_id = q.id AND a.user_id = ? AND a.submitted_at IS NOT NULL) AS best_max
    FROM quizzes q
    WHERE q.is_published = 1
    ORDER BY
        CASE WHEN q.due_date IS NULL THEN 1 ELSE 0 END,
        q.due_date ASC,
        q.id DESC
");
$stmt->execute([$user['id'], $user['id'], $user['id']]);
$quizzes = $stmt->fetchAll();

$page_title = 'Quizzes';
require 'header.php';
?>

<h1>Quizzes &amp; Exams</h1>
<p class="text-muted mb-3">Practice quizzes let you try as many times as you want. Graded quizzes count toward your grade.</p>

<?php if (!$quizzes): ?>
    <div class="card card-muted">
        <p>No quizzes have been published yet. Check back soon!</p>
    </div>
<?php else: ?>
    <?php foreach ($quizzes as $q):
        $now = new DateTime();
        $due = $q['due_date'] ? new DateTime($q['due_date']) : null;
        $past_due = ($due !== null && $due < $now);
        $attempts_left = ($q['max_attempts'] == 0) ? 999 : (int)$q['max_attempts'] - (int)$q['n_attempts'];
        $can_attempt = !$past_due && ($q['mode'] === 'practice' || $attempts_left > 0);
        ?>
        <div class="assignment-card">
            <div style="flex:1 1 360px;">
                <div class="title">
                    <?= h($q['title']) ?>
                    <?php if ($q['mode'] === 'practice'): ?>
                        <span class="badge badge-info">Practice</span>
                    <?php else: ?>
                        <span class="badge badge-warn">Graded</span>
                    <?php endif; ?>
                </div>
                <div class="meta">
                    <?= (int)$q['n_questions'] ?> question<?= $q['n_questions']==1?'':'s' ?>
                    <?php if ($q['time_limit_sec']): ?>
                        &bull; <?= (int)round($q['time_limit_sec']/60) ?> min
                    <?php endif; ?>
                    <?php if ($due): ?>
                        &bull; Due <?= h($due->format('M j, g:i A')) ?>
                    <?php endif; ?>
                </div>
                <?php if ($q['description']): ?>
                    <p class="text-small text-muted mt-1" style="margin:0.4rem 0 0;"><?= h($q['description']) ?></p>
                <?php endif; ?>
            </div>
            <div style="text-align:right;">
                <?php if ($q['best_score'] !== null): ?>
                    <div>
                        <span class="badge badge-success">
                            Best: <?= (int)$q['best_score'] ?> / <?= (int)$q['best_max'] ?>
                        </span>
                    </div>
                    <div class="text-small text-muted mt-1">
                        <?= (int)$q['n_attempts'] ?> attempt<?= $q['n_attempts']==1?'':'s' ?>
                        <?php if ($q['mode'] === 'graded' && $q['max_attempts'] > 0): ?>
                            &bull; <?= max(0, $attempts_left) ?> left
                        <?php endif; ?>
                    </div>
                <?php elseif ($past_due): ?>
                    <div><span class="badge badge-danger">Past due</span></div>
                <?php else: ?>
                    <div><span class="badge badge-info">Not started</span></div>
                <?php endif; ?>

                <div class="mt-1">
                    <?php if ($can_attempt): ?>
                        <a class="btn btn-small" href="/quiz-take.php?id=<?= (int)$q['id'] ?>">
                            <?= ($q['n_attempts']>0 && $q['mode']==='practice') ? 'Try again' : 'Start quiz' ?>
                        </a>
                    <?php else: ?>
                        <span class="text-small text-muted">Closed</span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; ?>

<?php require 'footer.php'; ?>
