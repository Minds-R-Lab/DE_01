<?php
require_once __DIR__ . '/../auth.php';
require_instructor();
$pdo  = db();
$user = current_user();
$qid  = (int) ($_GET['id'] ?? 0);

// Load existing quiz, or set up empty defaults for a new one
if ($qid) {
    $stmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
    $stmt->execute([$qid]);
    $quiz = $stmt->fetch();
    if (!$quiz) { http_response_code(404); die('Quiz not found.'); }
} else {
    $quiz = [
        'id' => 0, 'title' => '', 'description' => '',
        'mode' => 'graded', 'time_limit_sec' => null, 'due_date' => null,
        'is_published' => 0, 'shuffle_questions' => 0, 'shuffle_options' => 0,
        'max_attempts' => 1,
    ];
}

// ==== Handle POST (save metadata, add/remove questions, delete quiz) ====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    if (!empty($_POST['delete']) && $qid) {
        $pdo->prepare('DELETE FROM quizzes WHERE id = ?')->execute([$qid]);
        flash('Quiz deleted.', 'success');
        header('Location: /instructor/quizzes.php');
        exit;
    }

    if (!empty($_POST['remove_question']) && $qid) {
        $pdo->prepare('DELETE FROM quiz_questions WHERE quiz_id = ? AND question_id = ?')
            ->execute([$qid, (int)$_POST['remove_question']]);
        flash('Question removed from quiz.', 'success');
        header('Location: /instructor/quiz-edit.php?id=' . $qid);
        exit;
    }

    if (!empty($_POST['add_questions']) && $qid && !empty($_POST['question_ids'])) {
        $order_start = (int) $pdo->prepare('SELECT COALESCE(MAX(sort_order),0) FROM quiz_questions WHERE quiz_id = ?')
                                 ->fetchAll()[0] ?? 0;
        $order = 1;
        $q_max = $pdo->prepare('SELECT COALESCE(MAX(sort_order),0) FROM quiz_questions WHERE quiz_id = ?');
        $q_max->execute([$qid]);
        $order = ((int)$q_max->fetchColumn()) + 1;
        $ins = $pdo->prepare('INSERT IGNORE INTO quiz_questions (quiz_id, question_id, sort_order, points) VALUES (?, ?, ?, 1)');
        foreach ((array)$_POST['question_ids'] as $qidq) {
            $ins->execute([$qid, (int)$qidq, $order++]);
        }
        flash('Questions added.', 'success');
        header('Location: /instructor/quiz-edit.php?id=' . $qid);
        exit;
    }

    // Save metadata
    $title = trim($_POST['title'] ?? '');
    $desc  = trim($_POST['description'] ?? '');
    $mode  = in_array($_POST['mode'] ?? '', ['practice','graded'], true) ? $_POST['mode'] : 'graded';
    $time_limit_min = (int) ($_POST['time_limit_min'] ?? 0);
    $time_limit_sec = $time_limit_min > 0 ? $time_limit_min * 60 : null;
    $due = trim($_POST['due_date'] ?? '');
    $due_sql = $due ? date('Y-m-d H:i:s', strtotime($due)) : null;
    $is_pub = !empty($_POST['is_published']) ? 1 : 0;
    $shuffle_q = !empty($_POST['shuffle_questions']) ? 1 : 0;
    $shuffle_o = !empty($_POST['shuffle_options'])   ? 1 : 0;
    $max_att = (int) ($_POST['max_attempts'] ?? 1);

    if ($title === '') { flash('Title is required.', 'error'); }
    else {
        if ($qid) {
            $upd = $pdo->prepare(
                'UPDATE quizzes SET title=?, description=?, mode=?, time_limit_sec=?,
                    due_date=?, is_published=?, shuffle_questions=?, shuffle_options=?, max_attempts=?
                 WHERE id=?'
            );
            $upd->execute([$title, $desc ?: null, $mode, $time_limit_sec, $due_sql,
                           $is_pub, $shuffle_q, $shuffle_o, $max_att, $qid]);
            flash('Quiz updated.', 'success');
            header('Location: /instructor/quiz-edit.php?id=' . $qid);
        } else {
            $ins = $pdo->prepare(
                'INSERT INTO quizzes (title, description, mode, time_limit_sec, due_date,
                    is_published, shuffle_questions, shuffle_options, max_attempts, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $ins->execute([$title, $desc ?: null, $mode, $time_limit_sec, $due_sql,
                           $is_pub, $shuffle_q, $shuffle_o, $max_att, $user['id']]);
            $new_id = (int) $pdo->lastInsertId();
            flash('Quiz created. Now add some questions.', 'success');
            header('Location: /instructor/quiz-edit.php?id=' . $new_id);
        }
        exit;
    }
}

