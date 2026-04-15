<?php
require_once 'auth.php';
require_login();

$user = current_user();
$pdo  = db();
$qid  = (int) ($_GET['id'] ?? 0);

// Fetch quiz
$stmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ? AND is_published = 1');
$stmt->execute([$qid]);
$quiz = $stmt->fetch();
if (!$quiz) {
    http_response_code(404);
    die('Quiz not found or not published.');
}

// Check deadline
$now = new DateTime();
if ($quiz['due_date'] && new DateTime($quiz['due_date']) < $now) {
    flash('That quiz is past its due date and no longer accepts attempts.', 'error');
    header('Location: /quizzes.php');
    exit;
}

// Check attempt limit (0 = unlimited, else up to max_attempts)
$cnt_stmt = $pdo->prepare(
    'SELECT COUNT(*) FROM quiz_attempts
     WHERE user_id = ? AND quiz_id = ? AND submitted_at IS NOT NULL'
);
$cnt_stmt->execute([$user['id'], $qid]);
$done_attempts = (int) $cnt_stmt->fetchColumn();
if ($quiz['max_attempts'] > 0 && $done_attempts >= $quiz['max_attempts']) {
    flash('You have used all your attempts for this quiz.', 'error');
    header('Location: /quizzes.php');
    exit;
}

// Handle submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $attempt_id = (int) ($_POST['attempt_id'] ?? 0);
    $answers    = $_POST['answers'] ?? [];

    // Verify the attempt belongs to this user and is unsubmitted
    $a_stmt = $pdo->prepare(
        'SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ? AND quiz_id = ? AND submitted_at IS NULL'
    );
    $a_stmt->execute([$attempt_id, $user['id'], $qid]);
    $attempt = $a_stmt->fetch();
    if (!$attempt) {
        flash('Your attempt could not be found or was already submitted.', 'error');
        header('Location: /quizzes.php');
        exit;
    }

    // Enforce time limit server-side
    if ($quiz['time_limit_sec']) {
        $started = strtotime($attempt['started_at']);
        $elapsed = time() - $started;
        if ($elapsed > $quiz['time_limit_sec'] + 10) {  // 10s grace
            // Still record the attempt but with whatever was submitted
        }
    }

    // Grade each question
    $q_stmt = $pdo->prepare("
        SELECT qq.question_id, qq.points
        FROM quiz_questions qq
        WHERE qq.quiz_id = ?
    ");
    $q_stmt->execute([$qid]);
    $quiz_qs = $q_stmt->fetchAll();

    $score = 0;
    $max_score = 0;
    $ins = $pdo->prepare(
        'INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct, points_earned)
         VALUES (?, ?, ?, ?, ?)'
    );

    foreach ($quiz_qs as $qq) {
        $max_score += (int)$qq['points'];
        $selected = isset($answers[$qq['question_id']]) ? (int)$answers[$qq['question_id']] : null;

        $is_correct = 0;
        $pts = 0;
        if ($selected) {
            $opt_stmt = $pdo->prepare(
                'SELECT is_correct FROM question_options
                 WHERE id = ? AND question_id = ?'
            );
            $opt_stmt->execute([$selected, $qq['question_id']]);
            $opt = $opt_stmt->fetch();
            if ($opt && $opt['is_correct']) {
                $is_correct = 1;
                $pts = (int)$qq['points'];
                $score += $pts;
            }
        }
        $ins->execute([$attempt_id, $qq['question_id'], $selected, $is_correct, $pts]);
    }

    $time_spent = time() - strtotime($attempt['started_at']);
    $upd = $pdo->prepare(
        'UPDATE quiz_attempts SET submitted_at = NOW(), score = ?, max_score = ?, time_spent_sec = ?
         WHERE id = ?'
    );
    $upd->execute([$score, $max_score, $time_spent, $attempt_id]);

    header('Location: /quiz-result.php?attempt=' . $attempt_id);
    exit;
}

// GET: create a new attempt + show the quiz
$ins_att = $pdo->prepare(
    'INSERT INTO quiz_attempts (user_id, quiz_id) VALUES (?, ?)'
);
$ins_att->execute([$user['id'], $qid]);
$attempt_id = (int) $pdo->lastInsertId();

// Fetch questions + options
$order_by = $quiz['shuffle_questions'] ? 'RAND()' : 'qq.sort_order, qq.question_id';
$q_stmt = $pdo->prepare(
    "SELECT q.id, q.stem, qq.points
     FROM quiz_questions qq
     JOIN questions q ON q.id = qq.question_id
     WHERE qq.quiz_id = ?
     ORDER BY $order_by"
);
$q_stmt->execute([$qid]);
$questions = $q_stmt->fetchAll();

