<?php
require_once 'auth.php';
// If logged in, go to dashboard. Otherwise, show the login form.
if (is_logged_in()) {
    header('Location: dashboard.php');
    exit;
}
header('Location: login.php');
exit;
