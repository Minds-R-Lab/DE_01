/**
 * Cloudflare Worker — Claude API Proxy for DE Course AI Tutor
 * ============================================================
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this file → Deploy
 * 3. Settings → Variables → Add Secrets:
 *    - ANTHROPIC_API_KEY: your Claude API key
 *    - GOOGLE_SHEET_WEBHOOK: your Apps Script web app URL
 * 4. Create a KV Namespace for rate limiting:
 *    - Go to Workers & Pages → KV → Create a namespace → name it "STUDENT_USAGE"
 *    - Go to your Worker → Settings → Bindings → Add binding
 *    - Variable name: USAGE    KV namespace: STUDENT_USAGE
 * 5. Update PROXY_URL in ai-tutor.html
 *
 * RATE LIMITING:
 *   Each student gets a daily token budget (default: 50,000 tokens/day).
 *   Usage resets at midnight UTC. Students see a friendly message when
 *   they hit the limit. Change DAILY_TOKEN_LIMIT below to adjust.
 */

const ALLOWED_ORIGINS = [
  'https://minds-r-lab.github.io',
  'http://localhost',
  'http://127.0.0.1'
];

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1500;

// ==========================================
// RATE LIMITING CONFIG — adjust as needed
// ==========================================
const DAILY_TOKEN_LIMIT = 100000;  // tokens per student per day
const DAILY_REQUEST_LIMIT = 50;    // max messages per student per day

// ==========================================
// MATH VERIFICATION CONFIG
// ==========================================
const ENABLE_VERIFICATION = true;  // toggle verification on/off
const VERIFICATION_MODEL = 'claude-haiku-4-5-20251001';  // model for verification pass
const VERIFICATION_MAX_TOKENS = 800;

// Patterns that indicate the response contains a mathematical solution worth verifying
const MATH_SOLUTION_PATTERNS = [
  /\$\$[^$]*=[^$]*\$\$/,       // display math with equals sign
  /\\boxed\{/,                   // boxed answers
  /y\s*[=(]\s*/i,               // y = ... or y(t) = ...
  /solution.*:/i,               // "Solution:" header
  /therefore/i,                 // "therefore" conclusions
  /general solution/i,          // general solution
  /particular solution/i,       // particular solution
  /y_p\s*=/,                    // particular solution
  /Y\(s\)\s*=/,                 // Laplace domain solution
  /\\mathcal\{L\}/,             // Laplace transform notation
  /partial\s+fraction/i,        // partial fraction work
  /\\int/,                      // integration
  /\\frac\{[^}]+\}\{[^}]+\}/,  // fractions in LaTeX
  /e\^\{[^}]*t/,               // exponential solutions
  /\\cos|\\sin/,                // trig solutions
];

// Build the verifier system prompt
function buildVerifierPrompt(chapterContent) {
  return `You are a rigorous mathematics verification assistant for a Differential Equations course. Your ONLY job is to check whether a mathematical solution is correct.

COURSE REFERENCE MATERIAL:
${chapterContent || 'General differential equations.'}

VERIFICATION PROCEDURE — check each of these:
1. **Method identification**: Is the correct solution method being used for this type of equation?
2. **Formula application**: Are formulas (characteristic equation, Laplace transforms, partial fractions, etc.) applied correctly?
3. **Algebraic steps**: Check each algebraic manipulation. Look especially for sign errors, incorrect coefficients, and wrong partial fraction forms.
4. **Final answer verification**:
   - For ODEs: Does the solution satisfy the original equation when substituted back?
   - For IVPs: Does it also satisfy the initial conditions?
   - For Laplace transforms: Does the transform/inverse match the standard table?
   - For partial fractions: Does the decomposition multiply back to the original?
5. **Completeness**: Are all cases handled? Are constants of integration included where needed?

RESPONSE FORMAT — You MUST respond in EXACTLY this format:

If the solution is correct:
VERDICT: CORRECT
CONFIDENCE: HIGH|MEDIUM
NOTES: [brief note on what you checked]

If the solution has errors:
VERDICT: ERROR
CONFIDENCE: HIGH|MEDIUM
ERRORS: [list each specific error with the incorrect step and what it should be]
CORRECTION: [the corrected final answer or corrected steps]

Rules:
- Be extremely precise. Only flag errors you are CERTAIN about.
- Check arithmetic carefully — recompute, don't just eyeball.
- If you are unsure whether something is wrong, say VERDICT: CORRECT with CONFIDENCE: MEDIUM rather than flagging a false error.
- Focus on mathematical errors, not pedagogical style.
- Keep your response concise — this is a verification check, not a tutoring session.`;
}

// Detect if a response contains mathematical solutions worth verifying
function containsMathSolution(content) {
  if (!content || content.length < 100) return false;  // too short to be a solution
  let matchCount = 0;
  for (const pattern of MATH_SOLUTION_PATTERNS) {
    if (pattern.test(content)) matchCount++;
    if (matchCount >= 2) return true;  // need at least 2 pattern matches
  }
  return false;
}

