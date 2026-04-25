#!/usr/bin/env node
/**
 * ElevenLabs Audio Generator for Lecture Voiceovers
 * ==================================================
 *
 * Run this script ONCE to generate all audio files.
 * They'll be saved as MP3s in the audio/ folder, then commit them to the repo.
 *
 * Usage:
 *   node generate-audio.js <your-elevenlabs-api-key> [lecture-prefix]
 *
 * Examples:
 *   node generate-audio.js sk_abc123                     # generates all lectures
 *   node generate-audio.js sk_abc123 ch1-separable       # generates only ch1-separable
 *
 * Prerequisites:
 *   - Node.js 18+ (for native fetch)
 *   - ElevenLabs API key (free tier: ~10,000 chars/month at elevenlabs.io)
 */

const fs = require('fs');
const path = require('path');

// ─── CONFIG ───
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel — clear British male
const MODEL_ID = 'eleven_multilingual_v2';
const AUDIO_DIR = path.join(__dirname, 'audio');

// ─── LECTURE NARRATIONS ───
// Add new lectures here. Each key matches the lecture HTML filename (without .html).
const LECTURES = {
  'ch1-separable': [
    // Slide 0: Title
    `Separable Differential Equations. The Separation of Variables Technique. Chapter 1, First-Order ODEs.`,

    // Slide 1: Definition
    `What is a separable equation? A separable differential equation is one where we can put all y terms on one side and all x terms on the other. Formally, a first-order ODE is separable if it can be written as: dy dx equals f of x, times g of y. Equivalently, we rewrite this as: one over g of y, dy, equals f of x, dx. Now the variables are separated — all y terms on the left, all x terms on the right.`,

    // Slide 2: Identifying
    `How do we identify separable equations? The key test is: can you write the right-hand side as a product of a function of x alone, times a function of y alone? For example, dy dx equals x y is separable — it factors as x times y. And dy dx equals e to the power x plus y is also separable, because it equals e to the x, times e to the y. However, dy dx equals x plus y is NOT separable — it's a sum, not a product. And e to the x y is NOT separable either, because the product x y sits inside the exponent and cannot be split.`,

    // Slide 3: Technique
    `Here's the core separation technique. Starting from dy dx equals f of x times g of y: Step 1, divide both sides by g of y, assuming g of y is not zero. This gives one over g of y, times dy dx, equals f of x. Step 2, rewrite in differential form: one over g of y, dy, equals f of x, dx. Step 3, integrate both sides. The integral of one over g of y, dy, equals the integral of f of x, dx, plus C. This is the master formula for solving separable equations.`,

    // Slide 4: 6-Step Method
    `Let's organize this into a complete six-step solution method. Step 1: Write the equation in separable form. Step 2: Separate the variables. Step 3: Integrate both sides. Step 4: Solve for y explicitly, if possible — otherwise, leave the answer in implicit form. Step 5: Apply any given initial conditions to find the constant C. And critically, Step 6: Check for equilibrium solutions by setting g of y equal to zero. These constant solutions can easily be lost during the separation process.`,

    // Slide 5: Example setup
    `Let's work through a complete example. Solve: dy dx equals x y, with the initial condition y of zero equals 2. Steps 1 and 2: Separate the variables. We get dy over y equals x dx. Step 3: Integrate both sides. The integral of dy over y equals the integral of x dx. This gives us: natural log of the absolute value of y, equals x squared over 2, plus C. Step 4: Solve for y. Exponentiating both sides, we get y equals A times e to the x squared over 2, where A is plus or minus e to the C.`,

    // Slide 6: Example final
    `Now we apply the initial condition y of zero equals 2. Substituting into y equals A times e to the x squared over 2: 2 equals A times e to the zero, which means A equals 2. So our particular solution is: y equals 2 e to the x squared over 2. For Step 6, the equilibrium check: g of y equals y, so y equals zero is an equilibrium solution. But our initial condition is y of zero equals 2, which is not zero, so the equilibrium doesn't apply here. The solution is valid for all real values of x — we have global existence.`,

    // Slide 7: Warning
    `An important warning about lost solutions. When we divide by g of y, we assume g of y is not zero. The values where g of y equals zero give equilibrium, or constant, solutions — and these can be completely lost during the separation process. For example, consider dy dx equals y times the quantity 1 minus y. After separating and integrating, we get the general family of logistic curves. But we've missed the constant solutions: y equals 0, and y equals 1, which come from setting g of y equal to zero. Always check for these separately!`,

    // Slide 8: Implicit vs Explicit
    `Sometimes after integration, we can't solve for y explicitly — and that's perfectly fine. An explicit solution writes y directly as a function of x, like y equals 2 e to the x squared over 2. You can plug in any x and immediately get y. An implicit solution is an equation relating x and y together, like y squared plus sine of y equals x cubed plus C. We can't isolate y, but it's still a completely valid solution. To verify an implicit solution, use implicit differentiation: differentiate both sides with respect to x, and confirm you recover the original ODE.`,

    // Slide 9: Takeaways
    `Let's recap the key takeaways. First: recognize separable form. The right-hand side must factor as a function of x, times a function of y. Second: separate, then integrate. Move all y's to one side, all x's to the other, and integrate. Don't forget the plus C! Third: never lose equilibrium solutions. When dividing by g of y, always check g of y equals zero separately. These constant solutions are easy to miss. And finally: always verify your answer by substituting back into the original equation. The complete workflow is: identify it's separable, separate, integrate, solve, and verify.`
  ]

  // ─── CH1-LINEAR: First-Order Linear Differential Equations ───
  'ch1-linear': [
    // Slide 0: Title
    `First-Order Linear Differential Equations. The Integrating Factor Method. Chapter 1, First-Order ODEs.`,

    // Slide 1: Definition
    `What is a linear first-order ODE? A linear equation is one where y and y prime appear only to the first power — no y squared, no sine of y, no y times y prime terms. A first-order linear ODE has the standard form: dy dx plus P of x times y equals Q of x. Here, P of x and Q of x are functions of x alone — they do not depend on y. What makes it linear? Both y and dy dx appear to the first power only. The equation is linear in both the dependent variable and its derivative.`,

    // Slide 2: Integrating Factor Method
    `The Integrating Factor Method. The key insight is to multiply the equation by a special function mu of x, called the integrating factor. The integrating factor formula is: mu of x equals e to the integral of P of x dx. Multiply both sides of the ODE by mu of x. After multiplying by mu and integrating, we get the general solution formula: y of x equals one over mu of x, times the quantity: integral of mu of x times Q of x dx, plus C. This is the master formula for solving linear first-order equations.`,

    // Slide 3: Why It Works
    `Why does the integrating factor work? Let's walk through the derivation in four steps. Step 1: Start with the standard form, dy dx plus P of x times y equals Q of x. Step 2: Multiply both sides by the integrating factor mu of x, which equals e to the integral of P of x dx. This gives mu times dy dx, plus mu times P of x times y, equals mu times Q of x. Step 3: Here's the magic — the left side is exactly the product rule! It equals d dx of mu of x times y. So we have: d dx of the quantity mu times y, equals mu times Q of x. Step 4: Now simply integrate both sides and solve for y. That's the complete derivation!`,

    // Slide 4: 4-Step Method
    `Let's organize this into a complete four-step solution method. Step 1: Write the equation in standard form. Divide by the coefficient of y prime if needed, so that dy dx plus P of x times y equals Q of x. Step 2: Compute the integrating factor, mu of x equals e to the integral of P of x dx. Ignore the plus C in the exponent. Step 3: Apply the formula: y equals one over mu, times the integral of mu times Q dx, plus C. And Step 4: Apply the initial conditions. Use y of x-zero equals y-zero to find the constant C.`,

    // Slide 5: Example Setup
    `Let's work through a complete example. Solve: y prime plus 2 y equals 6, with initial condition y of zero equals 1. Steps 1 and 2: Identify P of x and compute the integrating factor. We have P of x equals 2, and Q of x equals 6. So mu of x equals e to the integral of 2 dx, which is e to the 2x. Step 3: Apply the formula. y equals one over e to the 2x, times the quantity integral of 6 e to the 2x dx, plus C. The integral of 6 e to the 2x dx equals 3 e to the 2x. So y equals e to the negative 2x, times the quantity 3 e to the 2x plus C, which simplifies to: y equals 3 plus C times e to the negative 2x. That's the general solution.`,

    // Slide 6: Example Final
    `Now let's apply the initial condition y of zero equals 1. Substituting x equals zero and y equals 1 into our general solution y equals 3 plus C times e to the negative 2x: 1 equals 3 plus C times e to the zero, which gives 1 equals 3 plus C. Therefore C equals negative 2. Our particular solution is: y equals 3 minus 2 e to the negative 2x. Here's a key observation: as x approaches infinity, e to the negative 2x approaches zero, so y approaches 3. The value y equals 3 is called the equilibrium. All solutions, regardless of initial condition, converge to this equilibrium!`,

    // Slide 7: Variable Coefficients
    `The integrating factor method also works when P of x varies with x. Let's solve x times y prime plus y equals x squared. Step 1: Divide by x to get standard form: y prime plus one over x times y equals x. So P of x equals one over x, and Q of x equals x. Step 2: Compute the integrating factor. Mu of x equals e to the integral of one over x dx, which equals e to the natural log of x, which simplifies to just x. Step 3: Apply the formula. y equals one over x, times the quantity integral of x times x dx plus C. That's one over x, times x cubed over 3 plus C. So the general solution is y equals x squared over 3, plus C over x.`,

    // Slide 8: Common Pitfalls
    `Let's discuss four common pitfalls to avoid. Pitfall 1: The coefficient of y prime is not 1. Always divide first! If your equation is 2 y prime plus 4 y equals 10, divide by 2 to get y prime plus 2 y equals 5 before finding mu. Pitfall 2: Forgetting the integration constant. When computing the integrating factor, ignore the plus C in the exponent. But don't forget C in the final general solution formula! Pitfall 3: Negative P of x leads to exponential growth. If P of x equals negative 3, then mu equals e to the negative 3x. This is correct — it just means solutions grow as x increases. Pitfall 4: Not all integrals have closed forms. If the integral of P of x dx or the integral of mu times Q dx cannot be evaluated, your solution may be left in integral form. That's perfectly fine.`,

    // Slide 9: Key Takeaways
    `Let's recap the key takeaways. First: standard form is essential. Always write as dy dx plus P of x times y equals Q of x, with the coefficient of y prime equal to 1. Second: the integrating factor transforms via the product rule. Multiplying by mu equals e to the integral of P dx makes the left side equal to d dx of mu times y. Third: constant coefficients give equilibrium. For y prime plus a y equals b, where a is a positive constant, the equilibrium is y equals b over a. All solutions converge to it. And fourth: real-world applications abound. Mixing tanks, RC circuits, Newton's cooling law, pharmacokinetics, and population dynamics all use linear ODEs. The complete workflow is: standard form, compute mu, apply the formula, then apply initial conditions.`
  ],

  // ─── CH1-EXACT: Exact Differential Equations ───
  'ch1-exact': [
    // Slide 0: Title
    `Exact Differential Equations. Finding Potential Functions. Chapter 1, First-Order ODEs.`,

    // Slide 1: Definition
    `What is an exact equation? An exact equation is one where we can recognize it as the differential of a potential function. Consider the differential form: M of x y dx plus N of x y dy equals zero. This equation is exact if there exists a function F of x y such that: the partial derivative of F with respect to x equals M, and the partial derivative of F with respect to y equals N. Then the total differential is: dF equals M dx plus N dy equals zero. So the solution is simply F of x y equals C — a family of level curves.`,

    // Slide 2: Test for Exactness
    `How do we test for exactness? The exactness criterion says: M dx plus N dy equals zero is exact if and only if the partial derivative of M with respect to y, equals the partial derivative of N with respect to x. Why? By Clairaut's Theorem on the equality of mixed partial derivatives: the second partial of F with respect to y then x, equals the second partial of F with respect to x then y. If the partial of F with respect to x equals M, then the mixed partial equals the partial of M with respect to y. If the partial of F with respect to y equals N, then the mixed partial equals the partial of N with respect to x. By Clairaut's theorem, these must be equal!`,

    // Slide 3: 7-Step Method
    `Here's the complete seven-step solution method. Step 1: Identify M and N from M dx plus N dy equals zero. Step 2: Check exactness by verifying that the partial of M with respect to y, equals the partial of N with respect to x. Step 3: Integrate M with respect to x to get F equals the integral of M dx, plus g of y. Notice the "constant" of integration is actually a function g of y, since we're integrating with respect to x only. Step 4: Differentiate F with respect to y and compare with N. Step 5: Find g of y by solving for g prime of y from Step 4 and integrating. Step 6: Write the implicit solution F of x y equals C. And Step 7: Apply initial conditions to find the specific value of C.`,

    // Slide 4: Example Setup
    `Let's work through an example. Solve: the quantity 2xy plus 3, dx, plus the quantity x squared plus 4y, dy, equals zero. Step 1: Identify M and N. M equals 2xy plus 3, and N equals x squared plus 4y. Step 2: Check exactness. The partial of M with respect to y equals 2x. The partial of N with respect to x equals 2x. These are equal, so the equation is exact! Step 3: Integrate M with respect to x. F equals the integral of 2xy plus 3 dx, which equals x squared y plus 3x plus g of y.`,

    // Slide 5: Example Solution
    `Continuing the example, we now find the potential function. Step 4: Differentiate F with respect to y and match with N. The partial of F with respect to y equals x squared plus g prime of y. This must equal N, which is x squared plus 4y. Step 5: Solve for g prime of y. We get g prime of y equals 4y. Integrating, g of y equals 2 y squared. Step 6: Write the implicit solution. The solution is: x squared y plus 3x plus 2 y squared equals C. This is our general solution — a family of curves in the x-y plane.`,

    // Slide 6: IVP Example
    `Let's do an initial value problem. Solve: the quantity 2x plus y, dx, plus the quantity x minus 3 y squared, dy, equals zero, with y of 1 equals 2. Quick check: the partial of M with respect to y equals 1, and the partial of N with respect to x equals 1. They match, so it's exact. Step 3: Integrate M with respect to x: F equals x squared plus x y plus g of y. Steps 4 and 5: The partial of F with respect to y equals x plus g prime of y, which must equal N equals x minus 3 y squared. So g prime of y equals negative 3 y squared, giving g of y equals negative y cubed. Step 6: General solution: x squared plus x y minus y cubed equals C. Step 7: Apply the initial condition y of 1 equals 2. Substituting: 1 plus 2 minus 8 equals C, so C equals negative 5. The particular solution is: x squared plus x y minus y cubed equals negative 5.`,

    // Slide 7: Common Pitfalls
    `Here are some common pitfalls to avoid. Mistake 1: Forgetting that g of y is a function. When integrating M with respect to x, the "constant" of integration actually depends on y. It's g of y, not just C. Mistake 2: Skipping the exactness check. Always verify that the partial of M with respect to y equals the partial of N with respect to x before proceeding. If the equation isn't exact, you need a different method — such as integrating factors. Mistake 3: Swapping the partial derivatives. Remember: it's always the partial of M with respect to y equals the partial of N with respect to x. Not the other way around!`,

    // Slide 8: Geometric Insight
    `Let's explore the geometric interpretation. Exact equations connect to conservative vector fields and level curves. The solutions F of x y equals C are level curves of the potential function F. Each curve is a complete member of the solution family. From a vector field perspective, the vector field with components M and N equals the gradient of F — that's the partial of F with respect to x, and the partial of F with respect to y. This means the field is conservative: it's the gradient of a scalar potential function. The key observation is that the gradient vector is always perpendicular to the level curves F of x y equals C. This is why solutions of exact equations are implicit relations, not explicit functions.`,

    // Slide 9: Key Takeaways
    `Let's recap the key takeaways. First: the exactness criterion. Check that the partial of M with respect to y equals the partial of N with respect to x. This comes from Clairaut's theorem on mixed partial derivatives. Second: the solution method. Integrate M with respect to x, find g of y by matching with N, and write F of x y equals C as the implicit solution. Third: solutions are always implicit — they are level curves of the potential function F. Don't try to solve for y explicitly unless it's easy. Fourth: Clairaut's Theorem is the foundation. The equality of mixed partial derivatives underpins everything — it's the bridge between the pair M, N and the potential function F. The complete workflow is: check exactness, find F, write level curves F equals C, and apply initial conditions.`
  ],

  // ─── CH1-NONEXACT: Non-Exact Equations & Integrating Factors ───
  'ch1-nonexact': [
    // Slide 0: Title
    `Non-Exact Equations and Integrating Factors. Making Non-Exact Equations Exact. Chapter 1, First-Order ODEs.`,

    // Slide 1: The Problem
    `When is an equation NOT exact? For the equation M dx plus N dy equals zero, we check: is the partial of M with respect to y equal to the partial of N with respect to x? If they're NOT equal, the equation is not exact — and we can't use the exact equation method directly. But there's a powerful trick: multiply the entire equation by a clever function mu of x y, called an integrating factor. We get: mu times M dx, plus mu times N dy, equals zero. The goal is to choose mu so that the multiplied equation IS exact. That means the partial of mu M with respect to y, must equal the partial of mu N with respect to x.`,

    // Slide 2: Case 1 — μ(x)
    `Case 1: Integrating factor mu of x. If the integrating factor depends only on x, not on y, we have a simple formula. Here's the test: compute one over N, times the quantity partial of M with respect to y, minus the partial of N with respect to x. If this expression depends only on x — call it h of x — then Case 1 applies! The integrating factor is: mu of x equals e to the integral of h of x dx. The key insight is that h of x must have no y terms. If it contains y, then this case doesn't apply and you need to try Case 2.`,

    // Slide 3: Case 2 — μ(y)
    `Case 2: Integrating factor mu of y. If the integrating factor depends only on y, not on x, we have a second formula. Here's the test: compute one over M, times the quantity partial of N with respect to x, minus the partial of M with respect to y. Note the subtraction order is reversed compared to Case 1! If this expression depends only on y — call it k of y — then Case 2 applies! The integrating factor is: mu of y equals e to the integral of k of y dy. Just like Case 1, the function k of y must have no x terms. If it contains x, neither case works and you may need a different approach entirely.`,

    // Slide 4: 6-Step Algorithm
    `Here's the complete six-step integrating factor algorithm. Step 1: Verify that the equation is NOT exact. Check that the partial of M with respect to y does not equal the partial of N with respect to x. Step 2: Try Case 1 — compute one over N times the difference of the partials. If the result depends only on x, compute mu of x. Step 3: If Case 1 fails, try Case 2 — compute one over M times the reverse difference. If the result depends only on y, compute mu of y. Step 4: Multiply the original equation by the integrating factor mu. Step 5: Verify that the multiplied equation is now exact. Check the partials match. Step 6: Solve the now-exact equation using the standard exact equation method to find F of x y equals C.`,

    // Slide 5: Example 1 Setup
    `Let's work through Example 1, which uses Case 1. Solve: the quantity 3xy plus y squared, dx, plus the quantity x squared plus xy, dy, equals zero. Step 1: Check if exact. We have M equals 3xy plus y squared, and N equals x squared plus xy. The partial of M with respect to y is 3x plus 2y. The partial of N with respect to x is 2x plus y. Since 3x plus 2y does not equal 2x plus y, the equation is NOT exact. Step 2: Try Case 1. Compute one over N, times the quantity partial of M with respect to y minus partial of N with respect to x. That's one over x squared plus xy, times 3x plus 2y minus 2x minus y. This simplifies to x plus y, divided by x times x plus y, which equals one over x. Success! h of x equals one over x depends only on x.`,

    // Slide 6: Example 1 Solution
    `Continuing Example 1. Step 3: Compute the integrating factor. Mu of x equals e to the integral of one over x dx, which equals e to the natural log of x, which is simply x. Step 4: Multiply the original equation by mu equals x. We get x times the quantity 3xy plus y squared, dx, plus x times the quantity x squared plus xy, dy, equals zero. This simplifies to: 3 x squared y plus x y squared, dx, plus x cubed plus x squared y, dy, equals zero. Steps 5 and 6: Verify it's now exact and solve. Following the exact equation method, we find the potential function and obtain the solution: x cubed y plus x squared y squared over 2 equals C.`,

    // Slide 7: Example 2 — Case 2
    `Now let's try Example 2, which uses Case 2. Solve: the quantity y squared plus y, dx, minus x, dy, equals zero. Steps 1 and 2: Check Case 1. M equals y squared plus y, and N equals negative x. The partial of M with respect to y is 2y plus 1, and the partial of N with respect to x is negative 1. h of x would be one over negative x, times 2y plus 1 minus negative 1, which gives 2y plus 2 over negative x. This contains y, so Case 1 fails! Step 3: Try Case 2. Compute k of y equals one over M times the quantity partial of N with respect to x minus partial of M with respect to y. That's one over y squared plus y, times negative 1 minus 2y minus 1, which equals negative 2y minus 2 over y times y plus 1, which simplifies to negative 2 over y. Success! This depends only on y. So mu of y equals e to the integral of negative 2 over y dy, which equals e to negative 2 natural log y, which equals one over y squared.`,

    // Slide 8: Tips & Connections
    `Here are some useful tips and deeper connections. First: look for common factors. Before jumping to Case 1 or 2, check if M and N share a common factor. Dividing by it first might reveal hidden structure. Second, an important connection: linear equations are a special case! The standard linear equation dy dx plus P of x times y equals Q of x can be rewritten as: the quantity P of x times y minus Q of x, dx, plus dy, equals zero. The integrating factor mu of x equals e to the integral of P of x dx is exactly what you get from Case 1! Finally, an important note: integrating factors are not unique. Any constant multiple of an integrating factor is also an integrating factor. We usually pick the simplest form.`,

    // Slide 9: Key Takeaways
    `Let's recap the key takeaways. First: try Case 1 first. Compute one over N times the difference of the partials. If it depends only on x, use mu of x equals e to the integral of h of x dx. Second: if Case 1 fails, try Case 2. Compute one over M times the reverse difference. If it depends only on y, use mu of y equals e to the integral of k of y dy. Third: after finding mu, solve as exact. Multiply the equation by mu, then use the exact equation method to find F of x y equals C. Fourth: linear equations are a special case. The standard linear equation integrating factor is exactly Case 1! The two key formulas are: Case 1, mu of x equals e to the integral of one over N times the partial of M with respect to y minus the partial of N with respect to x, dx. And Case 2, mu of y equals e to the integral of one over M times the partial of N with respect to x minus the partial of M with respect to y, dy.`
  ],

  // ─── CH1-HOMOGENEOUS: Homogeneous First-Order Equations ───
  'ch1-homogeneous': [
    // Slide 0: Title
    `Homogeneous First-Order Equations. The v equals y over x Substitution. Chapter 1, First-Order ODEs.`,

    // Slide 1: Definition
    `What is a homogeneous equation? A homogeneous equation has a special property: the right-hand side depends only on the ratio of y to x. Form 1: A first-order ODE is homogeneous if it can be written as dy dx equals F of y over x. Equivalently, Form 2: M of x y dx plus N of x y dy equals zero, where M and N are homogeneous functions of the same degree n. What is a homogeneous function? A function f of x y is homogeneous of degree n if: f of t x, t y equals t to the n, times f of x y, for all t greater than zero. In other words, scaling both inputs by the same factor t multiplies the output by t to the n.`,

    // Slide 2: Identifying Homogeneous Functions
    `How do we identify homogeneous functions? The quick test is: replace x with t x and y with t y. If all t's can be factored out, it's homogeneous. Here are examples of different degrees. Degree 2: x squared plus x y plus y squared. If we substitute, we get t squared times the original — homogeneous of degree 2. Degree 1: the square root of x squared plus y squared. Substituting gives t times the original — degree 1. Degree 0: y over x. Substituting gives t y over t x, which equals y over x — degree zero. The t's cancel completely. The key insight is: if the right-hand side F of y over x is homogeneous of degree zero, the entire equation is homogeneous.`,

    // Slide 3: The v = y/x Substitution
    `Now for the magic substitution: v equals y over x. The key is that this substitution converts a homogeneous equation into a separable equation! Step 1: Substitute v equals y over x, so y equals v x. Step 2: Differentiate using the product rule. dy dx equals d dx of v times x, which gives v plus x times dv dx. Step 3: Substitute into dy dx equals F of v. We get: v plus x times dv dx equals F of v. Step 4: Rearrange to separable form. Moving v to the right side: x times dv dx equals F of v minus v. Separating variables: dv over F of v minus v, equals dx over x. Now it's separable — we can integrate both sides!`,

    // Slide 4: 5-Step Method
    `Here's the complete five-step solution method. Step 1: Verify homogeneity. Confirm that the right-hand side can be written as F of y over x — it depends only on the ratio. Step 2: Substitute y equals v x. Get the equation v plus x dv dx equals F of v. Step 3: Separate and integrate. Integrate dv over F of v minus v equals integral of dx over x, plus C. Step 4: Back-substitute v equals y over x. Express the final solution in terms of x and y — don't leave it in terms of v! And critically, Step 5: Check for singular solutions. Set F of v minus v equals zero. The solutions give v equals some constant v-zero, which corresponds to straight-line solutions y equals v-zero times x.`,

    // Slide 5: Example 1
    `Let's work through Example 1. Solve: dy dx equals x squared plus y squared, all divided by x y. Steps 1 and 2: Rewrite in terms of v. F of y over x equals 1 plus v squared, all over v, where v equals y over x. Step 3: Substitute and get a separable equation. v plus x dv dx equals 1 plus v squared over v. Simplifying: x dv dx equals 1 plus v squared over v, minus v, which equals 1 over v. So v dv equals dx over x. Step 4: Integrate both sides. v squared over 2 equals natural log of the absolute value of x, plus C. Step 5: Back-substitute v equals y over x. We get y squared over x squared, divided by 2, equals natural log of x plus C. Multiplying through: y squared equals x squared times the quantity 2 natural log of x plus 2C.`,

    // Slide 6: Example 2 — IVP
    `Example 2, an initial value problem. Solve: x y prime equals y plus x, with y of 1 equals 1. Steps 1 and 2: Rewrite. dy dx equals y over x plus 1, which equals F of v where F of v equals v plus 1. Step 3: Substitute and separate. v plus x dv dx equals v plus 1. The v's cancel! We get x dv dx equals 1. So dv equals dx over x. Step 4: Integrate. v equals natural log of x plus C. Back-substitute: y over x equals natural log of x plus C, so y equals x times the quantity natural log of x plus C. Now apply the initial condition y of 1 equals 1. Substituting: 1 equals 1 times the quantity natural log of 1 plus C. Since natural log of 1 is zero, C equals 1. The particular solution is: y equals x times the quantity natural log of x plus 1.`,

    // Slide 7: Family of Circles
    `Here's a beautiful geometric example. Solve dy dx equals y squared minus x squared, all divided by 2 x y. After substituting v equals y over x, we get F of v equals v squared minus 1, over 2v. The separable equation becomes: x dv dx equals negative v squared plus 1, over 2v. Separating: 2v over v squared plus 1 dv equals negative dx over x. Integrating: natural log of v squared plus 1 equals negative natural log of x plus a constant. Substituting back and simplifying, we get the elegant solution: x squared plus y squared equals C times x. This is a family of circles passing through the origin! Completing the square gives: x minus C over 2, squared, plus y squared, equals C over 2 squared. Each value of C gives a circle with center on the x-axis.`,

    // Slide 8: Common Mistakes
    `Let's discuss the common pitfalls. Mistake 1: Forgetting the product rule. Since y equals v x, the derivative dy dx equals v plus x dv dx — NOT just dv dx. This is one of the most common errors! Mistake 2: Forgetting back-substitution. After solving for v, always replace v with y over x to express the solution in terms of x and y. Mistake 3: Ignoring singular solutions. When F of v minus v equals zero, we get x dv dx equals zero, which gives v equals a constant. These correspond to straight-line solutions y equals v-zero times x. Always check for these separately! Mistake 4: Forgetting to verify homogeneity first. Before using this method, test whether the right-hand side can actually be written as F of y over x. If not, you need a different approach.`,

    // Slide 9: Key Takeaways
    `Let's recap the key takeaways. First: test for homogeneity. Check if the right-hand side equals F of y over x, depending only on the ratio. If yes, it's homogeneous! Second: the substitution v equals y over x always works. It converts any homogeneous equation into a separable one. This is the power of the method. Third: always check for singular solutions. Setting F of v minus v equals zero gives straight-line solutions y equals v-zero times x. These are easy to miss during the separation process. Fourth: homogeneous equations have a geometric interpretation — the solution curves have a kind of rotational symmetry about the origin, related to the scale invariance of the equation. The complete workflow is: verify homogeneous, substitute v equals y over x, separate, integrate, back-substitute, and check singular solutions.`
  ],

  // ─── CH1-BERNOULLI: Bernoulli Differential Equations ───
  'ch1-bernoulli': [
    // Slide 0: Title
    `Bernoulli Differential Equations. Transforming Nonlinear to Linear. Chapter 1, First-Order ODEs.`,

    // Slide 1: Definition
    `What is a Bernoulli equation? A Bernoulli equation looks almost linear, but it has a nonlinear term y to the n. The standard form is: dy dx plus P of x times y, equals Q of x times y to the n, where n is not equal to zero or one. The y to the n term makes it nonlinear. When n equals zero or n equals one, the equation is already linear and doesn't need the Bernoulli technique. The magic: we will transform this nonlinear equation into a linear equation using a clever substitution!`,

    // Slide 2: The Substitution
    `The magic substitution. To transform a Bernoulli equation into a linear one, we use: v equals y to the power 1 minus n. Differentiate both sides with respect to x: dv dx equals 1 minus n, times y to the negative n, times dy dx. Here's the key manipulation: from the original equation, divide both sides by y to the n. This gives: y to the negative n times dy dx, plus P of x times y to the 1 minus n, equals Q of x. Now multiply through by 1 minus n, and substitute v equals y to the 1 minus n. We get: dv dx plus 1 minus n times P of x times v, equals 1 minus n times Q of x. This is now a first-order LINEAR equation in v! We can solve it using the integrating factor method we already know.`,

    // Slide 3: Special Cases
    `Let's look at how the substitution adapts to different values of n. When n equals 2, the substitution is v equals y to the negative 1, or 1 over y. When n equals 3, v equals y to the negative 2. When n equals negative 1, v equals y squared. And when n equals one-half, v equals y to the one-half, or the square root of y. In each case, the result is a linear equation in the new variable v. The most common case you'll encounter is n equals 2, where v equals 1 over y. This appears in many applications including logistic growth and electrical circuits.`,

    // Slide 4: 4-Step Method
    `Here's the four-step solution method. Step 1: Identify P of x, Q of x, and n. Make sure to normalize first! Divide by the coefficient of dy dx so it equals 1. Step 2: Substitute v equals y to the power 1 minus n. Transform the equation to: dv dx plus 1 minus n times P of x times v, equals 1 minus n times Q of x. Step 3: Solve the resulting linear equation using the integrating factor method. Compute mu equals e to the integral of 1 minus n times P of x dx, and apply the general solution formula. Step 4: Back-substitute to find y. Since v equals y to the 1 minus n, we have y equals v to the power 1 over 1 minus n. Also, always report y equals zero as a singular solution!`,

    // Slide 5: Example 1 — n=2
    `Example 1: Solve dy dx plus y equals y squared. Step 1: Identify the components. P of x equals 1, Q of x equals 1, and n equals 2. Step 2: Substitute v equals y to the negative 1 (since 1 minus n equals negative 1). Dividing the original by y squared and multiplying by negative 1, we get: dv dx minus v equals negative 1. Step 3: Solve this linear equation. The integrating factor is mu equals e to the integral of negative 1 dx, which is e to the negative x. Applying the formula, v equals 1 plus C times e to the x. Step 4: Back-substitute. Since v equals 1 over y, we get: y equals 1 over the quantity 1 plus C times e to the x. And don't forget the singular solution y equals zero.`,

    // Slide 6: Example 2 — IVP
    `Example 2, an initial value problem. Solve: x y prime plus y equals x squared y squared, with y of 1 equals 1. Step 1: Normalize by dividing by x. We get y prime plus y over x, equals x times y squared. So P of x equals 1 over x, Q of x equals x, and n equals 2. Step 2: Substitute v equals y to the negative 1. The linear equation becomes: dv dx minus v over x, equals negative x. Step 3: Solve with integrating factor mu equals 1 over x. We get v equals negative x squared plus C x. Applying the initial condition: at x equals 1, y equals 1 means v of 1 equals 1. So 1 equals negative 1 plus C, giving C equals 2. The solution is v equals negative x squared plus 2x, so: y equals 1 over x times the quantity 2 minus x.`,

    // Slide 7: Example 3 — n=3
    `Example 3, with n equals 3. Solve: dy dx minus 2 y over x, equals negative x squared times y cubed. Here P of x equals negative 2 over x, Q of x equals negative x squared, and n equals 3. The substitution is v equals y to the negative 2, since 1 minus n equals negative 2. The resulting linear equation is: dv dx plus 4 v over x, equals 2 x squared. The integrating factor is mu equals x to the fourth. Applying the formula, we get: v equals 2 x cubed over 7, plus C over x to the fourth. Back-substituting: y equals v to the power negative one-half. So y equals the quantity 2 x cubed over 7 plus C over x to the fourth, all raised to the power negative one-half.`,

    // Slide 8: Common Mistakes
    `Let's cover the common pitfalls. Mistake 1: Forgetting to normalize. The equation must be in the form dy dx plus P of x y equals Q of x y to the n. Divide by the coefficient of dy dx first! Mistake 2: Using the wrong substitution. It's v equals y to the 1 minus n, NOT y to the n. For n equals 2, use v equals y to the negative 1, not v equals y squared. Mistake 3: Forgetting to scale the equation. After substituting, both the coefficient of v and the right-hand side get multiplied by 1 minus n. Don't forget this factor! Mistake 4: Missing the singular solution. Always verify that y equals zero is a solution to the original equation. It's a singular solution for all Bernoulli equations with n greater than 1. Mistake 5: Not back-substituting. After solving for v, always convert back to y using y equals v to the power 1 over 1 minus n.`,

    // Slide 9: Key Takeaways
    `Let's recap the key takeaways. First: the key substitution is v equals y to the 1 minus n. This is the magic that transforms the nonlinear Bernoulli equation into a linear one in v. Second: solve the resulting linear equation using the integrating factor method. Compute mu, apply the formula, find v. Third: always report y equals zero as a singular solution. This solution is lost during the division by y to the n that the method requires. Fourth: Bernoulli equations appear in many real-world applications, including population dynamics with logistic growth, fluid mechanics, chemical reaction kinetics, and nonlinear electrical circuits. The complete workflow is: identify P, Q, and n; substitute v equals y to the 1 minus n; solve the linear equation; back-substitute to find y; and check for the singular solution y equals zero.`
  ],
};

