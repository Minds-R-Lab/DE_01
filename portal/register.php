<?php
require_once 'auth.php';

if (!ALLOW_SELF_REGISTRATION) {
    flash('Self-registration is disabled. Please contact the instructor.', 'error');
    header('Location: login.php');
    exit;
}
if (is_logged_in()) {
    header('Location: dashboard.php');
    exit;
}

$full_name_val = $email_val = $student_id_val = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $full_name  = trim($_POST['full_name']  ?? '');
    $email      = trim($_POST['email']      ?? '');
    $student_id = trim($_POST['student_id'] ?? '');
    $password   = (string) ($_POST['password']   ?? '');
    $password2  = (string) ($_POST['password2']  ?? '');

    $full_name_val  = $full_name;
    $email_val      = $email;
    $student_id_val = $student_id;

    $errors = [];
    if ($full_name === '') $errors[] = 'Full name is required.';
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Please enter a valid email address.';
    if (strlen($password) < 8) $errors[] = 'Password must be at least 8 characters.';
    if ($password !== $password2) $errors[] = 'The two passwords do not match.';

    // Optional domain restriction
    $allowed = ALLOWED_EMAIL_DOMAINS;
    if (!empty($allowed)) {
        $domain = strtolower(substr(strrchr($email, '@'), 1));
        if (!in_array($domain, $allowed, true)) {
            $errors[] = 'Registration is restricted to: ' . implode(', ', $allowed);
        }
    }

    if (!$errors) {
        // Check for existing email
        $stmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors[] = 'An account with that email already exists. Try logging in.';
        }
    }

    if ($errors) {
        foreach ($errors as $e) flash($e, 'error');
    } else {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins = db()->prepare(
            'INSERT INTO users (email, password_hash, full_name, student_id, role)
             VALUES (?, ?, ?, ?, "student")'
        );
        $ins->execute([$email, $hash, $full_name, $student_id ?: null]);
        $new_id = (int) db()->lastInsertId();
        do_login($new_id);
        flash('Welcome, ' . $full_name . '! Your account has been created.', 'success');
        header('Location: dashboard.php');
        exit;
    }
}

$page_title = 'Register';
require 'header.php';
?>

<div style="max-width:500px; margin:1.5rem auto;">
    <div class="card">
        <h1>Create an account</h1>
        <p class="text-muted mb-2">Register to submit homework and receive grades.</p>

        <form method="post" action="register.php">
            <?php csrf_field(); ?>

            <label for="full_name">Full name</label>
            <input type="text" id="full_name" name="full_name" required autofocus
                   value="<?= h($full_name_val) ?>">

            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autocomplete="email"
                   value="<?= h($email_val) ?>">
            <?php if (!empty(ALLOWED_EMAIL_DOMAINS)): ?>
                <small class="hint">
                    Allowed domains: <?= h(implode(', ', ALLOWED_EMAIL_DOMAINS)) ?>
                </small>
            <?php endif; ?>

            <label for="student_id">Student ID <span class="text-muted">(optional)</span></label>
            <input type="text" id="student_id" name="student_id"
                   value="<?= h($student_id_val) ?>">

            <label for="password">Password</label>
            <input type="password" id="password" name="password" required
                   minlength="8" autocomplete="new-password">
            <small class="hint">At least 8 characters.</small>

            <label for="password2">Confirm password</label>
            <input type="password" id="password2" name="password2" required
                   minlength="8" autocomplete="new-password">

            <button type="submit">Create account</button>
        </form>

        <p class="mt-2 text-small text-muted">
            Already have an account? <a href="login.php">Log in</a>.
        </p>
    </div>
</div>

<?php require 'footer.php'; ?>
