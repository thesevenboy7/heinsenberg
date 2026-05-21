/**
 * Heinsenberg — Cloudflare Worker
 *
 * Secrets:
 *   wrangler secret put ANTHROPIC_API_KEY
 *   wrangler secret put ADMIN_KEY        ← chave para acessar as métricas
 *
 * KV namespace (métricas FAQ — opcional):
 *   wrangler kv:namespace create FAQ_LOG
 *   → adicionar ao wrangler.toml:
 *     [[kv_namespaces]]
 *     binding = "FAQ_LOG"
 *     id = "<ID_GERADO_ACIMA>"
 *
 * Ver métricas:
 *   GET https://seu-worker.workers.dev/?action=stats&key=SUA_ADMIN_KEY
 */

// Anti-abuse guard prefixed to system prompt by this Worker before sending to Claude API
const GUARD = {
  pt: 'REGRA CRÍTICA: Responda SOMENTE sobre a estadia nesta unidade. Perguntas não relacionadas à hospedagem (matemática, política, outros assuntos) devem ser recusadas educadamente, redirecionando para dúvidas sobre a estadia.\n\n',
  en: 'CRITICAL RULE: ONLY answer questions about the guest\'s stay at this unit. Off-topic questions (math, politics, unrelated subjects) must be politely declined, redirecting to stay-related questions.\n\n',
  es: 'REGLA CRÍTICA: Responde SOLO preguntas sobre la estadía en esta unidad. Las preguntas no relacionadas con el hospedaje deben rechazarse educadamente, redirigiendo a preguntas sobre la estadía.\n\n',
};

const ALLOWED_ORIGIN = 'https://thesevenboy7.github.io';
const RATE_LIMIT = 20; // requests por hora por IP

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── CORS preflight ──────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    // ── Endpoint de métricas (GET) ──────────────────────────────
    if (request.method === 'GET' && url.searchParams.get('action') === 'stats') {
      return handleStats(env, url);
    }

    // ── Apenas POST para chat ───────────────────────────────────
    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    // ── Rate limiting por IP ────────────────────────────────────
    if (env.FAQ_LOG) {
      const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
      const hour = Math.floor(Date.now() / 3600000);
      const rateKey = `rate:${ip}:${hour}`;
      const count = parseInt(await env.FAQ_LOG.get(rateKey) || '0', 10);
      if (count >= RATE_LIMIT) {
        return corsResponse(JSON.stringify({ error: 'Too many requests. Try again later.' }), 429);
      }
      await env.FAQ_LOG.put(rateKey, String(count + 1), { expirationTtl: 3600 });
    }

    // ── Parse body ──────────────────────────────────────────────
    let body;
    try { body = await request.json(); }
    catch { return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400); }

    const { messages, knowledgeBase, lang, unit } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return corsResponse(JSON.stringify({ error: 'messages required' }), 400);
    }
    if (!knowledgeBase) {
      return corsResponse(JSON.stringify({ error: 'knowledgeBase required' }), 400);
    }

    // ── Sanitizar mensagens ─────────────────────────────────────
    const langKey = ['pt','en','es'].includes(lang) ? lang : 'en';
    const sanitized = messages
      .filter(m => m.role && m.content && typeof m.content === 'string')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content.slice(0, 500)
      }))
      .slice(-10);

    const lastQ = [...sanitized].reverse().find(m => m.role === 'user')?.content || '';

    // System prompt com guard anti-abuso + prompt caching
    const systemPrompt = (GUARD[langKey] || GUARD.en) + knowledgeBase.slice(0, 6000);

    // ── Chamada Claude API ──────────────────────────────────────
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'prompt-caching-2024-07-31',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: sanitized
        })
      });

      if (!claudeRes.ok) {
        return corsResponse(JSON.stringify({ error: 'AI unavailable', status: claudeRes.status }), 502);
      }

      const data = await claudeRes.json();
      const aiAnswer = data?.content?.[0]?.text || '';

      // ── Log FAQ no KV (se disponível) ──────────────────────────
      if (env.FAQ_LOG && lastQ) {
        try {
          const entry = JSON.stringify({
            ts: new Date().toISOString(),
            unit: unit || 'unknown',
            lang: langKey,
            question: lastQ,
            answer: aiAnswer.slice(0, 600),
          });
          const key = `faq:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`;
          await env.FAQ_LOG.put(key, entry, { expirationTtl: 60 * 60 * 24 * 90 }); // 90 dias
        } catch (kvErr) {
          console.error('KV log error:', kvErr);
        }
      }

      return corsResponse(JSON.stringify(data), 200);

    } catch (err) {
      console.error('Worker error:', err);
      return corsResponse(JSON.stringify({ error: 'Internal error' }), 500);
    }
  }
};

/* ── Admin: ver métricas FAQ ─────────────────────────────────────── */
async function handleStats(env, url) {
  const key = url.searchParams.get('key');

  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401);
  }
  if (!env.FAQ_LOG) {
    return corsResponse(JSON.stringify({
      error: 'FAQ_LOG KV não configurado.',
      setup: 'Execute: wrangler kv:namespace create FAQ_LOG e adicione ao wrangler.toml'
    }), 500);
  }

  try {
    const list = await env.FAQ_LOG.list({ limit: 100 });

    // Leitura paralela — muito mais rápido que serial
    const faqKeys = list.keys.filter(k => k.name.startsWith('faq:'));
    const vals = await Promise.all(faqKeys.map(k => env.FAQ_LOG.get(k.name)));
    const entries = [];
    for (const val of vals) {
      if (val) {
        try { entries.push(JSON.parse(val)); } catch {}
      }
    }

    entries.sort((a, b) => b.ts.localeCompare(a.ts));

    const freq = {};
    for (const e of entries) {
      const q = e.question.toLowerCase().slice(0, 80);
      freq[q] = (freq[q] || 0) + 1;
    }
    const topQuestions = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([question, count]) => ({ question, count }));

    const byUnit = {}, byLang = {};
    for (const e of entries) {
      byUnit[e.unit] = (byUnit[e.unit] || 0) + 1;
      byLang[e.lang] = (byLang[e.lang] || 0) + 1;
    }

    return corsResponse(JSON.stringify({
      total: entries.length,
      byUnit,
      byLang,
      topQuestions,
      recent: entries.slice(0, 30)
    }, null, 2), 200);

  } catch (err) {
    return corsResponse(JSON.stringify({ error: 'KV read failed', detail: String(err) }), 500);
  }
}

/* ── Helpers ────────────────────────────────────────────────────── */
function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
