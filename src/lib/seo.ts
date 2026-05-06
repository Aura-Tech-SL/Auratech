import type { Metadata } from "next";
import { locales, defaultLocale } from "@/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://auratech.cat";

/**
 * Build canonical + hreflang alternates for a given page path.
 *
 * @param path  Path WITHOUT locale prefix or trailing slash. Use "" for the
 *              homepage. Examples: "", "/serveis", "/blog/my-post".
 * @param locale Current locale rendering the page.
 */
export function buildLocaleAlternates(
  path: string,
  locale: string
): NonNullable<Metadata["alternates"]> {
  const cleanPath = path && !path.startsWith("/") ? `/${path}` : path;
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}/${l}${cleanPath}`;
  }
  languages["x-default"] = `${SITE_URL}/${defaultLocale}${cleanPath}`;
  return {
    canonical: `${SITE_URL}/${locale}${cleanPath}`,
    languages,
  };
}

export { SITE_URL };
