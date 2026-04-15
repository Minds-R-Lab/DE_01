<?php
require_once __DIR__ . '/../auth.php';
require_instructor();

$aid = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM assignments WHERE id = ?');
$stmt->execute([$aid]);
$assignment = $stmt->fetch();
if (!$assignment) { http_response_code(404); die('Assignment not found.'); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    if (!empty($_POST['delete'])) {
        // Delete submissions files + rows, then delete assignment
        $subs = db()->prepare('SELECT file_path FROM submissions WHERE assignment_id = ?');
        $subs->execute([$aid]);
        foreach ($subs->fetchAll() as $s) {
            if (!empty($s['file_path']) && is_file($s['file_path'])) @unlink($s['file_path']);
        }
        db()->prepare('DELETE FROM assignments WHERE id = ?')->execute([$aid]);
        flash('Assignment deleted.', 'success');
        header('Location: index.php');
        exit;
    }

    $title       = trim($_POST['title'] ?? '');
    $desc        = trim($_POST['description'] ?? '');
    $due         = $_POST['due_date'] ?? '';
    $max_points  = (int) ($_POST['max_points'] ?? 100);
    $is_pub      = !empty($_POST['publish']) ? 1 : 0;

    $errors = [];
    if ($title === '') $errors[] = 'Title is required.';
    if (strtotime($due) === false) $errors[] = 'Valid due date is required.';
    if ($max_points < 1) $errors[] = 'Max points must be a positive integer.';

    if (!$errors) {
        $upd = db()->prepare(
            'UPDATE assignments
             SET title=?, description=?, due_date=?, max_points=?, is_published=?
             WHERE id=?'
        );
        $upd->execute([$title, $desc ?: null, date('Y-m-d H:i:s', strtotime($due)),
                       $max_points, $is_pub, $aid]);
        flash('Assignment updated.', 'success');
        header('Location: index.php');
        exit;
    } else {
        foreach ($errors as $e) flash($e, 'error');
        // Re-fetch with form values
        $assignment['title'] = $title;
        $assignment['description'] = $desc;
        $assignment['due_date'] = $due;
        $assignment['max_points'] = $max_points;
        $assignment['is_published'] = $is_pub;
    }
}

$due_val = date('Y-m-d\TH:i', strtotime($assignment['due_date']));
$page_title = 'Edit: ' . $assignment['title'];
require __DIR__ . '/../header.php';
?>

<p class="text-small"><a href="index.php">&larr; Back to instructor dashboard</a></p>

<h1>Edit assignment</h1>

<div class="card">
    <form method="post" action="edit-assignment.php?id=<?= (int)$aid ?>">
        <?php csrf_field(); ?>

        <label for="title">Title</label>
        <input type="text" id="title" name="title" required maxlength="255"
               value="<?= h($assignment['title']) ?>">

        <label for="description">Description</label>
        <textarea id="description" name="description" rows="6"><?= h($assignment['description'] ?? '') ?></textarea>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div>
                <label for="due_date">Due date &amp; time</label>
                <input type="datetime-local" id="due_date" name="due_date" required value="<?= h($due_val) ?>">
            </div>
            <div>
                <label for="max_points">Maximum points</label>
                <input type="number" id="max_points" name="max_points" required min="1" max="10000" value="<?= (int)$assignment['max_points'] ?>">
            </div>
        </div>

        <label style="display:flex; align-items:center; gap:0.5rem; font-weight:500;">
            <input type="checkbox" name="publish" value="1" style="width:auto;" <?= $assignment['is_published'] ? 'checked' : '' ?>>
            Published (visible to students)
        </label>

        <button type="submit">Save changes</button>
        <a class="btn btn-secondary" href="index.php">Cancel</a>
    </form>
</div>

<div class="card" style="border-color: var(--danger);">
    <h3 style="color:var(--danger);">Danger zone</h3>
    <p class="text-small">Deleting an assignment permanently removes the assignment, all its submissions, and uploaded files.</p>
    <form method="post" action="edit-assignment.php?id=<?= (int)$aid ?>" onsubmit="return confirm('Really delete this assignment and ALL its submissions? This cannot be undone.');">
        <?php csrf_field(); ?>
        <input type="hidden" name="delete" value="1">
        <button type="submit" class="btn-danger">Delete assignment</button>
    </form>
</div>

<?php require __DIR__ . '/../footer.php'; ?>
