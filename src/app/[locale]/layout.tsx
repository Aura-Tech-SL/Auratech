import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const meta = messages.meta;

  const ogLocale =
    locale === 'ca' ? 'ca_ES' : locale === 'es' ? 'es_ES' : 'en_US';
  const altLocales = ['en_US', 'ca_ES', 'es_ES'].filter((l) => l !== ogLocale);

  return {
    title: {
      default: meta.homeTitle,
      template: '%s | Auratech',
    },
    description: meta.homeDesc,
    authors: [{ name: 'Auratech' }],
    openGraph: {
      type: 'website' as const,
      locale: ogLocale,
      url: `https://auratech.cat/${locale}`,
      siteName: 'Auratech',
      title: meta.homeTitle,
      description: meta.homeDesc,
      images: [{ url: 'https://auratech.cat/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: meta.homeTitle,
      description: meta.homeDesc,
      images: ['https://auratech.cat/og-image.png'],
    },
    alternates: {
      canonical: `https://auratech.cat/${locale}`,
      languages: {
        en: 'https://auratech.cat/en',
        ca: 'https://auratech.cat/ca',
        es: 'https://auratech.cat/es',
        'x-default': 'https://auratech.cat/es',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      {children}
    </NextIntlClientProvider>
  );
}
