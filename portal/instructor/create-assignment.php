<?php
require_once __DIR__ . '/../auth.php';
require_instructor();

$user = current_user();

$title_val = $desc_val = '';
$due_val = date('Y-m-d\TH:i', strtotime('+1 week'));
$max_val = 100;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $title      = trim($_POST['title'] ?? '');
    $desc       = trim($_POST['description'] ?? '');
    $due        = $_POST['due_date'] ?? '';
    $max_points = (int) ($_POST['max_points'] ?? 100);
    $publish    = !empty($_POST['publish']);

    $title_val = $title; $desc_val = $desc; $due_val = $due; $max_val = $max_points;

    $errors = [];
    if ($title === '')                      $errors[] = 'Title is required.';
    if ($due === '' || strtotime($due)===false) $errors[] = 'Please choose a valid due date/time.';
    if ($max_points < 1)                    $errors[] = 'Max points must be a positive integer.';

    if (!$errors) {
        $due_sql = date('Y-m-d H:i:s', strtotime($due));
        $ins = db()->prepare(
            'INSERT INTO assignments (title, description, due_date, max_points, created_by, is_published)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $ins->execute([$title, $desc ?: null, $due_sql, $max_points, $user['id'], $publish ? 1 : 0]);
        flash('Assignment "' . $title . '" created.', 'success');
        header('Location: index.php');
        exit;
    } else {
        foreach ($errors as $e) flash($e, 'error');
    }
}

$page_title = 'Create assignment';
require __DIR__ . '/../header.php';
?>

<p class="text-small"><a href="index.php">&larr; Back to instructor dashboard</a></p>

<h1>Create an assignment</h1>

<div class="card">
    <form method="post" action="create-assignment.php">
        <?php csrf_field(); ?>

        <label for="title">Title</label>
        <input type="text" id="title" name="title" required maxlength="255"
               value="<?= h($title_val) ?>"
               placeholder="e.g. Homework 1: Separable Equations">

        <label for="description">Description <span class="text-muted">(optional, supports line breaks)</span></label>
        <textarea id="description" name="description" rows="6"
                  placeholder="Describe the assignment, list problem numbers, or paste a link to a PDF."><?= h($desc_val) ?></textarea>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div>
                <label for="due_date">Due date &amp; time</label>
                <input type="datetime-local" id="due_date" name="due_date" required
                       value="<?= h($due_val) ?>">
            </div>
            <div>
                <label for="max_points">Maximum points</label>
                <input type="number" id="max_points" name="max_points" required min="1" max="10000"
                       value="<?= (int)$max_val ?>">
            </div>
        </div>

        <label style="display:flex; align-items:center; gap:0.5rem; font-weight:500;">
            <input type="checkbox" name="publish" value="1" checked style="width:auto;">
            Publish immediately (students can see and submit)
        </label>
        <small class="hint">Uncheck to save as draft; students won't see it until published.</small>

        <button type="submit">Create assignment</button>
        <a class="btn btn-secondary" href="index.php">Cancel</a>
    </form>
</div>

<?php require __DIR__ . '/../footer.php'; ?>
