# Deploying the Student Portal to cPanel

End state: the portal is live at **https://portal.mmabrok.com** and you can log in as the instructor to create assignments.

Follow these steps in order. Nothing here requires command-line access — all can be done from the cPanel web UI.

---

## 1. Create the subdomain `portal.mmabrok.com`

1. In cPanel, open **Subdomains**.
2. Subdomain: `portal`
3. Domain: `mmabrok.com`
4. Document Root: cPanel will suggest `public_html/portal` — leave it as is.
5. Click **Create**.

Now `portal.mmabrok.com` exists and points to `/public_html/portal/` on the server.

## 2. Enable HTTPS for the subdomain

1. In cPanel, open **SSL/TLS Status** (or **SSL/TLS Management**).
2. Tick `portal.mmabrok.com` in the list and click **Run AutoSSL**.
3. Wait 2–5 minutes. The padlock should go green.

If AutoSSL isn't available, use **Let's Encrypt** in the SSL/TLS area — same idea.

## 3. Create the MySQL database

1. In cPanel, open **MySQL Databases** (or **MySQL Database Wizard** for a guided flow).
2. **Create a new database**: name it `deportal` (cPanel will prefix your username, e.g. `mmabrok_deportal`).
3. **Create a new user**: name it `deportal` (again, prefixed). Pick a strong password and **save it somewhere safe** — you'll need it in step 5.
4. **Add user to database**: select `mmabrok_deportal` as DB and `mmabrok_deportal` as user, and grant **ALL PRIVILEGES**.

## 4. Import the schema

1. Open **phpMyAdmin** from cPanel.
2. Click the `mmabrok_deportal` database on the left.
3. Click **Import** in the top bar.
4. Choose the file `portal/sql/schema.sql` (download it from the repo or edit via cPanel File Manager).
5. Click **Import**.

You should see `Import has been successfully finished`. Four tables exist now: `users`, `assignments`, `submissions`, `announcements`. The `users` table already contains one row — your instructor account.

## 5. Upload the portal files

Two options:

### Option A — Direct upload via cPanel File Manager (simplest)

1. Open **File Manager** in cPanel.
2. Navigate to `public_html/portal/`.
3. Upload the *contents* of the repo's `portal/` folder (everything except `config.example.php`, which becomes `config.php` in the next step).
4. Make sure the structure looks like:

    ```
    public_html/portal/
    ├── .htaccess
    ├── auth.php
    ├── db.php
    ├── dashboard.php
    ├── ...
    ├── instructor/
    │   └── ...
    ├── sql/
    │   └── schema.sql
    └── uploads/
        └── .htaccess
    ```

### Option B — Git (cleanest, lets you `git pull` updates later)

If your cPanel has **Git Version Control**, you can clone the repository into a path and use a deploy script. Ask in cPanel → Git Version Control. For the MVP, Option A is fine.

## 6. Create the live `config.php`

1. In the File Manager, open `public_html/portal/config.example.php`.
2. Use **Save As** → rename the copy to `config.php`.
3. Open `config.php` and fill in the four database lines:

    ```php
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'mmabrok_deportal');     // <-- your actual DB name
    define('DB_USER', 'mmabrok_deportal');     // <-- your actual DB user
    define('DB_PASS', 'THE-PASSWORD-YOU-SAVED'); // <-- from step 3
    ```

4. Change `SESSION_SECRET` to a long random string. Any 32+ random chars will do. You can use [this generator](https://1password.com/password-generator/) or just mash the keyboard.
5. Confirm the other settings (`SITE_URL`, `COURSE_URL`) match your domain.
6. Save.

## 7. Make `uploads/` writable

1. In File Manager, right-click `public_html/portal/uploads/` → **Change Permissions** → set to `755` (or `775` if cPanel warns).
2. If file uploads fail later with a permissions error, try `777` temporarily to confirm that's the cause, then ask your host what the recommended permission is.

## 8. Log in for the first time

1. Visit https://portal.mmabrok.com.
2. Click **Log in**.
3. Email: `m.a.mabrok@gmail.com`
4. Password: `change-me-now-please`
5. You'll land on the student dashboard. Open the **Instructor** link in the nav.

## 9. Change your password IMMEDIATELY

The initial password is public (it's in `schema.sql`).

Open **phpMyAdmin** → `users` table → find your row → **Edit**. In the `password_hash` column, paste a new hash generated from one of these options:

- **Easiest:** visit <https://bcrypt-generator.com/>, enter your new password, copy the `$2y$...` hash, paste into `password_hash`, click **Save**.
- Or run this in any PHP playground: `echo password_hash('YOUR-NEW-PASSWORD', PASSWORD_BCRYPT);`

## 10. (Optional) Restrict registration to QU emails

In `config.php`, set:

```php
define('ALLOWED_EMAIL_DOMAINS', ['qu.edu.qa', 'student.qu.edu.qa']);
```

Save. Now only `@qu.edu.qa` emails can register.

---

## Testing checklist

- [ ] https://portal.mmabrok.com loads the login page (no PHP errors visible)
- [ ] You can log in as the instructor
- [ ] You can create a test assignment under Instructor → New assignment
- [ ] Register a second account (as a test "student" — use a different email)
- [ ] Log in as the student → the assignment appears → upload any small PDF
- [ ] Log back in as instructor → Instructor → Submissions → you see the uploaded file
- [ ] Click **Grade** → enter a grade + feedback → save
- [ ] Log in as the student → grade and feedback appear

If all 7 boxes tick, you're live.

## Backups

The database holds all user info, grades, and feedback. Back it up at least weekly:

- cPanel → **Backup** → **Download a MySQL Database Backup** → pick `mmabrok_deportal`.
- Also back up `public_html/portal/uploads/` (the submitted files) if you need to preserve them.

## When something goes wrong

- **Blank page** → temporarily set `define('DEBUG', true);` in `config.php`, reload. You'll see the real error. **Change it back to `false` before class uses the portal.**
- **"Database connection failed"** → DB credentials are wrong, DB user lacks permissions, or the DB host isn't `localhost` (rare; check cPanel).
- **"File upload failed"** → `uploads/` permissions, or the file is larger than your host's `upload_max_filesize` (check `php.ini` settings in cPanel → **Select PHP Version** → **Options**).
- **Sessions not persisting** → check that the domain in `SITE_URL` matches exactly what you type in the browser.
