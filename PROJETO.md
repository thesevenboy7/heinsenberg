# Heinsenberg — Portal de Check-in STR

> **Status atual:** MVP estrutural completo (`index.html` + `worker/index.js`)
> **Próxima sessão:** Criar repositório GitHub + deploy Cloudflare Worker

---

## O que é

Portal mobile-first para hóspedes das unidades de aluguel por temporada da **LF Services** em Orlando/Kissimmee, FL.
- Substitui contato manual (WhatsApp/mensagem) completamente
- Acesso via **QR code** impresso na unidade + QR code enviado na mensagem de check-in
- Nome "Heinsenberg" é **interno** — hóspede vê "LF Services"

---

## Arquitetura

```
GitHub Pages (index.html)
    └── Chat IA → fetch POST → Cloudflare Worker → Claude API (Haiku 4.5)
```

**Custo estimado IA:** ~$1.50/mês para 500 conversas de hóspedes.

---

## Estrutura de Arquivos

```
Projeto Heinseberg/
├── index.html          ← portal completo (HTML + CSS + JS inline, zero dependências)
├── worker/
│   └── index.js        ← Cloudflare Worker (proxy seguro para Claude API)
└── PROJETO.md          ← este arquivo (contexto da sessão)
```

---

## Funcionalidades Implementadas

### Portal (`index.html`)
- [x] Lê `?unit=XXX` da URL — ex: `site.com?unit=163`
- [x] Seletor de idioma: PT (padrão) / EN / ES — troca instantânea
- [x] Hero com nome da unidade + horários de check-in/out
- [x] 9 seções em acordeão (um aberto por vez):
  - 📶 WiFi — botão "Copiar senha"
  - 🕐 Check-in/Check-out — horários + código da fechadura + instruções
  - 🚗 Estacionamento — regras + botão "Ver no Maps"
  - 📋 Regras da Casa
  - 🌡️ AC & Eletrodomésticos — texto + suporte a fotos (placeholder ativo)
  - 🏊 Piscina & Academia — texto + suporte a fotos
  - 🗑️ Descarte de Lixo
  - 🍽️ Recomendações Locais
  - 🆘 Emergência — botão "Ligar" (tel:) + botão "WhatsApp" (wa.me com mensagem pré-formatada)
- [x] Aba **Assistente IA** — chat com Claude Haiku via Worker
- [x] Fallback amigável para unidade inválida ou URL sem `?unit=`

### Worker (`worker/index.js`)
- [x] Proxy seguro (API key nunca exposta no HTML)
- [x] Prompt caching habilitado (reduz custo)
- [x] Sanitização das mensagens
- [x] CORS configurado

---

## Unit 163 — Dados para Preencher

Todos os `[PLACEHOLDER]` no `index.html` precisam ser substituídos com os dados reais:

| Campo | Status |
|-------|--------|
| WiFi SSID | `[PLACEHOLDER]` |
| WiFi Password | `[PLACEHOLDER]` |
| Lock Code | `[PLACEHOLDER]` |
| Parking location/rules | `[PLACEHOLDER]` |
| Parking Maps URL | `[PLACEHOLDER]` |
| Max Guests | `[PLACEHOLDER]` |
| AC instructions | `[PLACEHOLDER]` |
| TV instructions | `[PLACEHOLDER]` |
| Pool/Gym hours | `[PLACEHOLDER]` |
| Trash location | `[PLACEHOLDER]` |
| Recommendations | `[PLACEHOLDER]` |
| Appliance photos (URLs) | Array vazio → adicionar URLs |
| knowledgeBase (PT/EN/ES) | Atualizar com dados reais |

---

## Próximos Passos (em ordem)

### 1. Criar repositório GitHub
```bash
cd "C:/Users/mario/OneDrive/Área de Trabalho/Projeto Heinseberg"
git init
git add index.html PROJETO.md
# NÃO commitar worker/index.js com a API key — apenas estrutura
git commit -m "feat: MVP portal Heinsenberg"
gh repo create heinsenberg --public --push
```

**Ativar GitHub Pages:**
- Settings → Pages → Source: main branch → / (root)
- URL ficará: `https://[usuario].github.io/heinsenberg?unit=163`

### 2. Deploy Cloudflare Worker
```bash
cd worker
npx wrangler init
npx wrangler secret put ANTHROPIC_API_KEY
# Cole a chave da Anthropic quando solicitado
npx wrangler deploy
# Copie a URL gerada (ex: https://heinsenberg-worker.xxxxx.workers.dev)
```

**Depois:** Editar `index.html` linha com `WORKER_URL` e colar a URL real.

### 3. Preencher dados reais da Unit 163
- Abrir `index.html` no VS Code
- Buscar por `[PLACEHOLDER]` e substituir
- Tirar fotos do AC, TV, controles → hospedar no Imgur ou GitHub e adicionar URLs em `appliances.photos`

### 4. Domínio personalizado (opcional)
- `checkin.lfservices.com` apontando para GitHub Pages
- Configurar CORS no `worker/index.js` para restringir ao domínio

### 5. Gerar QR Codes
- URL: `https://checkin.lfservices.com?unit=163` (ou GitHub Pages URL)
- Site gratuito: qr-code-generator.com ou similar
- Imprimir e colocar dentro da unidade

### 6. Lovable (refinamento visual)
- Levar o `index.html` completo para o Lovable
- O CSS já usa variáveis (`--color-bg`, `--color-gold`, etc.) — fácil de tematizar

### 7. Adicionar mais unidades
- No `index.html`, no objeto `UNITS`, copiar o bloco da unit 163 e alterar a chave e os dados

---

## Tecnologias

| Item | Solução |
|------|---------|
| Frontend | HTML + CSS + JS puro (zero dependências) |
| Hospedagem | GitHub Pages (gratuito) |
| IA Backend | Cloudflare Workers (gratuito até 100k req/dia) |
| IA Model | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) |
| Idiomas | PT / EN / ES |

---

## Contato de Emergência (fixo)
**Mônica** — +1 407-000-0000 (WhatsApp disponível)

---

## Para retomar a sessão

Cole no Claude Code:
> "Projeto Heinsenberg: portal de check-in STR. Leia o PROJETO.md para contexto completo. Próximo passo: [descreva o que quer fazer]"
