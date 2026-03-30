/* ============================================
   DE Course — Shared JavaScript
   ============================================ */

/* --- KaTeX Configuration & Initialization --- */
const KATEX_CONFIG = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '$',  right: '$',  display: false },
    { left: '\\(', right: '\\)', display: false }
  ],
  throwOnError: false
};

/**
 * Render math in an element using KaTeX auto-render.
 * Falls back silently if KaTeX is not loaded.
 */
function initKaTeX(element) {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(element || document.body, KATEX_CONFIG);
  }
}

/* --- Collapsible Sections ---
   Unified toggle that supports both 'open' and 'active' CSS classes,
   and re-renders KaTeX inside newly revealed content.
*/
function toggleCollapsible(btn) {
  var content = btn.nextElementSibling;
  var icon = btn.querySelector('.toggle-icon') || btn.querySelector('.arrow');

  // Toggle classes (support both conventions)
  btn.classList.toggle('open');
  btn.classList.toggle('active');
  content.classList.toggle('open');
  content.classList.toggle('active');

  var isOpen = content.classList.contains('open') || content.classList.contains('active');

  // Update arrow/icon if present
  if (icon) {
    if (icon.classList.contains('arrow')) {
      // Arrow rotation is handled by CSS
    } else {
      icon.textContent = isOpen ? '▲' : '▼';
    }
  }

  // Re-render math inside newly revealed content
  if (isOpen) {
    initKaTeX(content);
  }
}

/**
 * Toggle for practice problem sections (exam-style).
 * Works with both 'open' and 'active' CSS patterns.
 */
function togglePractice(header) {
  var content = header.nextElementSibling;
  var icon = header.querySelector('.toggle-icon') || header.querySelector('.arrow');

  header.classList.toggle('open');
  content.classList.toggle('open');
  content.classList.toggle('active');

  var isOpen = content.classList.contains('open') || content.classList.contains('active');

  if (icon) {
    if (icon.classList.contains('arrow')) {
      // Arrow rotation handled by CSS
    } else {
      icon.textContent = isOpen ? '▲' : '▼';
    }
  }

  // Re-render math inside revealed content
  if (isOpen) {
    initKaTeX(content);
  }
}

/**
 * Toggle for content sections (ch5 pattern).
 */
function toggleContent(btn) {
  var content = btn.nextElementSibling;
  btn.classList.toggle('active');
  content.classList.toggle('active');

  if (content.classList.contains('active')) {
    initKaTeX(content);
  }
}

/**
 * Alias for ch1-bernoulli compatibility.
 */
function toggleCollapse(el) {
  toggleCollapsible(el);
}

/* --- Safe Math Expression Evaluation --- */

/**
 * Evaluate a math expression string with support for common
 * math functions (sin, cos, exp, sqrt, etc.).
 */
function safeEval(expr, x, y) {
  try {
    var e = expr
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/log/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/pi/g, 'Math.PI')
      .replace(/\^/g, '**');
    return Function('x', 'y', '"use strict"; return ' + e)(x, y);
  } catch (err) {
    return NaN;
  }
}

/* --- Runge-Kutta 4th Order Solver --- */

/**
 * Solve an ODE dy/dx = f(x, y) using the classic RK4 method.
 * @param {Function} f - The derivative function f(x, y)
 * @param {number} x0 - Initial x value
 * @param {number} y0 - Initial y value
 * @param {number} xf - Final x value
 * @param {number} h  - Step size (default 0.01)
 * @returns {Array} [xs, ys] arrays of x and y values
 */
function rk4(f, x0, y0, xf, h) {
  if (h === undefined) h = 0.01;
  var xs = [x0], ys = [y0];
  var x = x0, y = y0;
  var dir = xf > x0 ? 1 : -1;
  h = dir * Math.abs(h);

  while ((dir > 0 && x < xf) || (dir < 0 && x > xf)) {
    var k1 = f(x, y);
    var k2 = f(x + h / 2, y + k1 * h / 2);
    var k3 = f(x + h / 2, y + k2 * h / 2);
    var k4 = f(x + h, y + k3 * h);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x += h;
    if (!isFinite(y) || Math.abs(y) > 1e6) break;
    xs.push(x);
    ys.push(y);
  }
  return [xs, ys];
}

/* --- Fisher-Yates Shuffle --- */
function shuffle(arr) {
  var result = arr.slice();
  for (var i = result.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/* --- Auto-Initialize KaTeX on DOM Ready --- */
document.addEventListener('DOMContentLoaded', function () {
  initKaTeX();
});
