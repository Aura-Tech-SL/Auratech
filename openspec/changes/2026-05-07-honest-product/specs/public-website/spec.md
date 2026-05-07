## ADDED Requirements

### Requirement: WhatsApp Business contact channel

The public website SHALL expose a direct WhatsApp Business contact at three
locations:

- **Header**, in the right-side cluster next to the "Parlem" CTA, visible
  on both desktop and mobile menus.
- **Footer**, alongside email and social links.
- **Page CMS `/automatitzacions-ia`**, as the secondary CTA in the AI
  spotlight (replacing the current `/contacte?subject=...` deep link for
  this specific button — pricing-tier CTAs continue to point to the form).

The link target SHALL be `https://wa.me/<NUMBER>?text=<URL_ENCODED_MESSAGE>`
where `<NUMBER>` comes from the centralised constant in `src/lib/whatsapp.ts`
and `<MESSAGE>` is contextual:

| Location | Prefilled message |
|---|---|
| Header | "Hola, voldria saber més sobre Auratech." |
| Footer | "Hola, contacto des d'auratech.cat." |
| AI spotlight | "Hola Sandra, m'interessa el pilot d'IA per a la meva clínica." |

Currently the number is **+34 630 893 096** (Oscar). When Sandra obtains
her own WhatsApp Business line, only `WHATSAPP_NUMBER` in
`src/lib/whatsapp.ts` needs to change.

#### Scenario: Header WhatsApp button opens WhatsApp

- **WHEN** a visitor clicks the WhatsApp icon in the header
- **THEN** the browser SHALL navigate to `https://wa.me/34630893096?text=...`
- **AND** the prefilled text SHALL be the URL-encoded form of "Hola,
  voldria saber més sobre Auratech."

#### Scenario: AI spotlight CTA opens contextual chat

- **WHEN** a visitor clicks "Parla amb Sandra" in the AI spotlight section
  on the homepage
- **THEN** the browser SHALL open WhatsApp with the message tailored for
  the AI offering

### Requirement: AI product is presented honestly as a pilot

The Page CMS `/automatitzacions-ia` SHALL clearly communicate that the
product is currently in pilot stage and not available as self-service. The
disclaimer is twofold:

- The hero subheading SHALL include parenthetical text such as "(pilot —
  disponibilitat per demo, contacta'ns per validar el teu cas)".
- A dedicated `rich-text` block titled "Per què parlem de pilot?" near the
  end of the page SHALL explain in 3-4 short paragraphs that:
  1. Each clinic implementation has bespoke setup (different calendar tools,
     different copy register, different pre-treatment protocols).
  2. The AI agent learns from real cases — a pilot phase is part of how the
     system gets reliable for that specific clinic.
  3. There is no self-service signup today; every onboarding goes through a
     conversation with Sandra.

#### Scenario: Visitor reading the AI page sees the disclaimer

- **WHEN** a visitor opens `/automatitzacions-ia` (any locale)
- **THEN** the hero subheading SHALL include the pilot caveat in
  parentheses
- **AND** the page SHALL contain a section titled "Per què parlem de
  pilot?" (or its localised equivalent) before the final CTA

### Requirement: Pricing tier CTAs go to the contact form, not WhatsApp

The three pricing tier CTAs on `/automatitzacions-ia` (Starter / Pro /
Clinic) SHALL link to `/contacte?subject=...` and NOT to WhatsApp.

(Rationale: pricing requires context — clinic size, calendar tool, current
volume — that is captured better in a structured form than a chat message.
The form persists to the database and triggers Sandra's notification email;
WhatsApp only reaches one device.)

#### Scenario: Tier CTA opens the contact form

- **WHEN** a visitor clicks "Demana pressupost Pro"
- **THEN** the browser SHALL navigate to `/contacte` with `subject` query
  parameter prefilled
- **AND** the visitor's contact form SHALL appear with that subject
  pre-populated
