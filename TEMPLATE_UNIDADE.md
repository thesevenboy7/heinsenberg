# Template — Nova Unidade

> **O QUE É ESSE ARQUIVO?**
> Este é o template para adicionar novas unidades ao portal Heinsenberg.
> Cada unidade preenchida aqui vira uma página automática acessada pelo QR code da unidade.
> Um único site serve todas as unidades — você só preenche os dados e o sistema se adapta sozinho.
>
> **COMO USAR:**
> 1. Copie o bloco de código abaixo
> 2. Abra o arquivo `index.html`
> 3. Localize `const UNITS = {` no topo do arquivo
> 4. Cole o bloco **antes** do `}` final do objeto UNITS
> 5. Substitua todos os `XXX` e campos `← PREENCHER` com os dados reais da unidade
> 6. Salve → abra no browser com `?unit=NUMERO` para testar
> 7. Faça commit e push para publicar no GitHub Pages

Para adicionar uma nova unidade, copie o bloco abaixo, cole dentro do objeto `UNITS` no `index.html`,
e preencha todos os campos marcados com `← PREENCHER`.

---

```js
XXX: {  // ← NÚMERO DA UNIDADE (ex: 205)
  name: "Unit XXX",                     // ← ex: "Unit 205"
  location: "Kissimmee, FL",            // ← cidade/bairro se diferente
  maxGuests: "6",                       // ← número máximo de hóspedes

  wifi: {
    ssid: "NomeDaRede",                 // ← nome da rede WiFi
    password: "SenhaDaRede"             // ← senha do WiFi
  },

  checkin: {
    checkInTime: "16:00",               // ← horário de check-in
    checkOutTime: "11:00",              // ← horário de check-out
    lockCode: "1234",                   // ← código da fechadura
    instructions: {
      pt: "Ao chegar, digite o código acima na fechadura. Tranche ao sair.",
      en: "Upon arrival, enter the code above on the lock. Lock when leaving.",
      es: "Al llegar, ingrese el código en la cerradura. Cierre al salir."
    }
  },

  parking: {
    rules: {
      pt: "Vaga nº XX no bloco YY. Não use vagas de visitante.",   // ← preencher
      en: "Space #XX in block YY. Do not use visitor spaces.",
      es: "Espacio #XX en bloque YY. No use espacios de visitantes."
    },
    mapsUrl: "https://maps.google.com/?q=LATITUDE,LONGITUDE"       // ← link do Maps da vaga
  },

  rules: {
    pt: [
      { icon: "🚭", text: "Proibido fumar em qualquer área da unidade" },
      { icon: "🎉", text: "Sem festas ou eventos — máximo 6 hóspedes" },  // ← ajustar número
      { icon: "👟", text: "Retire os sapatos ao entrar na unidade" },
      { icon: "🐾", text: "Animais de estimação não são permitidos" },
      { icon: "🔇", text: "Silêncio após as 22h — respeite os vizinhos" },
      { icon: "🗑️", text: "Deixe a unidade organizada ao fazer check-out" }
    ],
    en: [
      { icon: "🚭", text: "No smoking in any area of the unit" },
      { icon: "🎉", text: "No parties or events — maximum 6 guests" },
      { icon: "👟", text: "Remove shoes when entering the unit" },
      { icon: "🐾", text: "Pets are not allowed" },
      { icon: "🔇", text: "Quiet after 10 PM — respect your neighbors" },
      { icon: "🗑️", text: "Leave the unit tidy at checkout" }
    ],
    es: [
      { icon: "🚭", text: "Prohibido fumar en cualquier área de la unidad" },
      { icon: "🎉", text: "Sin fiestas o eventos — máximo 6 huéspedes" },
      { icon: "👟", text: "Quítese los zapatos al entrar a la unidad" },
      { icon: "🐾", text: "No se permiten mascotas" },
      { icon: "🔇", text: "Silencio después de las 10 PM" },
      { icon: "🗑️", text: "Deje la unidad ordenada al hacer check-out" }
    ]
  },

  appliances: {
    text: {
      pt: "AC: [como ligar, temperatura recomendada]. TV: [como ligar, apps disponíveis].",  // ← preencher
      en: "AC: [how to turn on, recommended temp]. TV: [how to turn on, available apps].",
      es: "AC: [cómo encender, temperatura]. TV: [cómo encender, apps disponibles]."
    },
    photos: []  // ← adicionar URLs das fotos: ["https://...", "https://..."]
  },

  pool: {
    text: {
      pt: "Piscina e academia disponíveis. Horário: 8h às 22h. [localização].",  // ← preencher
      en: "Pool and gym available. Hours: 8 AM to 10 PM. [location].",
      es: "Piscina y gimnasio disponibles. Horario: 8h a 22h. [ubicación]."
    },
    photos: []
  },

  trash: {
    pt: "[Onde jogar o lixo, quando é a coleta].",   // ← preencher
    en: "[Where to dispose of trash, collection days].",
    es: "[Dónde desechar la basura, días de recolección]."
  },

  recommendations: {
    pt: [
      { name: "Nome do lugar", type: "Restaurante", tip: "Dica rápida sobre o lugar" },  // ← preencher
      { name: "Nome do lugar", type: "Supermercado", tip: "O mais próximo da unidade" },
      { name: "Nome do lugar", type: "Atração", tip: "Vale muito a visita" }
    ],
    en: [
      { name: "Place name", type: "Restaurant", tip: "Quick tip about the place" },
      { name: "Place name", type: "Grocery", tip: "Closest to the unit" },
      { name: "Place name", type: "Attraction", tip: "Definitely worth a visit" }
    ],
    es: [
      { name: "Nombre del lugar", type: "Restaurante", tip: "Consejo rápido" },
      { name: "Nombre del lugar", type: "Supermercado", tip: "El más cercano" },
      { name: "Nombre del lugar", type: "Atracción", tip: "Vale mucho la visita" }
    ]
  },

  emergency: [
    { name: "Mônica", role: { pt: "Suporte LF Services", en: "LF Services Support", es: "Soporte LF Services" }, phone: "+14070000000", whatsapp: true }
  ],

  knowledgeBase: {
    pt: `Você é o assistente virtual da Unit XXX da LF Services em Kissimmee, FL.
