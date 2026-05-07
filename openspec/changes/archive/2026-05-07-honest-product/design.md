## Decisions tècniques

### 1. Empty state vs "Coming soon" complet al dashboard

L'opció (b) del chat era "desactivar amb missatge en construcció". L'opció més pragmàtica
és **(b) intel·ligent**: queries reals + empty states. Així:

- **Avui** (sense clients amb projectes): l'empty state diu "Aviat tindreu activitat aquí…".
  Indistinguible visualment d'una versió "coming soon".
- **Demà** (quan signis primer pilot): el dashboard funciona amb dades reals sense canvis
  addicionals — només cal omplir Project rows a la BBDD.

Cost ara: ~30 min (les queries són `prisma.X.count` + un breu render). Cost futur: zero.
Si en lloc d'això poses una pàgina genèrica "en construcció", la quan toqui obrir-ho
caldrà refer-ho.

Trade-off: si la query falla (BBDD caiguda), millor mostrar empty state que un error 500.
Catch genèric a cada query.

### 2. CTAs de pricing — WhatsApp o form?

Decideixo **mantenir form de contacte** als 3 tiers de pricing del producte IA, no
WhatsApp:

- Pressupost necessita context: tipus de clínica, nombre de professionals, software actual.
  Aquest context es recull mal en un xat ràpid de WhatsApp.
- Form genera lead a BBDD + email a Sandra/Oscar = traçabilitat.
- WhatsApp queda per als CTAs **secundaris/conversacionals** (header, footer, "Parla amb
  Sandra" quan només es tracta de fer una pregunta inicial).

### 3. WhatsApp helper — número hardcoded vs env var

Centralitzem el número a `src/lib/whatsapp.ts` com a constant:

```ts
export const WHATSAPP_NUMBER = "34630893096";
```

Avantatges:
- Build-time constant, sense necessitat de re-deploy quan canvii (en realitat sí cal — però
  com a constant és més senzill que via env var).
- Si en algun moment Sandra té el seu propi número, només cal canviar aquí.
- No té sentit fer-ho via env var: el número apareix a HTML servit a usuaris (no és secret).

Trade-off: si el número canvia, és un commit. Acceptable — passa una vegada.

### 4. Format del missatge prefilled

WhatsApp accepta `?text=<urlencoded>` als URLs `wa.me`. Triem missatges curts (< 50
caràcters) perquè:
- L'usuari els pot editar abans de enviar
- Massa text al wa.me: a vegades WhatsApp web/mobile el trunca o no el carrega bé

Missatges:
- **Header**: "Hola, voldria saber més sobre Auratech."
- **AI page (CTA secundari)**: "Hola Sandra, m'interessa el pilot d'IA per a la meva clínica."
- **Footer**: "Hola, contacto des d'auratech.cat."

### 5. Disclaimer SaaS — format

Ho fem a **dos llocs**:

**(a) Subtitle del hero (Page CMS)**:
Modificar el `subheading` del primer bloc `hero` perquè acabi amb "(pilot — disponibilitat
per demo, contacta'ns per validar el teu cas)".

**(b) Bloc nou al final**, abans del CTA bloc:
Un `rich-text` block amb una secció "Per què parlem de pilot?" amb 3-4 paràgrafs honestos:
- Cada implantació té setup adaptat (integracions diferents per cada clínica)
- L'agent IA aprèn dels casos reals; cal un pilot inicial per validar el flow
- No hi ha autoservei de moment — cal una conversa abans

### 6. GA4 events — typing i fallback

`window.gtag` és global injectat per `<Script>` quan el consent està acceptat. Si l'usuari
ha rebutjat les cookies, `gtag` no existeix. El nostre helper:

```ts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return; // consent denied o no carregat
  window.gtag("event", name, params);
}
```

I sobre el helper específic:

```ts
export const trackContactSubmit = () => trackEvent("contact_form_submit");
export const trackCtaClick = (id: string, location?: string) =>
  trackEvent("cta_click", { cta_id: id, location });
export const trackWhatsappClick = (location?: string) =>
  trackEvent("whatsapp_click", { location });
```

Així cada lloc importa només el helper que necessita.

### 7. Blog content — drafts inicials

Faig drafts de quality "decent però no perfectes" — text amb to B2B sòbri, sense fum,
sense emoji, amb dades concretes del sector i estructura clara (intro + 3-5 seccions +
takeaway).

Llargada per cada:
- **Article 1 (clíniques)**: ~800 paraules. Comercial. CTA al final cap a `/automatitzacions-ia`.
- **Article 2 (RGPD)**: ~600 paraules. Educatiu. CTA cap a `/contacte`.
- **Article 3 (errors IA)**: ~700 paraules. Thought leadership. CTA suau.

L'usuari pot editar al admin si vol afinar el to. La idea és tenir base publicada perquè
el menú "Blog" ja no estigui buit i Sandra pugui passar el link a leads.

Cover images: faig servir les existents:
- Article 1 → `/images/case-iot.jpg` (la mateixa que el case study c5)
- Article 2 → `/images/service-cloud-new.jpg` (cloud + RGPD = compliance temàtica)
- Article 3 → `/images/service-strategy.jpg` (consultoria, errors)

### 8. Author dels posts

Tots tres signats per **Oscar Rovira Tello** (SUPERADMIN). Justificació:
- Sandra encara no és author al sistema (només EDITOR fins que es validi com a content
  creator).
- Oscar té credibilitat tècnica per als 3 articles (especialment l'2 i el 3).
- Si Sandra escriu un en el futur, el model de signatura ja existeix.

### 9. Idiomes — només CA per ara

L'spec del blog no exigeix tradució a tots els idiomes. El resolver tampoc fa fallback
explícit per blog posts (cal verificar). Si una visita en EN demana `/en/blog/<slug>` i
el post només existeix en CA → 404.

**Mitigació pragmàtica**: el seed crea els 3 posts amb `locale: "ca"`. Si en algun moment
volem englobar EN/ES, ho fem amb un seed adicional. La majoria del trànsit és CA/ES, i
ES rebrà el fallback automàtic perquè comparteix arrel cultural amb CA (a la spec de blog,
el resolver fa fallback a CA si no troba el locale demanat — verificar al codi).

## Riscos i mitigacions

| Risc | Probabilitat | Mitigació |
|---|---|---|
| Blog posts trignen massa per a un valor borderline | Mitjana | Drafts de qualitat acceptable; tu pots polir al admin després |
| `gtag` no existeix per consent denied | Alta | Helper amb early return |
| WhatsApp link no obre bé al iOS Safari | Baixa | `wa.me/` URLs són standard i funcionen a iOS desde 2017 |
| Disclaimer espanta visitants | Baixa | Llenguatge honest però no defensiu; subtle |
| Dashboard query falla per BBDD | Baixa | Try/catch amb fallback a empty state |
| Cover images repetides es veuen feo al blog list | Mitjana | Acceptable per arrencar; sustituir amb il·lustracions pròpies en una iteració futura |
