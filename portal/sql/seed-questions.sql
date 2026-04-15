-- ============================================================
-- DE Course - Seed Questions
-- Auto-generated from chapter HTML files. Safe to re-run if the
-- database is fresh; re-running on a populated DB will duplicate rows.
-- ============================================================

START TRANSACTION;

SET @instr := (SELECT id FROM users WHERE role='instructor' ORDER BY id LIMIT 1);
SET @instr := COALESCE(@instr, 1);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which of the following is a Bernoulli equation?', 'All are Bernoulli equations. (a) is linear (n=0), but (b) and (c) are nonlinear with n=2.', 'Bernoulli', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} + 2xy = e^x\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} + xy = xy^2\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = x + y^2\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'All of the above', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For the equation \\(\\displaystyle \\frac{dy}{dx} + 3y = 2y^4\\), what is the correct substitution?', 'Correct! With n=4, v = y^(1-4) = y^(-3).', 'Bernoulli', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y^{-3}\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y^{-4}\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y^{4}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y^{3}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('After the substitution in Q2, what is the resulting linear equation in v?', 'Correct! Multiply by -(1-4)=-(-3)=3: 3(dv/dx) + 3(3)v = 3(2), so dv/dx - 9v = -6.', 'Bernoulli', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dv}{dx} - 9v = -6\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dv}{dx} + 9v = 6\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dv}{dx} - 3v = -2\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dv}{dx} + 3v = 2\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve \\(\\displaystyle \\frac{dy}{dx} - y = -y^2\\). What is the general solution?', 'Correct! v=1/(1-e^x), but v=y^(-1), so y=1/(1+Ce^(-x)) or 1/(Ce^x-1) depending on constant handling.', 'Bernoulli', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = \\frac{1}{1 + Ce^x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = \\frac{1}{Ce^x - 1}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = 1 + Ce^x\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = Ce^x\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What are the equilibrium solutions of \\(\\displaystyle \\frac{dy}{dx} + 2y = 5y^3\\)?', 'Correct! y=0 and y=±√(2/5) from 2y = 5y³ when dy/dx=0.', 'Bernoulli', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = 0, y = \\pm\\sqrt{2/5}\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = 0\\) only', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = \\pm 1\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = 0, y = 2/5\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve \\(\\displaystyle \\frac{dy}{dx} + y = y^2\\) with \\(y(0) = 2\\). Find \\(y(x)\\).', 'Correct! v(0)=1/2, v=1+Ce^x with C=-1/2 gives v=(1-e^x)/2, so y=2/(1-e^x).', 'Bernoulli', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = \\frac{1}{1 - e^x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = \\frac{2}{2 - e^x}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = \\frac{1}{e^x}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle y = 2e^x\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which of the following is a first-order <strong>homogeneous</strong> equation?', 'Correct! Both numerator (x+y) and denominator (x-y) are homogeneous of degree 1, so the right-hand side depends only on y/x. The other options have terms of mixed or no homogeneous structure.', 'Homogeneous', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = \\frac{x + y}{x - y}\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = x^2 + y\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = \\sin(x + y)\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = e^{x}\\,y\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For a first-order homogeneous equation \\(\\dfrac{dy}{dx} = F(y/x)\\), what substitution converts it to a separable equation?', 'Correct! Setting v = y/x (so y = vx) is the standard substitution that always reduces a homogeneous equation to separable form.', 'Homogeneous', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y/x\\), so \\(y = vx\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = xy\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y - x\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(v = y^{1-n}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('If \\(y = vx\\) where \\(v = v(x)\\), what is \\(\\dfrac{dy}{dx}\\)?', 'Correct! Differentiating y = vx using the product rule (treating v as a function of x): dy/dx = v·1 + x·dv/dx = v + x dv/dx.', 'Homogeneous', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = v\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = v + x\\,\\frac{dv}{dx}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = x\\,\\frac{dv}{dx}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\displaystyle \\frac{dy}{dx} = \\frac{dv}{dx}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Find the general solution of \\(\\displaystyle \\frac{dy}{dx} = \\frac{y}{x} + 1\\).', 'Correct! With v = y/x, we get v + x·v\\', 'Homogeneous', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = x\\bigl(\\ln|x| + C\\bigr)\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = \\ln|x| + C\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = Cx\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = x + C\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve \\(xy'' = y + x\\) with \\(y(1) = 2\\). What is \\(y(e)\\)?', 'Correct! From Example 5\\', 'Homogeneous', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(e\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(2e\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(3e\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(e + 2\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('The general solution of \\(\\displaystyle \\frac{dy}{dx} = \\frac{x^2 + y^2}{xy}\\) is:', 'Correct! With v = y/x: x·v\\', 'Homogeneous', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y^2 = x^2\\bigl(2\\ln|x| + C\\bigr)\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = x\\ln|x|\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y^2 = 2\\ln|x| + C\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(y = Cx^2\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which of the following is in standard form \\(y'' + P(x)y = Q(x)\\)?', NULL, 'Linear', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(2y'' + 4y = 8x\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y'' + 3y = \\sin(x)\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y'' = 5y - x^2\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(yy'' + y = x\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What is the integrating factor for \\(y'' + 5y = 10\\)?', NULL, 'Linear', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = 5x\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = e^{5x}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = e^{-5x}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = 5e^{x}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Find the general solution of \\(y'' + y = e^{-x}\\).', NULL, 'Linear', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{-x} + Ce^{x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = xe^{x} + C\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (x + C)e^{-x}\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{-x} + C\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve \\(y'' - y = 2\\), \\(y(0) = 5\\). What is \\(y(x)\\)?', NULL, 'Linear', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = -2 + 3e^{x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = 2 + 3e^{-x}\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = -2 + 7e^{x}\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = -2 + 5e^{x}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For the equation \\(y'' + \\frac{2}{x}y = x^3\\), what is \\(\\mu(x)\\)?', NULL, 'Linear', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = e^{2x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = 2\\ln(x)\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = x^2\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\mu = \\frac{1}{x^2}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For \\(y'' + 4y = 20\\) with any initial condition, what is \\(\\displaystyle\\lim_{x\\to\\infty} y(x)\\)?', NULL, 'Linear', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(0\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(5\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(20\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(\\infty\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which equation is separable?', 'Correct! $\\frac{dy}{dx} = xy$ factors as $f(x) \\cdot g(y)$ where $f(x) = x$ and $g(y) = y$.', 'Separable', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\frac{dy}{dx} = x + y$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\frac{dy}{dx} = xy$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\frac{dy}{dx} = x^2 + y^2$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\frac{dy}{dx} = x + y^2$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For $\\frac{dy}{dx} = 3x^2 y$, what is the correct separation?', 'Correct! Dividing by $y$ and multiplying by $dx$ gives $\\frac{dy}{y} = 3x^2\\,dx$.', 'Separable', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\int y\\,dy = \\int 3x^2\\,dx$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\int \\frac{dy}{y} = \\int 3x^2\\,dx$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\int y\\,dy = \\int x^2\\,dx$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\int 3y\\,dy = \\int x^2\\,dx$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve $\\frac{dy}{dx} = y$ with $y(0) = 5$', 'Correct! $\\int \\frac{dy}{y} = \\int dx$ gives $\\ln|y| = x + C$, so $y = Ae^x$. With $y(0) = 5$, we get $A = 5$.', 'Separable', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = 5e^x$', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = e^{5x}$', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = 5e^{-x}$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = 5 + e^x$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What are the equilibrium solutions of $\\frac{dy}{dx} = y(1-y)$?', 'Correct! Equilibrium solutions satisfy $g(y) = y(1-y) = 0$, giving $y = 0$ and $y = 1$.', 'Separable', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Only $y = 0$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = 0$ and $y = 1$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Only $y = 1$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = 0$, $y = 1$, and $y = -1$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve $\\frac{dy}{dx} = \\frac{x}{y}$ (general solution)', 'Correct! Separating: $y\\,dy = x\\,dx$. Integrating: $\\frac{y^2}{2} = \\frac{x^2}{2} + K$, which gives $y^2 - x^2 = C$ (hyperbolas).', 'Separable', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = \\frac{x^2}{2} + C$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$x^2 + y^2 = C$', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y = \\sqrt{x^2 + C}$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$y^2 - x^2 = C$', 1, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For $\\frac{dy}{dx} = y^2$ with $y(0) = 1$, at what $x$ does the solution blow up?', 'Correct! Separating: $\\frac{dy}{y^2} = dx$. Integrating: $-\\frac{1}{y} = x + C$. With $y(0) = 1$: $C = -1$. So $y = \\frac{1}{1-x}$, which blows up at $x = 1$.', 'Separable', 'ch1', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$x = 0$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$x = 1$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$x = \\frac{1}{2}$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$x = -1$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Find the general solution to \\(x^2 y'''' + 5xy'' + 4y = 0\\):', NULL, 'Euler', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1 x^{-1} + C_2 x^{-4}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = x^{-2}(C_1 + C_2 \\ln x)\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1 x^2 + C_2 x^4\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (C_1 + C_2 x)\\ln x\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For the Euler equation \\(2x^2 y'''' - 3xy'' + 2y = 0\\), what is the indicial equation?', NULL, 'Euler', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(2r^2 - 3r + 2 = 0\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(2r^2 + 5r + 2 = 0\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(2r^2 - 5r + 2 = 0\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(r^2 - 5r + 2 = 0\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('The Euler equation \\(x^2 y'''' + xy'' + 4y = 0\\) has indicial \\(r^2 + 4 = 0\\). What is the general solution?', NULL, 'Euler', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1 x^{2i} + C_2 x^{-2i}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1 \\cos(2\\ln x) + C_2 \\sin(2\\ln x)\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{2x}(C_1 \\cos x + C_2 \\sin x)\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (C_1 + C_2 x)e^{2x}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For the equation \\(x^2 y'''' - xy'' + y = 0\\) with known solution \\(y_1 = x\\), if you assume \\(y = ux\\), what equation do you get for \\(u''\\) after substitution?', NULL, 'Euler', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(xu'''' - 2u'' = 0\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(x u'''' + u'' = 0\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(u'''' = \\frac{u''}{x}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(x^2 u'''' + 2u'' = 0\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('When an Euler equation has a repeated root \\(r = r_0\\), the general solution is:', NULL, 'Euler', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1 e^{r_0 x} + C_2 x e^{r_0 x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = x^{r_0}(C_1 + C_2 \\ln x)\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1 x^{r_0} + C_2 x^{2r_0}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (C_1 + C_2 x) x^{r_0}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What is the characteristic equation for \\(y'''' + 5y'' - 6y = 0\\)?', NULL, 'Homogeneous Const', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(r + 5r - 6 = 0\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(r^2 + 5r - 6 = 0\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(r^2 + 5 - 6 = 0\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(5r - 6 = 0\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What type of roots does the characteristic equation \\(r^2 - 4r + 4 = 0\\) have?', NULL, 'Homogeneous Const', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; Two distinct real roots', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; One repeated real root', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; Two complex conjugate roots', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; One real and one complex root', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What is the general solution of \\(y'''' + 4y = 0\\)?', NULL, 'Homogeneous Const', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1\\cos(2x) + C_2\\sin(2x)\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1\\,e^{2x} + C_2\\,e^{-2x}\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (C_1 + C_2 x)e^{2x}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{2x}(C_1\\cos(2x) + C_2\\sin(2x))\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('If the characteristic equation has roots \\(r = 3 \\pm 2i\\), what is the solution form?', NULL, 'Homogeneous Const', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1\\,e^{3x} + C_2\\,e^{2ix}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{3x}(C_1\\cos(2x) + C_2\\sin(2x))\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = C_1\\cos(3x) + C_2\\sin(2x)\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{3x + 2ix}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve \\(y'''' + 4y'' + 4y = 0\\), \\(y(0) = 1\\), \\(y''(0) = 0\\). What is \\(y(x)\\)?', NULL, 'Homogeneous Const', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{-2x}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = e^{-2x} + x e^{-2x}\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (1 + 2x)e^{-2x}\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y = (1 - 2x)e^{-2x}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For \\(y'''' + 4y = g(t)\\) with \\(y_1 = \\cos(2t)\\) and \\(y_2 = \\sin(2t)\\), what is \\(W(y_1, y_2)\\)?', NULL, 'Variation', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(W = 0\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(W = 2\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(W = 4\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(W = \\cos(2t) + \\sin(2t)\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which equation is in standard form?', NULL, 'Variation', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(2y'''' + 8y = \\sin(t)\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y'''' + 4y = \\sec(t)\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y'''' + 3y'' + 2y - 5 = 0\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y'''' - 2y = t \\cdot y''\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which forcing function would make undetermined coefficients difficult or impossible?', NULL, 'Variation', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(g(t) = t^2\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(g(t) = e^{2t}\\cos(t)\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(g(t) = \\sec(t)\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(g(t) = e^t\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For \\(y'''' + 6y'' + 9y = g(t)\\), what is the complementary solution \\(y_c\\)?', NULL, 'Variation', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y_c = C_1 e^{-3t} + C_2 e^{3t}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y_c = (C_1 + C_2 t)e^{-3t}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y_c = C_1\\cos(3t) + C_2\\sin(3t)\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; \\(y_c = C_1 e^{-3t}\\cos(t) + C_2 e^{-3t}\\sin(t)\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('The fundamental idea of variation of parameters is to replace the constants \\(C_1, C_2\\) in \\(y_c = C_1 y_1 + C_2 y_2\\) with what?', NULL, 'Variation', 'ch2', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; The Wronskian \\(W(y_1, y_2)\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; Unknown functions \\(u_1(t), u_2(t)\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; The forcing function \\(g(t)\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '&nbsp; The derivatives \\(y_1'', y_2''\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What is \\(\\mathcal{L}^{-1}\\left\\{\\frac{3}{s+4}\\right\\}\\)?', NULL, 'Inverse', 'ch3', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(3e^{-4t}\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(e^{4t}\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(3e^{4t}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(e^{-4t}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For \\(F(s) = \\frac{1}{(s+1)(s+3)}\\), what is the partial fraction form?', NULL, 'Inverse', 'ch3', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{1}{s+1} + \\frac{1}{s+3}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{0.5}{s+1} - \\frac{0.5}{s+3}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{0.5}{s+1} + \\frac{0.5}{s+3}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{1}{(s+1)^2}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For \\(F(s) = \\frac{2s+3}{s^2+6s+13}\\), what is the first step?', NULL, 'Inverse', 'ch3', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Complete the square: \\((s+3)^2 + 4\\)', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Use Heaviside''s method directly', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Factor \\(s^2+6s+13\\) into linear terms', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Divide numerator by denominator', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Using Heaviside''s method for \\(F(s) = \\frac{s}{(s-1)(s+2)}\\), what is \\(A\\) (coefficient of \\(\\frac{1}{s-1}\\))?', NULL, 'Inverse', 'ch3', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{2}{3}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(-\\frac{1}{3}\\)', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{1}{3}\\)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(1\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('A system with poles at \\(s = -2 \\pm 3j\\) will exhibit...', NULL, 'Inverse', 'ch3', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Monotonic growth', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Damped oscillations (decaying)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Undamped oscillations', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Exponential growth', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('What is \\(\\mathcal{L}^{-1}\\left\\{\\frac{1}{(s+2)^3}\\right\\}\\)?', NULL, 'Inverse', 'ch3', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(e^{-2t}\\)', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{1}{2}t^2 e^{-2t}\\)', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(t e^{-2t}\\)', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '\\(\\frac{1}{2}e^{-2t}\\)', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Which equation is the heat equation?', 'Correct! The heat equation is $u_t = K u_{xx}$ &mdash; first-order in time, second-order in space.', 'Pde Practice', 'ch6', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\dfrac{\\partial^2 u}{\\partial t^2} = c^2 \\dfrac{\\partial^2 u}{\\partial x^2}$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\dfrac{\\partial u}{\\partial t} = K \\dfrac{\\partial^2 u}{\\partial x^2}$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\dfrac{\\partial^2 u}{\\partial x^2} + \\dfrac{\\partial^2 u}{\\partial y^2} = 0$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$\\dfrac{\\partial u}{\\partial t} + u\\dfrac{\\partial u}{\\partial x} = 0$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For the heat equation on $[0, L]$ with <em>homogeneous Dirichlet</em> BCs, which three-case outcome holds?', 'Correct! Cases $\\lambda &lt; 0$ and $\\lambda = 0$ both force the trivial solution. Only $\\lambda &gt; 0$ with $\\sin(\\alpha L) = 0$ produces the family $\\sin(m\\pi x/L)$.', 'Pde Practice', 'ch6', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Only $\\lambda &lt; 0$ gives non-trivial solutions', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Only $\\lambda &gt; 0$ gives non-trivial solutions; $\\lambda_m = (m\\pi/L)^2$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Both $\\lambda = 0$ and $\\lambda &gt; 0$ give non-trivial solutions', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'All three cases produce non-trivial solutions', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('Solve $u_t = 7u_{xx}$ on $[0,\\pi]$ with $u(0,t)=u(\\pi,t)=0$ and $u(x,0) = 3\\sin(2x) - 6\\sin(5x)$.', 'Correct! With $L = \\pi$, the decay rate of mode $m$ is $K m^2 = 7 m^2$. So mode 2 decays at rate $28$ and mode 5 at rate $175$.', 'Pde Practice', 'ch6', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$u = 3e^{-14t}\\sin(2x) - 6e^{-35t}\\sin(5x)$', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$u = 3e^{-28t}\\sin(2x) - 6e^{-175t}\\sin(5x)$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$u = 3\\sin(2x) - 6\\sin(5x)$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$u = 3e^{-7t}\\sin(2x) - 6e^{-7t}\\sin(5x)$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('For non-homogeneous Dirichlet BCs $u(0,t) = T_1$, $u(L,t) = T_2$, the steady-state is:', 'Correct! $V$ satisfies $V''''(x) = 0$, $V(0) = T_1$, $V(L) = T_2$, giving a linear interpolation.', 'Pde Practice', 'ch6', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$V(x) = T_1 + \\dfrac{T_2 - T_1}{L}\\,x$', 1, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$V(x) = T_1 e^{-x}$', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$V(x) = \\dfrac{T_1 + T_2}{2}$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, '$V(x) = T_1\\cos(x) + T_2\\sin(x)$', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('With <em>Neumann</em> BCs ($u_x(0,t) = u_x(L,t) = 0$), how does the $\\lambda = 0$ case behave?', 'Correct! For Neumann BCs, $\\lambda = 0$ is non-trivial: $P(x) = C_1 x + C_2$ with $P''(0) = P''(L) = 0$ gives $C_1 = 0$ and leaves $C_2$ free. This produces the constant (DC) mode which conserves the spatial average forever.', 'Pde Practice', 'ch6', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Only the trivial solution', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Gives a non-trivial constant eigenfunction $P_0 = 1$', 1, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Gives $P(x) = x$', 0, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Gives the same eigenfunctions as Dirichlet', 0, 3);

INSERT INTO questions (stem, explanation, topic, chapter, difficulty, created_by) VALUES ('The wave equation $u_{tt} = a^2 u_{xx}$ differs from the heat equation because its temporal solution:', 'Correct! The temporal ODE $Q'''' + \\omega^2 Q = 0$ has oscillatory solutions $A\\cos(\\omega t) + B\\sin(\\omega t)$. Energy is conserved.', 'Pde Practice', 'ch6', 'medium', @instr);
SET @qid := LAST_INSERT_ID();
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Decays exponentially', 0, 0);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Grows exponentially', 0, 1);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Oscillates (contains $\\cos$ and $\\sin$ in $t$)', 1, 2);
INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (@qid, 'Is a polynomial in $t$', 0, 3);

COMMIT;
