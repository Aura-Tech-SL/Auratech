import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

// Bot/crawler probes that resolve to "Cannot find module './<path>.json'"
// inside Next's standalone runtime. They're 404s mis-typed as server errors;
// drop them so the Sentry inbox stays signal-rich.
const NOISE_MODULE_PATHS = [
  "./sitemap-index.xml.json",
  "./.vscode.json",
];

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    enabled: process.env.NODE_ENV === "production",
    beforeSend(event, hint) {
      const err = hint?.originalException;
      const message =
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : undefined) ||
        event.message ||
        "";
      if (
        message.startsWith("Cannot find module ") &&
        NOISE_MODULE_PATHS.some((p) => message.includes(`'${p}'`))
      ) {
        return null;
      }
      return event;
    },
  });
}
