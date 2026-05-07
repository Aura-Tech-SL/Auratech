/**
 * GA4 conversion event helpers.
 *
 * No-op silently when `window.gtag` isn't available (analytics consent
 * denied, script not loaded yet, SSR). Never throws and never logs to the
 * console — calling these from any component is safe.
 *
 * Event taxonomy:
 *   - contact_form_submit  → fired once when /api/contacte returns 201
 *   - cta_click            → tracked CTAs across the site (cta_id required)
 *   - whatsapp_click       → any WhatsApp button (location optional)
 *
 * Custom params chosen to match the GA4 default events surface so they
 * appear in Reports without further configuration.
 */

// `window.gtag` is declared in src/components/analytics/google-analytics.tsx.
// We just call it defensively here.
function emit(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // never let analytics break the page
  }
}

export function trackContactSubmit() {
  emit("contact_form_submit");
}

export function trackCtaClick(ctaId: string, location?: string) {
  emit("cta_click", { cta_id: ctaId, ...(location && { location }) });
}

export function trackWhatsappClick(location?: string) {
  emit("whatsapp_click", location ? { location } : {});
}
