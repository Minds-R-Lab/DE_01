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
 * 5. Go to Settings → Variables → Add Environment Variable:
 *    - Name: ANTHROPIC_API_KEY
 *    - Value: your Claude API key (get one at https://console.anthropic.com)
 *    - Click "Encrypt" to keep it secret
 * 6. Copy your Worker URL (e.g., https://de-ai-tutor.YOUR-SUBDOMAIN.workers.dev)
 * 7. In ai-tutor.html, replace 'YOUR_CLOUDFLARE_WORKER_URL' with your Worker URL
 *
 * FREE TIER LIMITS: 100,000 requests/day — more than enough for a class of 40.
 *
 * COST ESTIMATE (Claude 3.5 Haiku):
 *   ~$0.25/MTok input, ~$1.25/MTok output
 *   40 students × 10 messages/day × 500 tokens/msg ≈ $0.25/day ≈ $7.50/month
 */

const ALLOWED_ORIGINS = [
  'https://minds-r-lab.github.io',
  'http://localhost',
  'http://127.0.0.1'
];

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';  // Fast & cheap; change to claude-sonnet-4-5-20250514 for smarter responses
const MAX_TOKENS = 700;  // Keeps responses focused; increase if students need longer explanations

export default {
  async fetch(request, env) {
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

      // Rate limiting by student ID (simple in-memory, resets on worker restart)
      // For production, use Cloudflare KV or D1

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
          messages: messages.slice(-20) // Last 20 messages to control costs
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
