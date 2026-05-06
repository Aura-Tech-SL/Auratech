type JsonLdData = Record<string, unknown>;

function JsonLdScript({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// --- Organization ---

export function OrganizationJsonLd({
  sameAs = [],
}: {
  sameAs?: string[];
} = {}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Auratech',
        url: 'https://auratech.cat',
        logo: 'https://auratech.cat/favicon.svg',
        description:
          'Auratech is a B2B technology company based in Vic, Catalunya, specializing in software development and digital transformation.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Vic',
          addressRegion: 'Barcelona, Catalunya',
          addressCountry: 'ES',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@auratech.cat',
          contactType: 'customer service',
        },
        sameAs,
      }}
    />
  );
}

// --- LocalBusiness ---

export function LocalBusinessJsonLd({
  sameAs = [],
}: {
  sameAs?: string[];
} = {}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Auratech',
        url: 'https://auratech.cat',
        logo: 'https://auratech.cat/favicon.svg',
        description:
          'Auratech is a B2B technology company based in Vic, Catalunya, specializing in software development and digital transformation.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Vic',
          addressRegion: 'Barcelona, Catalunya',
          addressCountry: 'ES',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@auratech.cat',
          contactType: 'customer service',
        },
        openingHours: 'Mo-Fr 09:00-18:00',
        sameAs,
      }}
    />
  );
}

// --- WebSite ---

export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Auratech',
        url: 'https://auratech.cat',
        inLanguage: ['en', 'ca', 'es'],
      }}
    />
  );
}

// --- Article ---

interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  authorName: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  wordCount?: number;
  category?: string;
  keywords?: string[];
}

export function ArticleJsonLd({
  title,
  description,
  url,
  authorName,
  datePublished,
  dateModified,
  image,
  wordCount,
  category,
  keywords,
}: ArticleJsonLdProps) {
  const data: JsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    author: {
      '@type': 'Person',
      name: authorName,
    },
  };

  if (datePublished) data.datePublished = datePublished;
  if (dateModified) data.dateModified = dateModified;
  if (image) data.image = image;
  if (wordCount) data.wordCount = wordCount;
  if (category) data.articleSection = category;
  if (keywords) data.keywords = keywords;

  return <JsonLdScript data={data} />;
}

// --- Service ---

interface ServiceJsonLdProps {
  name: string;
  description: string;
}

export function ServiceJsonLd({ name, description }: ServiceJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        provider: {
          '@type': 'Organization',
          name: 'Auratech',
          url: 'https://auratech.cat',
        },
      }}
    />
  );
}

// --- FAQPage ---

interface FAQPageJsonLdProps {
  items: Array<{ question: string; answer: string }>;
}

export function FAQPageJsonLd({ items }: FAQPageJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  );
}

// --- Breadcrumb ---

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
