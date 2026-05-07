## ADDED Requirements

### Requirement: Three launch articles seeded

The blog SHALL be seeded with three published articles in Catalan covering
the three positioning angles of the company:

1. **"Per què les clíniques estètiques perden cites a la nit"** — sector
   pain-point article, ~800 words, links to `/automatitzacions-ia` at the
   end. Category: `GENERAL`. Tags: `["IA", "WhatsApp", "Clíniques estètiques"]`.

2. **"Compliment RGPD per a SaaS de salut: l'Article 9 sense pànic"** —
   educational article, ~600 words, links to `/contacte`. Category:
   `STRATEGY`. Tags: `["RGPD", "Compliance", "Salut"]`.

3. **"5 errors típics que veiem als projectes d'IA en pimes"** — thought
   leadership, ~700 words. Category: `STRATEGY`. Tags:
   `["IA", "Pimes", "Estratègia"]`.

Author: the SUPERADMIN user (Oscar). `publishedAt` SHALL be staggered so
the chronology looks organic: post 1 three days before the seed run, post
2 one day before, post 3 the day of the seed run.

The seed SHALL be idempotent: re-running it SHALL update existing rows
with matching slug+locale rather than create duplicates, and SHALL replace
the rich-text block content (delete-then-create) so copy edits via the
admin UI can still be made between runs and the seed only "snaps back" if
deliberately re-executed.

#### Scenario: Blog list shows three articles

- **WHEN** a visitor opens `/ca/blog`
- **THEN** the page SHALL list the three seeded articles
- **AND** they SHALL appear in reverse chronological order (post 3 first)

#### Scenario: Article opens with rich-text content

- **WHEN** a visitor opens `/ca/blog/per-que-cliniques-perden-cites`
- **THEN** the article SHALL render with title, author, date, and the
  rich-text body sanitised by DOMPurify
- **AND** the closing paragraph SHALL link to `/ca/automatitzacions-ia`

#### Scenario: Re-running the seed is safe

- **WHEN** an operator runs `npx tsx prisma/seed-blog-launch.ts` after the
  articles were edited via the admin UI
- **THEN** the script SHALL upsert each post by `(slug, locale)` and
  reset its blocks, returning the canonical content of the seed
- **AND** no duplicate `BlogPost` rows SHALL be created
