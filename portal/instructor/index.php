<?php
require_once __DIR__ . '/../auth.php';
require_instructor();

$pdo = db();

// Assignments with submission counts
$assignments = $pdo->query("
    SELECT a.id, a.title, a.due_date, a.max_points, a.is_published,
           COUNT(s.id) AS n_submissions,
           COUNT(CASE WHEN s.grade IS NOT NULL THEN 1 END) AS n_graded
    FROM assignments a
    LEFT JOIN submissions s ON s.assignment_id = a.id
    GROUP BY a.id
    ORDER BY a.due_date DESC
")->fetchAll();

// Total students
$n_students = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();
$n_pending  = (int) $pdo->query("SELECT COUNT(*) FROM submissions WHERE grade IS NULL")->fetchColumn();

$page_title = 'Instructor dashboard';
require __DIR__ . '/../header.php';
?>

<h1>Instructor dashboard</h1>
<p class="text-muted mb-3">Manage assignments, review submissions, and post announcements.</p>

<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;" class="mb-3">
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--primary);"><?= $n_students ?></div>
        <div class="text-muted text-small">Registered students</div>
    </div>
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--accent);"><?= count($assignments) ?></div>
        <div class="text-muted text-small">Assignments</div>
    </div>
    <div class="card text-center">
        <div style="font-size:2rem; font-weight:700; color:var(--warning);"><?= $n_pending ?></div>
        <div class="text-muted text-small">Submissions to grade</div>
    </div>
</div>

<div class="flex-between mb-2">
    <h2 style="margin:0;">Assignments</h2>
    <a class="btn" href="create-assignment.php">+ New assignment</a>
</div>

<?php if (!$assignments): ?>
    <div class="card card-muted">
        <p>No assignments yet. <a href="create-assignment.php">Create your first one</a>.</p>
    </div>
<?php else: ?>
    <table class="data">
        <thead>
            <tr>
                <th>Title</th>
                <th>Due</th>
                <th>Points</th>
                <th>Submissions</th>
                <th>Graded</th>
                <th>Published</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($assignments as $a): ?>
            <tr>
                <td><strong><?= h($a['title']) ?></strong></td>
                <td><?= h(date('M j, Y g:i A', strtotime($a['due_date']))) ?></td>
                <td><?= (int)$a['max_points'] ?></td>
                <td><?= (int)$a['n_submissions'] ?></td>
                <td><?= (int)$a['n_graded'] ?> / <?= (int)$a['n_submissions'] ?></td>
                <td>
                    <?php if ($a['is_published']): ?>
                        <span class="badge badge-success">Yes</span>
                    <?php else: ?>
                        <span class="badge badge-warn">Draft</span>
                    <?php endif; ?>
                </td>
                <td>
                    <a class="btn btn-small" href="submissions.php?assignment=<?= (int)$a['id'] ?>">Submissions</a>
                    <a class="btn btn-small btn-secondary" href="edit-assignment.php?id=<?= (int)$a['id'] ?>">Edit</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

<h2>Announcements</h2>
<form method="post" action="post-announcement.php" class="card">
    <?php csrf_field(); ?>
    <label for="title">Title</label>
    <input type="text" id="title" name="title" required maxlength="255">

    <label for="body">Body <span class="text-muted">(optional)</span></label>
    <textarea id="body" name="body"></textarea>

    <button type="submit">Post announcement</button>
</form>

<?php require __DIR__ . '/../footer.php'; ?>
