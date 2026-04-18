/**
 * Cloudflare Worker — Claude API Proxy for DE Course AI Tutor
 * ============================================================
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Name it something like "de-ai-tutor"
 * 3. Paste this entire file into the editor
 * 4. Click "Deploy"
 * 5. Go to Settings → Variables → Add Secrets:
 *    - ANTHROPIC_API_KEY: your Claude API key (https://console.anthropic.com)
 *    - GOOGLE_SHEET_WEBHOOK: your Google Apps Script web app URL (see google-apps-script.js)
 * 6. Copy your Worker URL (e.g., https://de-ai-tutor.YOUR-SUBDOMAIN.workers.dev)
 * 7. In ai-tutor.html, replace 'YOUR_CLOUDFLARE_WORKER_URL' with your Worker URL
 *
 * CHAT LOGGING:
 *   Every student question + AI response is logged to a Google Sheet
 *   via a Google Apps Script webhook. Logging is non-blocking — it
 *   runs in the background after the response is sent to the student.
 *   If GOOGLE_SHEET_WEBHOOK is not set, logging is silently skipped.
 *
 * FREE TIER LIMITS: 100,000 requests/day — more than enough for a class of 40.
 */

const ALLOWED_ORIGINS = [
  'https://minds-r-lab.github.io',
  'http://localhost',
  'http://127.0.0.1'
];

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 700;

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Check origin
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

      // Get the student's latest message (the one they just sent)
      const studentMessage = messages[messages.length - 1];

      // Call Claude API
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

      // Extract the text content
      const content = claudeData.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      // Log to Google Sheet in background (non-blocking)
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
            inputTokens: claudeData.usage?.input_tokens || 0,
            outputTokens: claudeData.usage?.output_tokens || 0
          })
        );
      }

      // Return response with usage info
      return jsonResponse({
        content: content,
        usage: claudeData.usage || {}
      }, 200, origin);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal server error' }, 500, origin);
    }
  }
};

/**
 * Log a chat exchange to Google Sheets via Apps Script webhook.
 * Runs in background via ctx.waitUntil() — does not delay the response.
 */
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

/**
 * Extract chapter name from system prompt for logging.
 */
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
