"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
    // Enable GA
    if (typeof window !== "undefined") {
      (window as any)["ga-disable-G-B42VZG6JKF"] = false;
    }
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
    // Disable GA
    if (typeof window !== "undefined") {
      (window as any)["ga-disable-G-B42VZG6JKF"] = true;
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl surface border border-border rounded-xl p-6 shadow-2xl">
        <p className="text-sm text-foreground/60 leading-relaxed mb-4">
          {t("bannerText")}{" "}
          <Link
            href="/privacitat"
            className="text-accent hover:underline"
          >
            {t("moreInfo")}
          </Link>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={reject}
            className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 border border-border rounded-md text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            {t("reject")}
          </button>
          <button
            onClick={accept}
            className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
