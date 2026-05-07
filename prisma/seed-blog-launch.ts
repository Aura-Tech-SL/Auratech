/**
 * Idempotent seed for the three launch blog posts.
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

interface PostSeed {
  slug: string;
  title: string;
  excerpt: string;
  contentFile: string;
  coverImage: string;
  tags: string[];
  category: BlogCategory;
  /** Days before "now" when this post was published — for organic chronology. */
  daysAgo: number;
  readTime: number;
}

const POSTS: PostSeed[] = [
  {
    slug: "per-que-cliniques-perden-cites",
    title: "Per què les clíniques estètiques perden cites a la nit",
    excerpt:
      "Una clínica mitjana rep 8-15 missatges WhatsApp fora d'horari cada nit. La majoria es responen tard, ja al matí. Aquest és el cost real i com es resol amb un agent d'IA.",
    contentFile: "01-cliniques-perden-cites.html",
    coverImage: "/images/case-iot.jpg",
    tags: ["IA", "WhatsApp", "Clíniques estètiques"],
    category: "GENERAL" as BlogCategory,
    daysAgo: 3,
    readTime: 5,
  },
  {
    slug: "rgpd-article-9-saas-salut",
    title: "Compliment RGPD per a SaaS de salut: l'Article 9 sense pànic",
    excerpt:
      "Tres preguntes que has de poder respondre abans de signar amb un proveïdor SaaS que toqui dades de salut: on s'emmagatzemen, hi ha DPA, què passa amb l'esborrat.",
    contentFile: "02-rgpd-article-9-saas-salut.html",
    coverImage: "/images/service-cloud-new.jpg",
    tags: ["RGPD", "Compliance", "Salut"],
    category: "STRATEGY" as BlogCategory,
    daysAgo: 1,
    readTime: 4,
  },
  {
    slug: "5-errors-projectes-ia-pimes",
    title: "5 errors típics que veiem als projectes d'IA en pimes",
    excerpt:
      "El 77% dels projectes d'IA a empreses espanyoles no arriben a producció. Els errors no són tecnològics — són d'enfocament, expectatives i seguiment.",
    contentFile: "03-5-errors-projectes-ia-pimes.html",
    coverImage: "/images/service-strategy.jpg",
    tags: ["IA", "Pimes", "Estratègia"],
    category: "STRATEGY" as BlogCategory,
    daysAgo: 0,
    readTime: 5,
  },
];

const CONTENT_DIR = join(__dirname, "blog-launch-content");

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
    const content = readFileSync(join(CONTENT_DIR, post.contentFile), "utf-8");
    const publishedAt = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000);

    const blogPost = await prisma.blogPost.upsert({
      where: { slug_locale: { slug: post.slug, locale: "ca" } },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        category: post.category,
        readTime: post.readTime,
        status: "PUBLISHED",
        publishedAt,
      },
      create: {
        title: post.title,
        slug: post.slug,
        locale: "ca",
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        category: post.category,
        readTime: post.readTime,
        status: "PUBLISHED",
        publishedAt,
        authorId: author.id,
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
      `[seed-blog] ${post.slug} (${blogPost.id}) — published ${post.daysAgo}d ago`,
    );
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