Responda apenas perguntas sobre a estadia. Seja amigável e conciso.

WiFi: rede "NomeDaRede", senha "SenhaDaRede".
Check-in: 16h | Check-out: 11h.
Código da fechadura: 1234.
Máximo: 6 hóspedes.
AC: [instruções].
TV: [instruções, apps disponíveis].
Piscina/Academia: [horário e localização].
Lixo: [onde e quando].
Estacionamento: vaga XX, bloco YY.
Regras: sem festas, sem fumar, sem sapatos dentro, sem pets, silêncio após 22h.
Emergência: Mônica +1 407-000-0000 (WhatsApp disponível).
Se não souber responder algo, indique contatar a Mônica.`,

    en: `You are the virtual assistant for Unit XXX by LF Services in Kissimmee, FL.
Only answer questions about the stay. Be friendly and concise.

WiFi: network "NetworkName", password "Password".
Check-in: 4 PM | Check-out: 11 AM.
Lock code: 1234.
Maximum: 6 guests.
AC: [instructions].
TV: [instructions, available apps].
Pool/Gym: [hours and location].
Trash: [where and when].
Parking: space XX, block YY.
Rules: no parties, no smoking, no shoes inside, no pets, quiet after 10 PM.
Emergency: Mônica +1 407-000-0000 (WhatsApp available).
If unsure, suggest contacting Mônica.`,

    es: `Eres el asistente virtual de la Unit XXX de LF Services en Kissimmee, FL.
Solo responde preguntas sobre la estadía. Sé amable y conciso.

WiFi: red "NombreRed", contraseña "Contraseña".
Check-in: 4 PM | Check-out: 11 AM.
Código cerradura: 1234.
Máximo: 6 huéspedes.
AC: [instrucciones].
TV: [instrucciones, apps disponibles].
Piscina/Gimnasio: [horario y ubicación].
Basura: [dónde y cuándo].
Estacionamiento: espacio XX, bloque YY.
Reglas: sin fiestas, sin fumar, sin zapatos, sin mascotas, silencio después 22h.
Emergencia: Mônica +1 407-000-0000 (WhatsApp disponible).
Si no sabe algo, sugiera contactar a Mônica.`
  }
},
```

---

## Checklist ao adicionar nova unidade

- [ ] Substituir todos os `XXX` pelo número da unidade
- [ ] WiFi: ssid + password
- [ ] Check-in/out: horários + código da fechadura
- [ ] Estacionamento: número da vaga + link do Maps
- [ ] Máximo de hóspedes (ajustar nas rules também)
- [ ] AC e TV: instruções de uso
- [ ] Piscina/academia: horário e localização
- [ ] Lixo: onde jogar e dias de coleta
- [ ] Recomendações: 3 lugares próximos
- [ ] knowledgeBase: preencher com os dados reais nos 3 idiomas
- [ ] Fotos: tirar fotos do AC, TV, controles → adicionar URLs em `photos: []`

## Dica rápida

Depois de preencher, teste abrindo no browser:
```
index.html?unit=XXX
```
Se carregar os dados certos → está funcionando. Aí é só fazer commit e push.
