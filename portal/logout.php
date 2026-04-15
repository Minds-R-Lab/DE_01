<?php
require_once 'auth.php';
do_logout();
session_start();  // fresh session so flash works
flash('You have been logged out.', 'info');
header('Location: login.php');
exit;
