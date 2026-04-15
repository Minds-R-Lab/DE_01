<?php
// Expect $page_title to be set by the caller; fall back to site name.
$__title = $page_title ?? SITE_NAME;
$__user  = is_logged_in() ? current_user() : null;
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= h($__title) ?> &mdash; <?= h(SITE_NAME) ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="topnav">
    <div class="container">
        <div class="brand"><a href="<?= h(SITE_URL) ?>" style="color:inherit;"><?= h(SITE_NAME) ?></a></div>
        <ul>
            <li><a href="<?= h(COURSE_URL) ?>">&larr; Course Site</a></li>
            <?php if ($__user): ?>
                <li><a href="dashboard.php">Dashboard</a></li>
                <?php if (in_array($__user['role'], ['instructor','admin'], true)): ?>
                    <li><a href="instructor/index.php">Instructor</a></li>
                <?php endif; ?>
                <li style="padding-left:0.5rem; color:#94a3b8;">|</li>
                <li style="color:var(--text-muted); padding:0.45rem 0;">
                    <?= h($__user['full_name']) ?>
                </li>
                <li><a href="logout.php">Logout</a></li>
            <?php else: ?>
                <li><a href="login.php">Login</a></li>
                <?php if (ALLOW_SELF_REGISTRATION): ?>
                    <li><a href="register.php">Register</a></li>
                <?php endif; ?>
            <?php endif; ?>
        </ul>
    </div>
</nav>
<main>
<?php render_flashes(); ?>