// ==== Render ====
$time_limit_min = $quiz['time_limit_sec'] ? (int)round($quiz['time_limit_sec']/60) : '';
$due_val = $quiz['due_date'] ? date('Y-m-d\TH:i', strtotime($quiz['due_date'])) : '';

// Current questions in this quiz
$in_quiz = [];
if ($qid) {
    $s = $pdo->prepare("
        SELECT q.id, q.stem, q.topic, q.chapter, qq.sort_order, qq.points
        FROM quiz_questions qq JOIN questions q ON q.id = qq.question_id
        WHERE qq.quiz_id = ? ORDER BY qq.sort_order, qq.question_id
    ");
    $s->execute([$qid]);
    $in_quiz = $s->fetchAll();
}

// Questions available to add (not already in this quiz)
$available = [];
if ($qid) {
    $s2 = $pdo->prepare("
        SELECT id, stem, topic, chapter, difficulty
        FROM questions
        WHERE id NOT IN (SELECT question_id FROM quiz_questions WHERE quiz_id = ?)
        ORDER BY chapter, topic, id
    ");
    $s2->execute([$qid]);
    $available = $s2->fetchAll();
}

$page_title = $qid ? 'Edit: ' . $quiz['title'] : 'New quiz';
require __DIR__ . '/../header.php';
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>

<p class="text-small"><a href="/instructor/quizzes.php">&larr; All quizzes</a></p>

<h1><?= $qid ? 'Edit quiz' : 'Create a new quiz' ?></h1>

<div class="card">
    <form method="post" action="/instructor/quiz-edit.php<?= $qid ? '?id='.$qid : '' ?>">
        <?php csrf_field(); ?>

        <label for="title">Title</label>
        <input type="text" id="title" name="title" required maxlength="255" value="<?= h($quiz['title']) ?>">

        <label for="description">Description <span class="text-muted">(optional)</span></label>
        <textarea id="description" name="description" rows="3"><?= h($quiz['description']) ?></textarea>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
            <div>
                <label for="mode">Mode</label>
                <select id="mode" name="mode">
                    <option value="graded"   <?= $quiz['mode']==='graded'?'selected':'' ?>>Graded (counts toward grade)</option>
                    <option value="practice" <?= $quiz['mode']==='practice'?'selected':'' ?>>Practice (unlimited, for self-study)</option>
                </select>
            </div>
            <div>
                <label for="time_limit_min">Time limit (min) <span class="text-muted">0 = no limit</span></label>
                <input type="number" id="time_limit_min" name="time_limit_min" min="0" max="600"
                       value="<?= h((string)$time_limit_min) ?>">
            </div>
            <div>
                <label for="max_attempts">Max attempts <span class="text-muted">0 = unlimited</span></label>
                <input type="number" id="max_attempts" name="max_attempts" min="0" max="99"
                       value="<?= (int)$quiz['max_attempts'] ?>">
            </div>
        </div>

        <label for="due_date">Due date &amp; time <span class="text-muted">(optional)</span></label>
        <input type="datetime-local" id="due_date" name="due_date" value="<?= h($due_val) ?>">

        <div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin:0.5rem 0 1rem;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:500;">
                <input type="checkbox" name="is_published" value="1" style="width:auto;" <?= $quiz['is_published']?'checked':'' ?>>
                Published (visible to students)
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:500;">
                <input type="checkbox" name="shuffle_questions" value="1" style="width:auto;" <?= $quiz['shuffle_questions']?'checked':'' ?>>
                Shuffle questions
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:500;">
                <input type="checkbox" name="shuffle_options" value="1" style="width:auto;" <?= $quiz['shuffle_options']?'checked':'' ?>>
                Shuffle options
            </label>
        </div>

        <button type="submit"><?= $qid ? 'Save changes' : 'Create quiz' ?></button>
        <a class="btn btn-secondary" href="/instructor/quizzes.php">Cancel</a>
    </form>
</div>

<?php if ($qid): ?>

    <h2>Questions in this quiz (<?= count($in_quiz) ?>)</h2>

    <?php if (!$in_quiz): ?>
        <div class="card card-muted"><p>No questions yet. Add some from the bank below.</p></div>
    <?php else: ?>
        <?php foreach ($in_quiz as $i => $r): ?>
            <div class="card" style="display:flex; gap:1rem; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1;">
                    <strong>Q<?= $i+1 ?>.</strong>
                    <?php if ($r['chapter']): ?><span class="badge badge-info"><?= h($r['chapter']) ?></span><?php endif; ?>
                    <?php if ($r['topic']): ?><span class="badge badge-info"><?= h($r['topic']) ?></span><?php endif; ?>
                    <div style="margin-top:0.4rem;"><?= $r['stem'] ?></div>
                </div>
                <form method="post" action="/instructor/quiz-edit.php?id=<?= $qid ?>" onsubmit="return confirm('Remove this question from the quiz?');">
                    <?php csrf_field(); ?>
                    <input type="hidden" name="remove_question" value="<?= (int)$r['id'] ?>">
                    <button type="submit" class="btn btn-small btn-danger">Remove</button>
                </form>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>

    <h2>Add questions from the bank</h2>
    <?php if (!$available): ?>
        <div class="card card-muted">
            <p>No more questions available in the bank. <a href="/instructor/questions.php">Create new ones</a>.</p>
        </div>
    <?php else: ?>
        <form method="post" action="/instructor/quiz-edit.php?id=<?= $qid ?>">
            <?php csrf_field(); ?>
            <input type="hidden" name="add_questions" value="1">
            <div class="card">
                <?php foreach ($available as $q): ?>
                    <label class="flex-between" style="border-bottom:1px solid #f1f5f9; padding:0.5rem 0; gap:0.5rem; font-weight:400;">
                        <div style="display:flex; gap:0.5rem; align-items:flex-start; flex:1;">
                            <input type="checkbox" name="question_ids[]" value="<?= (int)$q['id'] ?>" style="width:auto; margin-top:0.3rem;">
                            <div>
                                <?php if ($q['chapter']): ?><span class="badge badge-info"><?= h($q['chapter']) ?></span><?php endif; ?>
                                <?php if ($q['topic']): ?><span class="badge badge-info"><?= h($q['topic']) ?></span><?php endif; ?>
                                <div><?= $q['stem'] ?></div>
                            </div>
                        </div>
                    </label>
                <?php endforeach; ?>
                <div class="mt-2">
                    <button type="submit">Add selected to quiz</button>
                </div>
            </div>
        </form>
    <?php endif; ?>

    <div class="card" style="border-color:var(--danger); margin-top:2rem;">
        <h3 style="color:var(--danger);">Danger zone</h3>
        <p class="text-small">Deleting this quiz removes it and all student attempts. Cannot be undone.</p>
        <form method="post" action="/instructor/quiz-edit.php?id=<?= $qid ?>"
              onsubmit="return confirm('Really delete this quiz and ALL attempts?');">
            <?php csrf_field(); ?>
            <input type="hidden" name="delete" value="1">
            <button type="submit" class="btn-danger">Delete quiz</button>
        </form>
    </div>

<?php endif; ?>

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

<?php require __DIR__ . '/../footer.php'; ?>
