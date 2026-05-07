## Why

L'audit professional del 2026-05-06 va identificar tres troballes que **fan que el web
sembli vaporware** quan en realitat la base operativa és sòlida:

1. **El dashboard de client (`/dashboard`) és pur mock** amb números hardcoded ("3 projectes
   actius", "2 factures pendents"). Si Sandra fa onboarding d'un client real, la primera
   pantalla que veu el client és una mentida.
2. **El producte SaaS d'IA per a clíniques estètiques no existeix funcional encara**, però
   la pàgina `/automatitzacions-ia` el presenta com si fos comprable avui. Risc de perdre
   confiança quan un visitant clica "Pressupost" i descobreix que és un pilot a fer a mida.
3. **El producte CORE és WhatsApp però la web no té cap link directe a WhatsApp**. Ironia
   visible. Sandra no té com a Sandra rebre un xat directe sense passar pel form.

També hi ha dues mancances més que aprofitem el mateix paquet per a resoldre:

4. **Sense events GA4 de conversió** — sabem que entren visites però no quins CTAs
   converteixen. Cec sobre el funnel.
5. **Blog buit** — el menú "Blog" porta a una pàgina sense articles publicats, i això resta
   credibilitat (mostra que el menú existeix però el contingut no).

Tot això es resol en una setmana de feina coordinada — sense res de magia, només sinceritat
operativa i 3 articles de copy.

## What Changes

### Dashboard de client honest amb dades reals

- `/dashboard` (índex) i `/dashboard/projectes`, `/dashboard/factures`: substituir el mock
  per queries reals filtrades per `session.user.id`. Quan el comptador és zero, mostrar un
  empty state informatiu ("Aviat tindreu activitat aquí. Contacta'ns a
  sandra.romero@auratech.cat per posar el primer projecte en marxa.") en lloc de zeros
  silenciosos o números fake.
- `/dashboard/missatges` i `/dashboard/perfil` ja funcionen amb dades reals — no es toquen.

### WhatsApp Business link

- Botó al header (al costat del CTA "Parlem", visible sempre): icona WhatsApp + missatge
  pre-omplert "Hola, voldria saber més sobre Auratech".
- CTA secundari prominent a la Page CMS d'IA (`/automatitzacions-ia`): missatge pre-omplert
  específic "Hola Sandra, m'interessa el pilot d'IA per a la meva clínica estètica."
- Botó al footer: enllaç simple a WhatsApp (alineat amb els altres canals).
- Número: **+34 630 893 096** (Oscar; quan Sandra tingui WhatsApp Business propi, swap).

### Disclaimer SaaS IA

- Badge subtil sota l'eyebrow actual a la pàgina IA: "Pilot — Disponibilitat per demo".
- Bloc nou al final de la pàgina ("Per què parlem de pilot?") que explica honestament que
  cada implantació té setup adaptat, validació de cas d'ús, i no hi ha autoservei.

### GA4 events de conversió

- `contact_form_submit` — al `POST /api/contacte` exitós, des del component contact form
  via `gtag('event', ...)`.
- `cta_click` amb `cta_id` (Hero primary, Hero secondary, AI tier 1/2/3, Talk to Sandra,
  WhatsApp header, etc.) — disparat al click dels botons rellevants.
- `whatsapp_click` (cas particular de `cta_click` amb `cta_id="whatsapp"`) — explícit per
  poder filtrar al GA4 Explorations.
- Helper compartit `lib/analytics/track.ts` perquè cada component no hagi de saber el
  detall de `gtag()`.

### Tres articles de blog inicials

- Crear 3 BlogPost a la BBDD via seed idempotent (`prisma/seed-blog-launch.ts`):
  1. **"Per què les clíniques estètiques perden cites a la nit"** (~800 paraules)
  2. **"Compliment RGPD per a SaaS de salut: l'Article 9 sense pànic"** (~600 paraules)
  3. **"5 errors típics que veiem als projectes d'IA en pimes"** (~700 paraules)
- Cada article: títol + excerpt + cover image (placeholders existents si cal) + 1 bloc
  `rich-text` amb el contingut HTML sanititzat (l'editor pot iterar després via admin).
- Author: Oscar (admin SUPERADMIN). Tags rellevants. Categoria adequada.
- Status `PUBLISHED`. `publishedAt` graduat (post 1: -3 dies, post 2: -1 dia, post 3: avui)
  perquè la cronologia sembli orgànica.

## Impact

### Affected specs
- `client-portal` — replace mock data with real queries + empty states.
- `public-website` — add WhatsApp link to header/footer/AI page; add SaaS disclaimer.
- `analytics` — add three conversion events.
- `blog` — three launch articles seeded.

### Affected code
- `src/app/dashboard/page.tsx` — server component amb counters reals.
- `src/app/dashboard/projectes/page.tsx`, `[id]/page.tsx` — connect to BBDD; empty state.
- `src/app/dashboard/factures/page.tsx` — connect to BBDD; empty state.
- `src/components/layout/header.tsx` — afegir botó WhatsApp.
- `src/components/layout/footer.tsx` — afegir link WhatsApp.
- `src/components/sections/home-ai-spotlight.tsx` — CTA secundari WhatsApp.
- `prisma/seed-ai-automations.ts` — afegir disclaimer block; reseed.
- `src/components/analytics/analytics-provider.tsx` — exposar `gtag` typed; carregar event helpers.
- `src/lib/analytics/track.ts` — helpers nous.
- `prisma/seed-blog-launch.ts` — nou.

### Out of scope (deferred)

- Construcció completa del client portal amb CRUD de projects/invoices — quan signis primer
  pilot real (proper change).
- Sandra propi número WhatsApp Business + verificat per Meta — quan toqui infraestructura.
- Tradueix els 3 blog posts a EN/ES — versió CA primer; les altres locales reben fallback al
  CA segons la lògica del resolver.
