<?php
require_once 'auth.php';
require_login();

$user = current_user();
$aid  = (int) ($_GET['id'] ?? 0);

$stmt = db()->prepare('SELECT * FROM assignments WHERE id = ? AND is_published = 1');
$stmt->execute([$aid]);
$assignment = $stmt->fetch();
if (!$assignment) {
    http_response_code(404);
    die('Assignment not found.');
}

// Existing submission (if any)
$sub_stmt = db()->prepare('SELECT * FROM submissions WHERE user_id = ? AND assignment_id = ?');
$sub_stmt->execute([$user['id'], $aid]);
$submission = $sub_stmt->fetch();

// Handle submission POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $now = new DateTime();
    $due = new DateTime($assignment['due_date']);

    $notes = trim($_POST['notes'] ?? '');

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        flash('No file uploaded, or the upload failed. Please select a file and try again.', 'error');
    } else {
        $f = $_FILES['file'];

        if ($f['size'] > UPLOAD_MAX_BYTES) {
            flash('File too large. Max size is ' . number_format(UPLOAD_MAX_BYTES/1024/1024, 1) . ' MB.', 'error');
        } else {
            $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, UPLOAD_ALLOWED_EXT, true)) {
                flash('File type ".' . h($ext) . '" is not allowed. Allowed: ' . implode(', ', UPLOAD_ALLOWED_EXT), 'error');
            } else {
                // Ensure uploads dir exists and create a per-assignment/user filename.
                if (!is_dir(UPLOAD_DIR)) { @mkdir(UPLOAD_DIR, 0755, true); }
                $safe_original = preg_replace('/[^A-Za-z0-9._-]+/', '_', $f['name']);
                $stored_name   = 'a' . $aid . '_u' . $user['id'] . '_' . time() . '_' . $safe_original;
                $dest = UPLOAD_DIR . '/' . $stored_name;

                if (!move_uploaded_file($f['tmp_name'], $dest)) {
                    flash('Could not save the uploaded file. Contact the instructor.', 'error');
                } else {
                    // Delete old file if re-submitting
                    if ($submission && !empty($submission['file_path'])) {
                        $old = $submission['file_path'];
                        if (is_file($old)) @unlink($old);
                    }

                    if ($submission) {
                        $u = db()->prepare(
                            'UPDATE submissions
                             SET file_path=?, file_name=?, notes=?, grade=NULL, feedback=NULL, graded_by=NULL, graded_at=NULL
                             WHERE id=?'
                        );
                        $u->execute([$dest, $f['name'], $notes, $submission['id']]);
                    } else {
                        $i = db()->prepare(
                            'INSERT INTO submissions (user_id, assignment_id, file_path, file_name, notes)
                             VALUES (?, ?, ?, ?, ?)'
                        );
                        $i->execute([$user['id'], $aid, $dest, $f['name'], $notes]);
                    }

                    $late_note = ($now > $due) ? ' (submission is past the due date)' : '';
                    flash('Your submission has been received' . $late_note . '.', 'success');
                    header('Location: assignment.php?id=' . $aid);
                    exit;
                }
            }
        }
    }
}

$page_title = $assignment['title'];
require 'header.php';

$due_dt   = new DateTime($assignment['due_date']);
$past_due = (new DateTime()) > $due_dt;
?>

<p class="text-small"><a href="dashboard.php">&larr; Back to dashboard</a></p>

<h1><?= h($assignment['title']) ?></h1>
<p class="text-muted">
    Due <strong><?= h($due_dt->format('l, M j, Y \a\t g:i A')) ?></strong>
    &nbsp;&bull;&nbsp; <?= (int)$assignment['max_points'] ?> points total
    <?php if ($past_due): ?>
        <span class="badge badge-danger">Past due</span>
    <?php endif; ?>
</p>

<?php if ($assignment['description']): ?>
<div class="card">
    <h3>Description</h3>
    <p style="white-space:pre-wrap;"><?= h($assignment['description']) ?></p>
</div>
<?php endif; ?>

<?php if ($submission): ?>
<div class="card card-highlight">
    <h3>Your current submission</h3>
    <p><strong>File:</strong> <?= h($submission['file_name']) ?></p>
    <p><strong>Submitted:</strong> <?= h(date('M j, Y g:i A', strtotime($submission['submitted_at']))) ?></p>
    <?php if ($submission['notes']): ?>
        <p><strong>Your notes:</strong><br><?= nl2br(h($submission['notes'])) ?></p>
    <?php endif; ?>
    <?php if ($submission['grade'] !== null): ?>
        <p>
            <strong>Grade:</strong>
            <span class="badge badge-success">
                <?= h((string)$submission['grade']) ?> / <?= (int)$assignment['max_points'] ?>
            </span>
        </p>
        <?php if ($submission['feedback']): ?>
            <div class="card card-muted mt-1">
                <strong>Instructor feedback</strong>
                <p style="white-space:pre-wrap;"><?= h($submission['feedback']) ?></p>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <p><span class="badge badge-info">Awaiting grading</span></p>
    <?php endif; ?>
</div>
<?php endif; ?>

<div class="card">
    <h3><?= $submission ? 'Re-submit your work' : 'Submit your work' ?></h3>
    <?php if ($submission): ?>
        <p class="text-muted text-small mb-2">
            Uploading a new file will replace your previous submission and clear any existing grade.
        </p>
    <?php endif; ?>

    <form method="post" action="assignment.php?id=<?= (int)$aid ?>" enctype="multipart/form-data">
        <?php csrf_field(); ?>

        <label for="file">File</label>
        <input type="file" id="file" name="file" required>
        <small class="hint">
            Max size: <?= number_format(UPLOAD_MAX_BYTES/1024/1024, 1) ?> MB.
            Allowed: <?= h(implode(', ', UPLOAD_ALLOWED_EXT)) ?>.
        </small>

        <label for="notes">Notes to instructor <span class="text-muted">(optional)</span></label>
        <textarea id="notes" name="notes" placeholder="Any explanation, questions, or context..."></textarea>

        <button type="submit">
            <?= $submission ? 'Replace submission' : 'Submit homework' ?>
        </button>
    </form>
</div>

<?php require 'footer.php'; ?>
