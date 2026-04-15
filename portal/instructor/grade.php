<?php
require_once __DIR__ . '/../auth.php';
require_instructor();

$user = current_user();
$sid  = (int) ($_GET['sid'] ?? 0);

$stmt = db()->prepare("
    SELECT s.*, u.full_name, u.email, u.student_id,
           a.title AS assignment_title, a.max_points, a.id AS assignment_id
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = ?
");
$stmt->execute([$sid]);
$row = $stmt->fetch();
if (!$row) { http_response_code(404); die('Submission not found.'); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $grade    = $_POST['grade'] ?? '';
    $feedback = trim($_POST['feedback'] ?? '');

    if ($grade === '' || !is_numeric($grade) || $grade < 0 || $grade > $row['max_points']) {
        flash('Enter a grade between 0 and ' . (int)$row['max_points'] . '.', 'error');
    } else {
        $u = db()->prepare(
            'UPDATE submissions SET grade=?, feedback=?, graded_by=?, graded_at=NOW() WHERE id=?'
        );
        $u->execute([(float)$grade, $feedback ?: null, $user['id'], $sid]);
        flash('Grade saved.', 'success');
        header('Location: submissions.php?assignment=' . (int)$row['assignment_id']);
        exit;
    }
}

$page_title = 'Grade: ' . $row['full_name'];
require __DIR__ . '/../header.php';
?>

<p class="text-small"><a href="submissions.php?assignment=<?= (int)$row['assignment_id'] ?>">&larr; Back to submissions</a></p>

<h1>Grade submission</h1>

<div class="card card-highlight">
    <p><strong>Assignment:</strong> <?= h($row['assignment_title']) ?></p>
    <p><strong>Student:</strong> <?= h($row['full_name']) ?> &mdash; <?= h($row['email']) ?></p>
    <p><strong>Submitted:</strong> <?= h(date('M j, Y g:i A', strtotime($row['submitted_at']))) ?></p>
    <p><strong>File:</strong> <a href="download.php?sid=<?= (int)$sid ?>"><?= h($row['file_name']) ?></a></p>
    <?php if ($row['notes']): ?>
        <p><strong>Student notes:</strong></p>
        <div class="card card-muted" style="margin:0.3rem 0 0;">
            <p style="white-space:pre-wrap;"><?= h($row['notes']) ?></p>
        </div>
    <?php endif; ?>
</div>

<div class="card">
    <form method="post" action="grade.php?sid=<?= (int)$sid ?>">
        <?php csrf_field(); ?>

        <label for="grade">Grade (out of <?= (int)$row['max_points'] ?>)</label>
        <input type="number" id="grade" name="grade" required
               min="0" max="<?= (int)$row['max_points'] ?>" step="0.01"
               value="<?= $row['grade'] !== null ? h((string)$row['grade']) : '' ?>">

        <label for="feedback">Feedback to student <span class="text-muted">(optional)</span></label>
        <textarea id="feedback" name="feedback" rows="6"
                  placeholder="Comments the student will see..."><?= h($row['feedback'] ?? '') ?></textarea>

        <button type="submit">Save grade</button>
        <a class="btn btn-secondary" href="submissions.php?assignment=<?= (int)$row['assignment_id'] ?>">Cancel</a>
    </form>
</div>

<?php require __DIR__ . '/../footer.php'; ?>
