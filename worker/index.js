/**
 * Heinsenberg — Cloudflare Worker (Proxy Claude API)
 *
 * Deploy: wrangler deploy
 * Secret: wrangler secret put ANTHROPIC_API_KEY
 *
 * Depois do deploy, copie a URL gerada e cole em WORKER_URL no index.html
 */

const ALLOWED_ORIGINS = [
  // Adicione aqui o domínio do seu GitHub Pages após configurar
  // 'https://seuusuario.github.io',
  // 'https://checkin.lfservices.com',
];

export default {
  async fetch(request, env) {

    // ── CORS preflight ──────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    // ── Apenas POST ─────────────────────────────────────────────
    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    // ── Validação de origem (descomente em produção) ─────────────
    // const origin = request.headers.get('Origin') || '';
    // if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    //   return corsResponse(JSON.stringify({ error: 'Forbidden' }), 403);
    // }

    // ── Parse do body ───────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400);
    }

    const { messages, knowledgeBase, lang } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return corsResponse(JSON.stringify({ error: 'messages array required' }), 400);
    }

    if (!knowledgeBase) {
      return corsResponse(JSON.stringify({ error: 'knowledgeBase required' }), 400);
    }

    // ── Sanitizar mensagens (apenas role/content permitidos) ─────
    const sanitizedMessages = messages
      .filter(m => m.role && m.content && typeof m.content === 'string')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content.slice(0, 2000) // limite por mensagem
      }))
      .slice(-20); // máximo 20 mensagens no histórico

    // ── Chamada Claude API ───────────────────────────────────────
    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          // Cache de prompt: o system prompt é estável por unidade/idioma
          // Anthropic cacheia automaticamente blocos com > 1024 tokens
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', // rápido e econômico para FAQ
          max_tokens: 512,
          system: [
            {
              type: 'text',
              text: knowledgeBase,
              cache_control: { type: 'ephemeral' } // ativa prompt caching
            }
          ],
          messages: sanitizedMessages
        })
      });

      if (!claudeResponse.ok) {
        const errText = await claudeResponse.text();
        console.error('Claude API error:', claudeResponse.status, errText);
        return corsResponse(
          JSON.stringify({ error: 'AI service unavailable', detail: claudeResponse.status }),
          502
        );
      }

      const data = await claudeResponse.json();
      return corsResponse(JSON.stringify(data), 200);

    } catch (err) {
      console.error('Worker error:', err);
      return corsResponse(JSON.stringify({ error: 'Internal error' }), 500);
    }
  }
};

/* ── Helpers ─────────────────────────────────────────────────── */
function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // restrinja para o domínio real em produção
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
