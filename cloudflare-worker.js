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
const MAX_TOKENS = 700;

// ==========================================
// RATE LIMITING CONFIG — adjust as needed
// ==========================================
const DAILY_TOKEN_LIMIT = 50000;   // tokens per student per day
const DAILY_REQUEST_LIMIT = 50;    // max messages per student per day

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
      const { messages, system, student } = body;

      if (!messages || !Array.isArray(messages)) {
        return jsonResponse({ error: 'Invalid request: messages array required' }, 400, origin);
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

      const content = claudeData.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      const inputTokens = claudeData.usage?.input_tokens || 0;
      const outputTokens = claudeData.usage?.output_tokens || 0;

      // ==========================================
      // UPDATE USAGE (non-blocking)
      // ==========================================
      if (env.USAGE) {
        usage.tokens += inputTokens + outputTokens;
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
            outputTokens: outputTokens
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
