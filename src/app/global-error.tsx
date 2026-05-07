"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(225, 15%, 6%)",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "Inter, system-ui, sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Alguna cosa ha fallat
          </h1>
          <p style={{ opacity: 0.6, marginBottom: "1.5rem" }}>
            L&apos;error s&apos;ha registrat. Torna a carregar la pàgina.
          </p>
          <a
            href="/"
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Tornar a l&apos;inici
          </a>
        </div>
      </body>
    </html>
  );
}