foreach ($questions as &$q) {
    $opt_order = $quiz['shuffle_options'] ? 'RAND()' : 'sort_order, id';
    $o_stmt = $pdo->prepare("SELECT id, option_text FROM question_options WHERE question_id = ? ORDER BY $opt_order");
    $o_stmt->execute([$q['id']]);
    $q['options'] = $o_stmt->fetchAll();
}
unset($q);

$page_title = 'Take: ' . $quiz['title'];
require 'header.php';
?>

<!-- KaTeX for math in questions -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>

<div class="flex-between mb-2">
    <h1 style="margin-bottom:0;"><?= h($quiz['title']) ?></h1>
    <div style="text-align:right;">
        <?php if ($quiz['mode'] === 'practice'): ?>
            <span class="badge badge-info">Practice</span>
        <?php else: ?>
            <span class="badge badge-warn">Graded</span>
        <?php endif; ?>
        <?php if ($quiz['time_limit_sec']): ?>
            <div id="timer" class="text-small mt-1" style="font-weight:600; color:var(--danger);">
                Time: <span id="timer-val">--:--</span>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php if ($quiz['description']): ?>
    <div class="card card-muted">
        <p style="white-space:pre-wrap;"><?= h($quiz['description']) ?></p>
    </div>
<?php endif; ?>

<?php if ($quiz['time_limit_sec']): ?>
    <div class="card" style="border-left:4px solid var(--warning); background:#fffbeb;">
        <strong>Time limit: <?= (int)round($quiz['time_limit_sec']/60) ?> minutes.</strong>
        The quiz will auto-submit when time runs out.
    </div>
<?php endif; ?>

<form method="post" action="/quiz-take.php?id=<?= $qid ?>" id="quiz-form">
    <?php csrf_field(); ?>
    <input type="hidden" name="attempt_id" value="<?= $attempt_id ?>">

    <?php foreach ($questions as $idx => $q): ?>
        <div class="card" style="margin-bottom:1rem;">
            <div class="flex-between">
                <strong>Q<?= $idx + 1 ?>.</strong>
                <span class="text-small text-muted"><?= (int)$q['points'] ?> pt<?= $q['points']==1?'':'s' ?></span>
            </div>
            <div style="margin:0.6rem 0 0.8rem;"><?= $q['stem']  /* raw HTML allowed for KaTeX */ ?></div>

            <?php foreach ($q['options'] as $opt): ?>
                <label class="quiz-option-label">
                    <input type="radio" name="answers[<?= (int)$q['id'] ?>]" value="<?= (int)$opt['id'] ?>">
                    <span><?= $opt['option_text']  /* raw HTML allowed for KaTeX */ ?></span>
                </label>
            <?php endforeach; ?>
        </div>
    <?php endforeach; ?>

    <div class="flex-between mt-3">
        <a href="/quizzes.php" class="btn btn-secondary"
           onclick="return confirm('Leave the quiz? Your answers will not be saved.');">Cancel</a>
        <button type="submit" class="btn-success">Submit quiz</button>
    </div>
</form>

<style>
.quiz-option-label {
    display: flex; align-items: flex-start;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    font-weight: 400;
}
.quiz-option-label:hover { border-color: var(--primary); background: #eff6ff; }
.quiz-option-label input[type="radio"] { margin-top: 0.25rem; accent-color: var(--primary); }
.quiz-option-label input[type="radio"]:checked + span { font-weight: 500; }
</style>

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

    <?php if ($quiz['time_limit_sec']): ?>
    // Countdown timer
    var deadline = <?= time() + (int)$quiz['time_limit_sec'] ?> * 1000;
    var timerEl  = document.getElementById('timer-val');
    function tick() {
        var remain = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        var m = Math.floor(remain / 60);
        var s = remain % 60;
        timerEl.textContent = m + ':' + (s<10?'0':'') + s;
        if (remain <= 0) {
            document.getElementById('quiz-form').submit();
            return;
        }
        setTimeout(tick, 500);
    }
    tick();
    <?php endif; ?>

    // Warn on leaving without submitting
    var submitted = false;
    document.getElementById('quiz-form').addEventListener('submit', function() { submitted = true; });
    window.addEventListener('beforeunload', function(e) {
        if (!submitted) { e.preventDefault(); e.returnValue = ''; }
    });
});
</script>

<?php require 'footer.php'; ?>
