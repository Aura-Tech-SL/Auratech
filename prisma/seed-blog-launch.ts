/**
 * Idempotent seed for the three launch blog posts in CA / EN / ES.
 *
 * Reads HTML content from prisma/blog-launch-content/*.html and upserts each
 * post by (slug, locale). Recreates the rich-text block on every run so
 * editing via the admin UI is overwritten only when the script is
 * re-executed deliberately.
 *
 * Usage:
 *   docker compose exec backend npx -y prisma@5.22.0 generate
 *   docker compose exec -T backend npx tsx prisma/seed-blog-launch.ts
 */
import { PrismaClient, type BlogCategory } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface LocaleSeed {
  title: string;
  slug: string;
  excerpt: string;
  contentFile: string;
  tags: string[];
}

interface PostSeed {
  /** Stable identifier across locales — used only for logging. */
  ref: string;
  coverImage: string;
  category: BlogCategory;
  daysAgo: number;
  readTime: number;
  locales: {
    ca: LocaleSeed;
    en: LocaleSeed;
    es: LocaleSeed;
  };
}

const POSTS: PostSeed[] = [
  {
    ref: "clinics-missed-bookings",
    coverImage: "/images/case-iot.jpg",
    category: "GENERAL" as BlogCategory,
    daysAgo: 3,
    readTime: 5,
    locales: {
      ca: {
        slug: "per-que-cliniques-perden-cites",
        title: "Per què les clíniques estètiques perden cites a la nit",
        excerpt:
          "Una clínica mitjana rep 8-15 missatges WhatsApp fora d'horari cada nit. La majoria es responen tard, ja al matí. Aquest és el cost real i com es resol amb un agent d'IA.",
        contentFile: "01-cliniques-perden-cites.html",
        tags: ["IA", "WhatsApp", "Clíniques estètiques"],
      },
      en: {
        slug: "why-clinics-miss-bookings-at-night",
        title: "Why aesthetic clinics miss bookings at night",
        excerpt:
          "An average clinic gets 8-15 WhatsApp messages outside business hours every night. Most are answered late, well into the next morning. This is the real cost — and how an AI agent solves it.",
        contentFile: "01-clinics-missed-bookings.html",
        tags: ["AI", "WhatsApp", "Aesthetic clinics"],
      },
      es: {
        slug: "por-que-clinicas-pierden-citas",
        title: "Por qué las clínicas estéticas pierden citas por la noche",
        excerpt:
          "Una clínica media recibe 8-15 mensajes de WhatsApp fuera de horario cada noche. La mayoría se responden tarde, ya por la mañana. Este es el coste real y cómo se resuelve con un agente de IA.",
        contentFile: "01-clinicas-pierden-citas.html",
        tags: ["IA", "WhatsApp", "Clínicas estéticas"],
      },
    },
  },
  {
    ref: "gdpr-article-9-health",
    coverImage: "/images/service-cloud-new.jpg",
    category: "STRATEGY" as BlogCategory,
    daysAgo: 1,
    readTime: 4,
    locales: {
      ca: {
        slug: "rgpd-article-9-saas-salut",
        title: "Compliment RGPD per a SaaS de salut: l'Article 9 sense pànic",
        excerpt:
          "Tres preguntes que has de poder respondre abans de signar amb un proveïdor SaaS que toqui dades de salut: on s'emmagatzemen, hi ha DPA, què passa amb l'esborrat.",
        contentFile: "02-rgpd-article-9-saas-salut.html",
        tags: ["RGPD", "Compliance", "Salut"],
      },
      en: {
        slug: "gdpr-article-9-health-saas",
        title: "GDPR for health SaaS: Article 9 without the panic",
        excerpt:
          "Three questions you must be able to answer before signing with a SaaS vendor that touches health data: where it's stored, whether there's a DPA, what happens on erasure.",
        contentFile: "02-gdpr-article-9-health-saas.html",
        tags: ["GDPR", "Compliance", "Health"],
      },
      es: {
        slug: "rgpd-articulo-9-saas-salud",
        title: "Cumplimiento RGPD para SaaS de salud: el Artículo 9 sin pánico",
        excerpt:
          "Tres preguntas que debes poder responder antes de firmar con un proveedor SaaS que toque datos de salud: dónde se almacenan, si hay DPA, qué pasa con el borrado.",
        contentFile: "02-rgpd-articulo-9-saas-salud.html",
        tags: ["RGPD", "Compliance", "Salud"],
      },
    },
  },
  {
    ref: "5-mistakes-ai-projects",
    coverImage: "/images/service-strategy.jpg",
    category: "STRATEGY" as BlogCategory,
    daysAgo: 0,
    readTime: 5,
    locales: {
      ca: {
        slug: "5-errors-projectes-ia-pimes",
        title: "5 errors típics que veiem als projectes d'IA en pimes",
        excerpt:
          "El 77% dels projectes d'IA a empreses espanyoles no arriben a producció. Els errors no són tecnològics — són d'enfocament, expectatives i seguiment.",
        contentFile: "03-5-errors-projectes-ia-pimes.html",
        tags: ["IA", "Pimes", "Estratègia"],
      },
      en: {
        slug: "5-mistakes-ai-projects-smbs",
        title: "5 typical mistakes we see in SMB AI projects",
        excerpt:
          "77% of AI projects at Spanish companies don't reach production. The mistakes aren't technological — they're about framing, expectation and follow-up.",
        contentFile: "03-5-mistakes-ai-projects-smbs.html",
        tags: ["AI", "SMB", "Strategy"],
      },
      es: {
        slug: "5-errores-proyectos-ia-pymes",
        title: "5 errores típicos que vemos en proyectos de IA en pymes",
        excerpt:
          "El 77% de los proyectos de IA en empresas españolas no llegan a producción. Los errores no son tecnológicos — son de enfoque, expectativas y seguimiento.",
        contentFile: "03-5-errores-proyectos-ia-pymes.html",
        tags: ["IA", "Pymes", "Estrategia"],
      },
    },
  },
];