// ─── MAIN ───
async function main() {
  const apiKey = process.argv[2];
  const filterLecture = process.argv[3];

  if (!apiKey) {
    console.error('\n  Usage: node generate-audio.js <elevenlabs-api-key> [lecture-prefix]\n');
    console.error('  Get your free API key at https://elevenlabs.io\n');
    process.exit(1);
  }

  // Ensure audio directory exists
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const lectures = filterLecture
    ? { [filterLecture]: LECTURES[filterLecture] }
    : LECTURES;

  for (const [lectureName, slides] of Object.entries(lectures)) {
    if (!slides) {
      console.error(`  Unknown lecture: ${lectureName}`);
      continue;
    }

    console.log(`\n📚 Generating audio for: ${lectureName}`);
    console.log(`   ${slides.length} slides, ~${slides.join('').length} characters total\n`);

    for (let i = 0; i < slides.length; i++) {
      const outFile = path.join(AUDIO_DIR, `${lectureName}-${i}.mp3`);

      // Skip if already generated
      if (fs.existsSync(outFile)) {
        console.log(`   ✓ Slide ${i + 1}/${slides.length} — already exists, skipping`);
        continue;
      }

      process.stdout.write(`   ⏳ Slide ${i + 1}/${slides.length} — generating...`);

      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: slides[i],
            model_id: MODEL_ID,
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.75,
              style: 0.2
            }
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.log(` ✗ Error ${res.status}: ${errText.slice(0, 100)}`);
          continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(outFile, buffer);
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
        console.log(` ✓ ${sizeMB} MB`);

        // Small delay to avoid rate limits
        if (i < slides.length - 1) await sleep(500);

      } catch (err) {
        console.log(` ✗ ${err.message}`);
      }
    }
  }

  console.log('\n✅ Done! Now commit the audio/ folder and push to GitHub.\n');
  console.log('   git add lectures/audio/');
  console.log('   git commit -m "Add voiceover audio for lectures"');
  console.log('   git push\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => { console.error(err); process.exit(1); });
