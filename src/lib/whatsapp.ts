/**
 * WhatsApp Business contact for Auratech.
 *
 * Currently routes to Oscar's number. When Sandra obtains her own
 * WhatsApp Business line (and Meta verification for the public profile),
 * change this constant — every link in the codebase rebuilds from here.
 */
export const WHATSAPP_NUMBER = "34630893096";

/**
 * Build a wa.me link with optional pre-filled message. Always returns an
 * https URL safe to put in <a href>.
 */
export function buildWhatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
