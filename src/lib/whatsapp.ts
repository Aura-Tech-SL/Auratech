/**
 * WhatsApp Business contact for Auratech.
 *
 * Routes to Sandra Romero (CCO), the commercial entry point for the
 * AI Automations line and general inbound. Every WhatsApp link in the
 * codebase (header, footer, home AI spotlight, dashboard) rebuilds from
 * this constant — change it here to redirect everything in one go.
 */
export const WHATSAPP_NUMBER = "34611480862";

/**
 * Build a wa.me link with optional pre-filled message. Always returns an
 * https URL safe to put in <a href>.
 */
export function buildWhatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
