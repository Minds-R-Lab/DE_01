<?php
require_once 'auth.php';

if (is_logged_in()) {
    header('Location: dashboard.php');
    exit;
}

$email_val = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $email    = trim($_POST['email']    ?? '');
    $password = (string) ($_POST['password'] ?? '');
    $email_val = $email;

    if ($email === '' || $password === '') {
        flash('Please enter both your email and password.', 'error');
    } else {
        $stmt = db()->prepare('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if ($row && password_verify($password, $row['password_hash'])) {
            do_login((int)$row['id']);
            flash('Welcome back!', 'success');
            header('Location: dashboard.php');
            exit;
        }
        // Use generic wording so we don't reveal whether the email exists.
        flash('Incorrect email or password. Please try again.', 'error');
    }
}

$page_title = 'Log in';
require 'header.php';
?>

<div style="max-width:440px; margin:2rem auto;">
    <div class="card">
        <h1>Log in</h1>
        <p class="text-muted mb-2">Welcome back. Enter your credentials to continue.</p>

        <form method="post" action="login.php">
            <?php csrf_field(); ?>

            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autofocus
                   value="<?= h($email_val) ?>" autocomplete="email">

            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">

            <button type="submit">Log in</button>
        </form>

        <?php if (ALLOW_SELF_REGISTRATION): ?>
            <p class="mt-2 text-small text-muted">
                Don't have an account yet? <a href="register.php">Create one</a>.
            </p>
        <?php endif; ?>
    </div>
</div>

<?php require 'footer.php'; ?>
