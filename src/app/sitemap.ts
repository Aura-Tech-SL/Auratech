import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://auratech.cat';

const staticPages = [
  '',
  '/serveis',
  '/projectes',
  '/labs',
  '/sobre',
  '/blog',
  '/contacte',
  '/casos',
  '/avis-legal',
  '/privacitat',
  '/cookies',
];

function buildAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages × locales
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: buildAlternates(page),
        },
      });
    }
  }

  // Dynamic blog posts
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    for (const post of posts) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: {
            languages: buildAlternates(`/blog/${post.slug}`),
          },
        });
      }
    }
  } catch {
    // DB not available — skip blog posts
  }

  // Dynamic CMS pages
  try {
    const pages = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        slug: { notIn: ['home', 'sobre'] },
      },
      select: { slug: true, updatedAt: true },
    });

    for (const page of pages) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/${page.slug}`,
          lastModified: page.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: buildAlternates(`/${page.slug}`),
          },
        });
      }
    }
  } catch {
    // DB not available — skip CMS pages
  }

  return entries;
}
