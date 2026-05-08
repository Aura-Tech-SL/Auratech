import { NextResponse } from "next/server";

// Some SEO crawlers request `/sitemap-index.xml` even when our manifest is at
// `/sitemap.xml`. 301 them so they land on the real sitemap and stop firing
// "Cannot find module './sitemap-index.xml.json'" 404s in Sentry.
//
// Hardcoded to the public host because `request.url` resolves to the internal
// docker hostname when running behind nginx/proxy.
export function GET() {
  return NextResponse.redirect("https://auratech.cat/sitemap.xml", 301);
}