// Run verification on a response
async function verifyMathResponse(apiKey, studentQuestion, aiResponse, chapterContent) {
  const verifierPrompt = buildVerifierPrompt(chapterContent);

  const verifyMessages = [{
    role: 'user',
    content: `STUDENT QUESTION:\n${studentQuestion}\n\nAI TUTOR RESPONSE TO VERIFY:\n${aiResponse}\n\nPlease verify the mathematical correctness of this response.`
  }];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: VERIFICATION_MODEL,
        max_tokens: VERIFICATION_MAX_TOKENS,
        system: verifierPrompt,
        messages: verifyMessages
      })
    });

    if (!response.ok) {
      console.error('Verification API error:', response.status);
      return { verdict: 'SKIP', reason: 'API error' };
    }

    const data = await response.json();
    const verifierContent = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    const tokens = {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0
    };

    // Parse the verdict
    const verdictMatch = verifierContent.match(/VERDICT:\s*(CORRECT|ERROR)/i);
    const verdict = verdictMatch ? verdictMatch[1].toUpperCase() : 'UNKNOWN';

    const confidenceMatch = verifierContent.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i);
    const confidence = confidenceMatch ? confidenceMatch[1].toUpperCase() : 'MEDIUM';

    // Extract errors and correction if present
    const errorsMatch = verifierContent.match(/ERRORS:\s*([\s\S]*?)(?=CORRECTION:|$)/i);
    const errors = errorsMatch ? errorsMatch[1].trim() : '';

    const correctionMatch = verifierContent.match(/CORRECTION:\s*([\s\S]*?)$/i);
    const correction = correctionMatch ? correctionMatch[1].trim() : '';

    return {
      verdict,
      confidence,
      errors,
      correction,
      tokens,
      raw: verifierContent
    };
  } catch (err) {
    console.error('Verification error:', err);
    return { verdict: 'SKIP', reason: err.message };
  }
}