const CONTENT_DIR = join(__dirname, "blog-launch-content");
const LOCALES = ["ca", "en", "es"] as const;

async function main() {
  // Author = first SUPERADMIN user (Oscar)
  const author = await prisma.user.findFirst({
    where: { role: "SUPERADMIN" },
    orderBy: { createdAt: "asc" },
  });
  if (!author) {
    throw new Error(
      "No SUPERADMIN user found. Run main seed or promote-users.ts first.",
    );
  }

  for (const post of POSTS) {
    const publishedAt = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000);

    for (const locale of LOCALES) {
      const l = post.locales[locale];
      const content = readFileSync(join(CONTENT_DIR, l.contentFile), "utf-8");

      const blogPost = await prisma.blogPost.upsert({
        where: { slug_locale: { slug: l.slug, locale } },
        update: {
          title: l.title,
          excerpt: l.excerpt,
          coverImage: post.coverImage,
          tags: l.tags,
          category: post.category,
          readTime: post.readTime,
          status: "PUBLISHED",
          publishedAt,
          translationKey: post.ref,
        },
        create: {
          title: l.title,
          slug: l.slug,
          locale,
          excerpt: l.excerpt,
          coverImage: post.coverImage,
          tags: l.tags,
          category: post.category,
          readTime: post.readTime,
          status: "PUBLISHED",
          publishedAt,
          authorId: author.id,
          translationKey: post.ref,
        },
      });

      // Recreate the rich-text block (idempotent)
      await prisma.block.deleteMany({ where: { blogPostId: blogPost.id } });
      await prisma.block.create({
        data: {
          type: "rich-text",
          order: 0,
          blogPostId: blogPost.id,
          data: { content },
        },
      });

      console.log(
        `[seed-blog] ${post.ref} (${locale}) ${l.slug} — published ${post.daysAgo}d ago`,
      );
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("[seed-blog] Done.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
