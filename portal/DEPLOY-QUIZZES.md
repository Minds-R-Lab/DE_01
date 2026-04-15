# Deploying the Quiz Engine to the portal

This adds online MCQ quizzes (practice + graded), a question bank, and auto-grading to your existing portal. Builds on top of what you've already deployed — nothing about the existing homework system changes.

## What you get

**For students:**
- A new "Quizzes" link in the nav
- List of published quizzes, colour-coded Practice vs Graded
- Take a quiz: see all questions, pick one option each, submit — grade appears instantly
- Review page shows which questions were correct/wrong, with explanations
- Timer (if the instructor set a time limit) that auto-submits when it hits zero
- Practice mode: unlimited attempts. Graded mode: limited attempts.

**For you:**
- A **Question Bank** page where you edit reusable MCQs (KaTeX math supported)
- A **Quizzes & Exams** dashboard — create quiz → pick questions from the bank → publish
- A **Results** dashboard per quiz — roster of all attempts, average/high/low percentages, click any attempt to see the student's exact answers
- 51 questions **pre-loaded** from your existing chapter quizzes — you can start immediately

## Prerequisites

You should already have:
- The portal running at `https://portal.mmabrok.com`
- Your instructor account working
- Database `mmabrokc_wp344` with tables `users`, `assignments`, `submissions`, `announcements`

If any of those are missing, first finish `DEPLOY.md` then come back here.

---

## Step 1 — Pull the new files

Two options as before:

### Option A — Upload `portal-v2.zip`

1. Download the updated zip (I'll provide a link).
2. cPanel File Manager → `/portal.mmabrok.com/` → **Upload** the zip.
3. Right-click → **Extract**.
4. A new `portal-pkg/` appears. Move everything inside it up one level, overwriting existing files when asked.
5. Delete the leftover `portal-pkg/` and the zip.

### Option B — Add just the new files manually

You need these **new files**:
- `quizzes.php`
- `quiz-take.php`
- `quiz-result.php`
- `instructor/quizzes.php`
- `instructor/quiz-edit.php`
- `instructor/quiz-results.php`
- `instructor/questions.php`
- `sql/quizzes-schema.sql`
- `sql/seed-questions.sql`

And these **modified** files (replace existing):
- `header.php` (adds Quizzes nav link + fixes subdirectory paths)
- `dashboard.php` (adds quick-link buttons)
- `instructor/index.php` (adds Quizzes/Question Bank buttons)

Download each from:
`https://raw.githubusercontent.com/Minds-R-Lab/DE_01/dev-quizzes/portal/<path>`

…and upload via File Manager.

## Step 2 — Import the new tables

phpMyAdmin → click `mmabrokc_wp344` on the left sidebar → **Import** tab → choose file: `portal/sql/quizzes-schema.sql` → **Import**.

You should see success and 6 new tables in the left sidebar:
- `questions`
- `question_options`
- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `quiz_answers`

(The existing `users`, `assignments`, etc. are not touched.)

## Step 3 — Import the seed questions (optional but recommended)

phpMyAdmin → `mmabrokc_wp344` → **Import** tab → choose file: `portal/sql/seed-questions.sql` → **Import**.

This adds ~51 MCQs with 4 options each, extracted from the chapter HTML quizzes on the course website. They're tagged with chapter (`ch1`, `ch2`, `ch3`, `ch6`) and topic so you can filter/find them in the question bank.

You can skip this step and add your own questions by hand via the Question Bank page.

## Step 4 — Fix permissions on new files

Select All in `/portal.mmabrok.com/` → Change Permissions:
- **Recurse into subdirectories** + **Regular Files only** + **0644**

Then again:
- **Recurse into subdirectories** + **Directories only** + **0755**

## Step 5 — Try it

1. Log into the portal as the instructor
2. Click **Instructor** → you should see new "Quizzes & Exams" and "Question Bank" buttons
3. Click **Question Bank** → you should see 51 questions loaded (if you did step 3)
4. Go back → **Quizzes & Exams** → **+ New quiz**
5. Give it a title ("Chapter 1 Practice"), mode: Practice, publish: yes → Create
6. On the edit page, scroll down to **Add questions from the bank** → tick a few → **Add selected to quiz**
7. Log out, log in as a test student → click **Quizzes** in the nav → take the quiz
8. Log back in as instructor → Quizzes → Results → you should see the attempt

## Step 6 — Troubleshoot

Same rules as before: if something breaks, set `DEBUG = true` in `config.php` briefly to see the real error, then turn it back to `false`.

Common issues:
- **"Table 'questions' doesn't exist"** → you haven't run `quizzes-schema.sql` (Step 2)
- **Question bank empty** → you skipped `seed-questions.sql` (Step 3, fine — add your own)
- **KaTeX math shows as `\( \frac{...} \)` literally** → KaTeX is only loaded on quiz pages, not question bank edit; ignore for now, it'll render correctly when students take the quiz
- **Student can't find Quizzes link** → check `header.php` was updated (has the `<li><a href="/quizzes.php">Quizzes</a></li>` line)

## Using the system

### Create your first real graded quiz

1. Build a question set in the Question Bank. Use `\( ... \)` for inline math and `$$ ... $$` for displayed math. KaTeX renders them for students.
2. In Quizzes → New quiz:
   - **Mode:** Graded (counts) or Practice (unlimited retries)
   - **Time limit:** e.g. 30 min. `0` = no limit.
   - **Max attempts:** 1 for an exam, 0 for unlimited practice
   - **Due date:** when the quiz closes for new attempts
   - **Shuffle questions / options:** discourages answer-sharing
   - **Publish:** only tick this when you're ready for students to see it
3. On the edit page, use the **Add questions from the bank** checkbox list to select which questions appear.

### Watch the results come in

Quizzes → Results. You get a roster + average/high/low percentages per quiz. Click any row to see the student's exact answers and correctness per question.

### Build new questions from the existing course site

The Chapter 1 separable-equations page has 6 MCQs. If you wrote those and want to reuse them as a graded quiz:

1. Go to Question Bank → filter by `ch1`
2. Create a new quiz "Separable Equations Quiz"
3. Add the 6 ch1-separable questions
4. Set mode to Graded, time limit 15 min, 1 attempt
5. Publish

You now have a real online exam covering the same material as the practice quiz on the course site.

## What's NOT in this version (possible future work)

- Image uploads in questions (text + KaTeX only for now)
- Free-response / short-answer / numerical questions (MCQ only)
- Question-bank CSV import/export
- Randomised sub-pools ("pick 5 random questions from topic X")
- Per-student override of time limit (accommodations)
- Certificate / PDF of quiz result
- Email notifications when a student submits a graded quiz

Tell me which of these matters most and I'll add it next.
