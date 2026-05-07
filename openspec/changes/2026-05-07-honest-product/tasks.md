## 1. Disclaimer SaaS IA (la més curta — fem-la primer per validar el to)

- [ ] 1.1 Editar `prisma/seed-ai-automations.ts` per afegir un nou bloc `rich-text` al final
  ("Per què parlem de pilot?"). Manté la idempotència del seed.
- [ ] 1.2 Afegir el badge "Pilot — Disponibilitat per demo" via un nou bloc text (o ampliant
  el hero subheading). Decidir al `design.md`.
- [ ] 1.3 Tornar a executar el seed AI a producció.

## 2. WhatsApp Business — header, footer, IA spotlight

- [ ] 2.1 Crear helper `src/lib/whatsapp.ts` amb `buildWhatsappLink(message: string): string`
  i constant `WHATSAPP_NUMBER = "34630893096"`. Centralitzat per a futures rotacions.
- [ ] 2.2 Header (`src/components/layout/header.tsx`): afegir un nou botó al cluster del
  CTA, amb icona WhatsApp (lucide `MessageCircle` o un SVG inline). Missatge: genèric. Es
  rendiritza a desktop i mobile.
- [ ] 2.3 Footer (`src/components/layout/footer.tsx`): afegir un enllaç a la columna de
  contacte (al costat del email i social).
- [ ] 2.4 Home AI Spotlight (`src/components/sections/home-ai-spotlight.tsx`): el CTA
  secundari ja diu "Parla amb Sandra" amb icona MessageCircle — canvi `href` cap a el link
  WhatsApp en lloc del `/contacte?subject=...`. Missatge prefilled específic per IA.
- [ ] 2.5 Pricing block tiers (a través del seed AI): els CTAs dels 3 tiers actualment van a
  `/contacte?subject=Pressupost+IA+...`. Decidir si també apunten a WhatsApp o mantenim
  contact form perquè un pressupost detallat val la pena fer-lo per email. **Decisió al
  design.md: mantenir form per pricing CTAs**, perquè aquí cal recollir context (clínica,
  volum, etc.) que no es donen bé per xat ràpid.
- [ ] 2.6 Tradueix tots els missatges nous a ca/en/es.

## 3. Dashboard real amb empty states

- [ ] 3.1 `src/app/dashboard/page.tsx` — convertir a server component que fa
  `prisma.project.count`, `prisma.invoice.count`, `prisma.message.count` filtrats per
  `userId === session.user.id` (admins veuen 0 — el dashboard és l'espai del **client**, no
  del staff). Mostra els tres counters reals.
- [ ] 3.2 Sota els counters, un bloc "Recent activity" amb fallback a empty state si tots
  els counters són 0: "Aviat tindreu activitat aquí. Per posar el primer projecte en marxa,
  contacta'ns a sandra.romero@auratech.cat o per WhatsApp."
- [ ] 3.3 `src/app/dashboard/projectes/page.tsx` — server component, query real, empty state.
- [ ] 3.4 `src/app/dashboard/projectes/[id]/page.tsx` — server component, query real (verifica
  ownership amb `ownsResource()` del `lib/authz`), 404 si no existeix o no és seu.
- [ ] 3.5 `src/app/dashboard/factures/page.tsx` — query real, empty state.
- [ ] 3.6 Tradueix els empty state strings.

## 4. GA4 conversion events

- [ ] 4.1 Crear `src/lib/analytics/track.ts` amb funcions tipades:
  `trackContactSubmit()`, `trackCtaClick(id: string, location?: string)`,
  `trackWhatsappClick(location?: string)`. Cadascuna és un wrapper sobre `gtag('event', ...)`
  que comprova si `window.gtag` existeix (analytics consent acceptat).
- [ ] 4.2 Connectar `trackContactSubmit()` al `src/app/[locale]/(public)/contacte/page.tsx`
  després d'una resposta exitosa.
- [ ] 4.3 Connectar `trackCtaClick("hero_primary", "home")` als 2 CTAs del hero de la home.
  Connectar als CTAs de la page IA (3 tiers + final CTA).
- [ ] 4.4 Connectar `trackWhatsappClick("header" | "ai_spotlight" | "footer")` als botons
  WhatsApp.
- [ ] 4.5 Verificar al GA4 Realtime que els events arriben (necessita la web amb
  consentiment acceptat i fer els clicks).

## 5. Blog launch — 3 articles

- [ ] 5.1 Escriure els 3 articles en català com a HTML sanititzable (no Markdown — el
  rich-text-block ja està preparat per HTML amb DOMPurify). Cada article a un fitxer
  separat dins `prisma/blog-launch-content/` per claredat:
  - `01-cliniques-perden-cites.html`
  - `02-rgpd-article-9-saas-salut.html`
  - `03-5-errors-projectes-ia-pimes.html`
- [ ] 5.2 Crear `prisma/seed-blog-launch.ts` que llegeix els 3 fitxers HTML i fa upsert dels
  3 BlogPost amb el contingut a un bloc `rich-text` (delete+recreate de blocks per
  idempotència, com vam fer amb les Pages CMS).
- [ ] 5.3 Decidir cover images: usar les existents (`/images/case-*.jpg`) o crear noves?
  **Decisió al design.md: reutilitzar existents**.
- [ ] 5.4 publishedAt graduat: post 1 a fa 3 dies, post 2 a fa 1 dia, post 3 avui. Així la
  cronologia sembla orgànica.
- [ ] 5.5 Author: Oscar (lookup a `prisma.user.findFirst({ where: { role: "SUPERADMIN" }})`).
  Tags rellevants. Category triada per cada (GENERAL / STRATEGY).
- [ ] 5.6 Tradueix només si te'n queda temps; per defecte només CA. La resolver de blog
  ja fa fallback a CA si no hi ha tradució per locale demanat.

## 6. Tasques transversals

- [ ] 6.1 `npx tsc --noEmit` net.
- [ ] 6.2 `npm run build` net.
- [ ] 6.3 Commits separats per secció (cada § un commit).
- [ ] 6.4 Push a GitHub.
- [ ] 6.5 Deploy: pull al servidor, rebuild backend, executar:
  - `seed-ai-automations.ts` (per al disclaimer)
  - `seed-blog-launch.ts` (per als 3 articles)
- [ ] 6.6 Smoke tests:
  - `/dashboard` com a CLIENT autèntic (oscar.rovira@auratech.cat encara és SUPERADMIN, però
    pots provar amb una sessió incognito autenticant amb un compte test si cal).
  - WhatsApp link al header → obre WhatsApp Web amb missatge prefilled.
  - `/automatitzacions-ia` mostra el badge i el bloc disclaimer.
  - `/blog` llista 3 articles. Click a un → renderitza el contingut.
  - GA4 Realtime mostra els events.
- [ ] 6.7 Moure el change a `openspec/changes/archive/`.