// Regenerate a response with error corrections
async function regenerateWithCorrections(apiKey, systemPrompt, messages, errors, correction) {
  // Add the verification feedback to the system prompt
  const enhancedSystem = systemPrompt + `\n\nIMPORTANT CORRECTION — A verification check found errors in a previous attempt at this problem. The specific errors were:\n${errors}\n${correction ? `\nThe corrected approach should be: ${correction}` : ''}\n\nPlease solve this problem again carefully, avoiding these specific errors. Show your work and verify your answer by substituting back.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system: enhancedSystem,
        messages: messages.slice(-20)
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      content,
      usage: data.usage
    };
  } catch (err) {
    console.error('Regeneration error:', err);
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
    if (!isAllowed && origin !== '') {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();
      const { messages, system, student, action } = body;

      if (!messages || !Array.isArray(messages)) {
        return jsonResponse({ error: 'Invalid request: messages array required' }, 400, origin);
      }

      // ==========================================
      // PROFILE UPDATE REQUEST (lightweight, separate path)
      // ==========================================
      if (action === 'update_profile') {
        const profileResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 600,  // Richer profiles
            system: system,
            messages: messages.slice(-10)
          })
        });

        if (!profileResponse.ok) {
          return jsonResponse({ error: 'Profile update failed' }, 502, origin);
        }

        const profileData = await profileResponse.json();
        const profileContent = profileData.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n');

        // Log profile update to sheet
        if (env.GOOGLE_SHEET_WEBHOOK) {
          ctx.waitUntil(
            logToSheet(env.GOOGLE_SHEET_WEBHOOK, {
              timestamp: new Date().toISOString(),
              studentName: student?.name || 'Unknown',
              studentEmail: student?.email || '',
              studentId: student?.id || '',
              major: student?.major || '',
              chapter: 'PROFILE UPDATE',
              studentMessage: '[Profile updated]',
              aiResponse: profileContent,
              inputTokens: profileData.usage?.input_tokens || 0,
              outputTokens: profileData.usage?.output_tokens || 0
            })
          );
        }

        return jsonResponse({ content: profileContent }, 200, origin);
      }

      // ==========================================
      // RATE LIMIT CHECK
      // ==========================================
      const studentKey = student?.id || student?.email || 'anonymous';
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const usageKey = `usage:${studentKey}:${today}`;

      let usage = { tokens: 0, requests: 0 };
      if (env.USAGE) {
        const stored = await env.USAGE.get(usageKey, 'json');
        if (stored) usage = stored;
      }

      if (usage.tokens >= DAILY_TOKEN_LIMIT) {
        return jsonResponse({
          content: `You've reached your daily token limit (${DAILY_TOKEN_LIMIT.toLocaleString()} tokens). Your limit resets at midnight UTC. This helps ensure fair access for all students.\n\nIn the meantime, try reviewing your notes, the course materials, or the Study Tools page!`,
          limited: true,
          usage: { daily_tokens_used: usage.tokens, daily_limit: DAILY_TOKEN_LIMIT }
        }, 200, origin);
      }

      if (usage.requests >= DAILY_REQUEST_LIMIT) {
        return jsonResponse({
          content: `You've reached your daily message limit (${DAILY_REQUEST_LIMIT} messages). Your limit resets at midnight UTC.\n\nTip: Try asking more detailed questions to get more value from each message!`,
          limited: true,
          usage: { daily_requests_used: usage.requests, daily_limit: DAILY_REQUEST_LIMIT }
        }, 200, origin);
      }

      // ==========================================
      // CALL CLAUDE API
      // ==========================================
      const studentMessage = messages[messages.length - 1];

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: system || 'You are a helpful differential equations tutor.',
          messages: messages.slice(-20)
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', errorText);
        return jsonResponse({
          error: 'AI service temporarily unavailable. Please try again.',
          details: claudeResponse.status
        }, 502, origin);
      }

      const claudeData = await claudeResponse.json();

      let content = claudeData.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      let inputTokens = claudeData.usage?.input_tokens || 0;
      let outputTokens = claudeData.usage?.output_tokens || 0;
      let verificationResult = null;
      let wasVerified = false;
      let wasCorrected = false;

      // ==========================================
      // MATH VERIFICATION PASS (Approach 2)
      // ==========================================
      if (ENABLE_VERIFICATION && containsMathSolution(content)) {
        // Extract chapter content from the system prompt for the verifier
        const chapterContentMatch = (system || '').match(/DETAILED COURSE CONTENT.*?:\n([\s\S]*?)(?=\n\nTeaching approach:|MATHEMATICAL ACCURACY|PERSONALIZED LEARNER|This is early in)/);
        const chapterContent = chapterContentMatch ? chapterContentMatch[1].trim() : '';

        verificationResult = await verifyMathResponse(
          env.ANTHROPIC_API_KEY,
          studentMessage?.content || '',
          content,
          chapterContent
        );

        if (verificationResult.verdict === 'ERROR' && verificationResult.confidence === 'HIGH') {
          // Error found with high confidence — regenerate with corrections
          const regenerated = await regenerateWithCorrections(
            env.ANTHROPIC_API_KEY,
            system || '',
            messages.slice(-20),
            verificationResult.errors,
            verificationResult.correction
          );

          if (regenerated && regenerated.content) {
            content = regenerated.content;
            // Add regeneration tokens to totals
            inputTokens += (regenerated.usage?.input_tokens || 0);
            outputTokens += (regenerated.usage?.output_tokens || 0);
            wasCorrected = true;
          }
        }

        // Add verification tokens (don't count against student's daily limit)
        // We track them separately for cost monitoring
        wasVerified = (verificationResult.verdict !== 'SKIP');
      }

      // ==========================================
      // UPDATE USAGE (non-blocking)
      // Only count generation tokens against student limit, not verification
      // ==========================================
      const studentTokens = claudeData.usage
        ? (claudeData.usage.input_tokens || 0) + (claudeData.usage.output_tokens || 0)
        : 0;
      if (env.USAGE) {
        usage.tokens += studentTokens;  // only original generation counts
        usage.requests += 1;
        ctx.waitUntil(
          env.USAGE.put(usageKey, JSON.stringify(usage), {
            expirationTtl: 86400  // auto-delete after 24h
          })
        );
      }

      // ==========================================
      // LOG TO GOOGLE SHEET (non-blocking)
      // ==========================================
      if (env.GOOGLE_SHEET_WEBHOOK) {
        ctx.waitUntil(
          logToSheet(env.GOOGLE_SHEET_WEBHOOK, {
            timestamp: new Date().toISOString(),
            studentName: student?.name || 'Unknown',
            studentEmail: student?.email || '',
            studentId: student?.id || '',
            major: student?.major || '',
            chapter: extractChapter(system),
            studentMessage: studentMessage?.content || '',
            aiResponse: content,
            inputTokens: inputTokens,
            outputTokens: outputTokens,
            verified: wasVerified,
            corrected: wasCorrected,
            verificationVerdict: verificationResult?.verdict || 'SKIPPED',
            verificationDetails: verificationResult?.raw || ''
          })
        );
      }

      // ==========================================
      // RESPOND
      // ==========================================
      const remaining = DAILY_TOKEN_LIMIT - usage.tokens;
      return jsonResponse({
        content: content,
        usage: claudeData.usage || {},
        verified: wasVerified,
        corrected: wasCorrected,
        daily: {
          tokens_used: usage.tokens,
          tokens_limit: DAILY_TOKEN_LIMIT,
          tokens_remaining: remaining > 0 ? remaining : 0,
          requests_used: usage.requests,
          requests_limit: DAILY_REQUEST_LIMIT
        }
      }, 200, origin);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal server error' }, 500, origin);
    }
  }
};

async function logToSheet(webhookUrl, data) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      console.error('Sheet log failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Sheet log error:', err.message);
  }
}

function extractChapter(system) {
  if (!system) return 'General';
  const match = system.match(/Topic:\s*([^\n—]+)/);
  return match ? match[1].trim() : 'General';
}

function handleCORS(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function jsonResponse(data, status, origin) {
  const allowedOrigin = ALLOWED_ORIGINS.some(o => (origin || '').startsWith(o))
    ? origin
    : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
