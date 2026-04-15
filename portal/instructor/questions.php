<?php
require_once __DIR__ . '/../auth.php';
require_instructor();
$pdo  = db();
$user = current_user();

// Handle: create/update question, delete
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    if (!empty($_POST['delete'])) {
        $pdo->prepare('DELETE FROM questions WHERE id = ?')->execute([(int)$_POST['delete']]);
        flash('Question deleted.', 'success');
        header('Location: /instructor/questions.php');
        exit;
    }

    $qid   = (int) ($_POST['question_id'] ?? 0);
    $stem  = trim($_POST['stem'] ?? '');
    $expl  = trim($_POST['explanation'] ?? '');
    $topic = trim($_POST['topic'] ?? '');
    $chap  = trim($_POST['chapter'] ?? '');
    $diff  = in_array($_POST['difficulty'] ?? '', ['easy','medium','hard'], true) ? $_POST['difficulty'] : 'medium';

    $options = [];
    for ($i = 0; $i < 6; $i++) {
        $text = trim($_POST['opt_text'][$i] ?? '');
        if ($text === '') continue;
        $options[] = [
            'text' => $text,
            'correct' => (isset($_POST['opt_correct']) && (int)$_POST['opt_correct'] === $i) ? 1 : 0,
        ];
    }

    $errs = [];
    if ($stem === '') $errs[] = 'Question text is required.';
    if (count($options) < 2) $errs[] = 'At least 2 options are required.';
    $correct_count = array_sum(array_column($options, 'correct'));
    if ($correct_count !== 1) $errs[] = 'Exactly one option must be marked as correct.';

    if ($errs) {
        foreach ($errs as $e) flash($e, 'error');
    } else {
        if ($qid) {
            $pdo->prepare(
                'UPDATE questions SET stem=?, explanation=?, topic=?, chapter=?, difficulty=? WHERE id=?'
            )->execute([$stem, $expl ?: null, $topic ?: null, $chap ?: null, $diff, $qid]);
            $pdo->prepare('DELETE FROM question_options WHERE question_id = ?')->execute([$qid]);
        } else {
            $pdo->prepare(
                'INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by)
                 VALUES (?, ?, ?, ?, ?, ?)'
            )->execute([$stem, $expl ?: null, $topic ?: null, $chap ?: null, $diff, $user['id']]);
            $qid = (int) $pdo->lastInsertId();
        }
        $ins_opt = $pdo->prepare(
            'INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (?, ?, ?, ?)'
        );
        foreach ($options as $idx => $o) {
            $ins_opt->execute([$qid, $o['text'], $o['correct'], $idx]);
        }
        flash('Question saved.', 'success');
        header('Location: /instructor/questions.php');
        exit;
    }
}

// Load existing question for editing
$edit_id = (int) ($_GET['edit'] ?? 0);
$edit = null;
$edit_opts = [];
if ($edit_id) {
    $s = $pdo->prepare('SELECT * FROM questions WHERE id = ?');
    $s->execute([$edit_id]);
    $edit = $s->fetch();
    if ($edit) {
        $o = $pdo->prepare('SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order');
        $o->execute([$edit_id]);
        $edit_opts = $o->fetchAll();
    }
}

// List all questions
$filter_chap = $_GET['chapter'] ?? '';
$sql = 'SELECT q.*, (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.question_id = q.id) AS in_quizzes FROM questions q';
$params = [];
if ($filter_chap !== '') {
    $sql .= ' WHERE q.chapter = ?';
    $params[] = $filter_chap;
}
$sql .= ' ORDER BY q.chapter, q.topic, q.id';
$s = $pdo->prepare($sql);
$s->execute($params);
$all_questions = $s->fetchAll();

$chapters = $pdo->query("SELECT DISTINCT chapter FROM questions WHERE chapter IS NOT NULL AND chapter <> '' ORDER BY chapter")->fetchAll(PDO::FETCH_COLUMN);

$page_title = 'Question bank';
require __DIR__ . '/../header.php';
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>

<p class="text-small"><a href="/instructor/index.php">&larr; Back to instructor dashboard</a> &bull; <a href="/instructor/quizzes.php">Quizzes</a></p>

<h1>Question bank</h1>
<p class="text-muted">Questions defined here can be added to any quiz. Math is rendered with KaTeX &mdash; write formulas like <code>$x^2 + y^2$</code> or <code>$$\int_0^1 f(x)dx$$</code>.</p>

