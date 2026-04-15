<?php
require_once __DIR__ . '/../auth.php';
require_instructor();
$pdo = db();

$quizzes = $pdo->query("
    SELECT q.id, q.title, q.mode, q.time_limit_sec, q.due_date, q.is_published,
           (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS n_questions,
           (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id AND a.submitted_at IS NOT NULL) AS n_attempts
    FROM quizzes q
    ORDER BY q.created_at DESC
")->fetchAll();

$page_title = 'Quizzes (instructor)';
require __DIR__ . '/../header.php';
?>

<p class="text-small"><a href="/instructor/index.php">&larr; Back to instructor dashboard</a></p>

<div class="flex-between mb-2">
    <h1 style="margin:0;">Quizzes &amp; Exams</h1>
    <a class="btn" href="/instructor/quiz-edit.php">+ New quiz</a>
</div>

<?php if (!$quizzes): ?>
    <div class="card card-muted">
        <p>No quizzes yet. <a href="/instructor/quiz-edit.php">Create your first one</a>, then add questions from the question bank.</p>
        <p class="mt-1"><a href="/instructor/questions.php">Manage question bank &rarr;</a></p>
    </div>
<?php else: ?>
    <table class="data">
        <thead>
            <tr>
                <th>Title</th>
                <th>Mode</th>
                <th>Questions</th>
                <th>Due</th>
                <th>Attempts</th>
                <th>Status</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($quizzes as $q): ?>
            <tr>
                <td><strong><?= h($q['title']) ?></strong></td>
                <td>
                    <?php if ($q['mode']==='practice'): ?>
                        <span class="badge badge-info">Practice</span>
                    <?php else: ?>
                        <span class="badge badge-warn">Graded</span>
                    <?php endif; ?>
                </td>
                <td><?= (int)$q['n_questions'] ?></td>
                <td><?= $q['due_date'] ? h(date('M j, g:i A', strtotime($q['due_date']))) : '<span class="text-muted">—</span>' ?></td>
                <td><?= (int)$q['n_attempts'] ?></td>
                <td>
                    <?php if ($q['is_published']): ?>
                        <span class="badge badge-success">Published</span>
                    <?php else: ?>
                        <span class="badge badge-warn">Draft</span>
                    <?php endif; ?>
                </td>
                <td>
                    <a class="btn btn-small" href="/instructor/quiz-results.php?id=<?= (int)$q['id'] ?>">Results</a>
                    <a class="btn btn-small btn-secondary" href="/instructor/quiz-edit.php?id=<?= (int)$q['id'] ?>">Edit</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<div class="mt-3">
    <a class="btn btn-secondary" href="/instructor/questions.php">Manage Question Bank &rarr;</a>
</div>

<?php require __DIR__ . '/../footer.php'; ?>
