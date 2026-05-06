import { Resend } from "resend";
import type { ContactFormData } from "@/lib/validations/contact";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM || "Auratech <noreply@auratech.cat>";
const notifyAddress = process.env.CONTACT_NOTIFY_EMAIL || "oscar.rovira@auratech.cat";

const resend = apiKey ? new Resend(apiKey) : null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactNotification(data: ContactFormData) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping notification");
    return { skipped: true };
  }

  const safe = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    phone: data.phone ? escapeHtml(data.phone) : "",
    subject: escapeHtml(data.subject),
    message: escapeHtml(data.message).replace(/\n/g, "<br>"),
  };

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px;">
      <h2 style="color: #111;">Nou missatge de contacte</h2>
      <p><strong>Nom:</strong> ${safe.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${safe.email}">${safe.email}</a></p>
      ${safe.phone ? `<p><strong>Telèfon:</strong> ${safe.phone}</p>` : ""}
      <p><strong>Assumpte:</strong> ${safe.subject}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
      <p style="white-space: pre-wrap;">${safe.message}</p>
    </div>
  `;

  const text = [
    `Nou missatge de contacte`,
    ``,
    `Nom: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Telèfon: ${data.phone}` : null,
    `Assumpte: ${data.subject}`,
    ``,
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from: fromAddress,
    to: notifyAddress,
    replyTo: data.email,
    subject: `[Contacte] ${data.subject}`,
    html,
    text,
  });

  if (result.error) {
    throw new Error(`Resend error: ${result.error.message}`);
  }

  return { id: result.data?.id };
}