<!-- Create / Edit form -->
<div class="card">
    <h2 style="margin-top:0;"><?= $edit ? 'Edit question' : 'Add a new question' ?></h2>
    <form method="post" action="/instructor/questions.php">
        <?php csrf_field(); ?>
        <input type="hidden" name="question_id" value="<?= $edit ? (int)$edit['id'] : 0 ?>">

        <label for="stem">Question text <span class="text-muted">(KaTeX OK)</span></label>
        <textarea id="stem" name="stem" rows="3" required><?= h($edit['stem'] ?? '') ?></textarea>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
            <div>
                <label for="chapter">Chapter <span class="text-muted">(e.g. ch1)</span></label>
                <input type="text" id="chapter" name="chapter" maxlength="20" value="<?= h($edit['chapter'] ?? '') ?>">
            </div>
            <div>
                <label for="topic">Topic</label>
                <input type="text" id="topic" name="topic" maxlength="100" value="<?= h($edit['topic'] ?? '') ?>">
            </div>
            <div>
                <label for="difficulty">Difficulty</label>
                <select id="difficulty" name="difficulty">
                    <?php foreach (['easy','medium','hard'] as $d): ?>
                        <option value="<?= $d ?>" <?= ($edit['difficulty'] ?? 'medium')===$d?'selected':'' ?>><?= ucfirst($d) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <label>Options <span class="text-muted">(mark exactly one as correct)</span></label>
        <?php for ($i = 0; $i < 6; $i++):
            $text = $edit_opts[$i]['option_text'] ?? '';
            $is_c = isset($edit_opts[$i]) && $edit_opts[$i]['is_correct'];
            ?>
            <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;">
                <input type="radio" name="opt_correct" value="<?= $i ?>" <?= $is_c?'checked':'' ?>
                       style="width:auto; flex-shrink:0;" title="Mark as correct">
                <input type="text" name="opt_text[<?= $i ?>]" placeholder="Option <?= $i+1 ?><?= $i>=2?' (optional)':'' ?>"
                       value="<?= h($text) ?>" style="margin-bottom:0; flex:1;">
            </div>
        <?php endfor; ?>

        <label for="explanation">Explanation <span class="text-muted">(shown after submission)</span></label>
        <textarea id="explanation" name="explanation" rows="2"><?= h($edit['explanation'] ?? '') ?></textarea>

        <button type="submit"><?= $edit ? 'Save changes' : 'Add question' ?></button>
        <?php if ($edit): ?>
            <a class="btn btn-secondary" href="/instructor/questions.php">Cancel</a>
        <?php endif; ?>
    </form>
</div>

<!-- Filter -->
<div class="flex-between mt-3">
    <h2 style="margin:0;">All questions (<?= count($all_questions) ?>)</h2>
    <?php if ($chapters): ?>
        <form method="get" action="/instructor/questions.php" style="margin:0;">
            <select name="chapter" onchange="this.form.submit()" style="width:auto; margin:0;">
                <option value="">All chapters</option>
                <?php foreach ($chapters as $c): ?>
                    <option value="<?= h($c) ?>" <?= $filter_chap===$c?'selected':'' ?>><?= h($c) ?></option>
                <?php endforeach; ?>
            </select>
        </form>
    <?php endif; ?>
</div>

<?php if (!$all_questions): ?>
    <div class="card card-muted"><p>No questions yet. Use the form above to add your first.</p></div>
<?php else: ?>
    <?php foreach ($all_questions as $q): ?>
        <div class="card" style="display:flex; gap:1rem; justify-content:space-between; align-items:flex-start;">
            <div style="flex:1;">
                <?php if ($q['chapter']): ?><span class="badge badge-info"><?= h($q['chapter']) ?></span><?php endif; ?>
                <?php if ($q['topic']): ?><span class="badge badge-info"><?= h($q['topic']) ?></span><?php endif; ?>
                <span class="badge" style="background:#f1f5f9; color:#334155;"><?= h($q['difficulty']) ?></span>
                <?php if ($q['in_quizzes']>0): ?>
                    <span class="badge badge-success">Used in <?= (int)$q['in_quizzes'] ?> quiz<?= $q['in_quizzes']==1?'':'zes' ?></span>
                <?php endif; ?>
                <div style="margin-top:0.4rem;"><?= $q['stem'] ?></div>
            </div>
            <div style="display:flex; gap:0.4rem; align-items:flex-start;">
                <a class="btn btn-small btn-secondary" href="/instructor/questions.php?edit=<?= (int)$q['id'] ?>">Edit</a>
                <form method="post" action="/instructor/questions.php" onsubmit="return confirm('Delete this question? It will be removed from all quizzes.');" style="margin:0;">
                    <?php csrf_field(); ?>
                    <input type="hidden" name="delete" value="<?= (int)$q['id'] ?>">
                    <button type="submit" class="btn btn-small btn-danger">Delete</button>
                </form>
            </div>
        </div>
    <?php endforeach; ?>
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
