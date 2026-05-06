import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Auratech").slice(0, 120);
  const subtitle = (searchParams.get("subtitle") || "").slice(0, 200);
  const badge = (searchParams.get("badge") || "").slice(0, 30);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0e1a 0%, #0f1623 50%, #0a0e1a 100%)",
          position: "relative",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Glow accent — top right */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)",
          }}
        />
        {/* Glow accent — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo / brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.6)",
            }}
          />
          <span
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Auratech
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Optional badge */}
        {badge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid rgba(56, 189, 248, 0.4)",
              background: "rgba(56, 189, 248, 0.1)",
              alignSelf: "flex-start",
              zIndex: 1,
            }}
          >
            <span
              style={{
                color: "#38bdf8",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            color: "#fff",
            fontSize: title.length > 50 ? 64 : 80,
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            zIndex: 1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.3,
              marginTop: 24,
              maxWidth: 1000,
              zIndex: 1,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Footer URL */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "rgba(56, 189, 248, 0.7)",
              fontSize: 18,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
            }}
          >
            auratech.cat
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
