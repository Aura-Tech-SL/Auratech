"use client";

import { useEffect } from "react";
import { trackCtaClick, trackWhatsappClick } from "@/lib/analytics/track";

/**
 * Global delegate listener for `data-cta` and `data-cta-location` attributes.
 *
 * Any anchor or button with `data-cta="<id>"` (and optionally
 * `data-cta-location="<where>"`) emits a GA4 `cta_click` event automatically
 * — no need to wire `onClick` per component. The special id `"whatsapp"`
 * also emits the more specific `whatsapp_click` event.
 *
 * Mounted once at the root layout; uses event delegation so it survives
 * route changes without re-binding listeners.
 */
export function CtaTracker() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      const ctaId = el.dataset.cta;
      if (!ctaId) return;
      const location = el.dataset.ctaLocation;
      trackCtaClick(ctaId, location);
      if (ctaId === "whatsapp") {
        trackWhatsappClick(location);
      }
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, []);

  return null;
}
