/**
 * RFC 6238 TOTP implementation using Node's built-in crypto.
 * Compatible with Google Authenticator, Authy, 1Password, and any standard
 * authenticator app.
 *
 * Defaults: HMAC-SHA1, 6-digit codes, 30-second time step (industry default).
 */
import { createHmac, randomBytes } from "crypto";

const DEFAULT_DIGITS = 6;
const DEFAULT_PERIOD = 30; // seconds

/* ── Base32 (RFC 4648, no padding) ────────────────────────────────── */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(str: string): Buffer {
  const cleaned = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

/* ── Secret + URI ────────────────────────────────────────────────── */

/** Generate a fresh 16-byte (128-bit) base32 TOTP secret. */
export function generateSecret(): string {
  return base32Encode(randomBytes(16));
}

/**
 * Build the otpauth URL that authenticator apps consume to set up the entry.
 * Example: otpauth://totp/Auratech:oscar@auratech.cat?secret=ABCD&issuer=Auratech
 */
export function generateOtpAuthUrl(
  secret: string,
  account: string,
  issuer = "Auratech",
): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DEFAULT_DIGITS),
    period: String(DEFAULT_PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/* ── HOTP / TOTP core ────────────────────────────────────────────── */

function hotp(secret: Buffer, counter: number, digits: number): string {
  // 8-byte big-endian counter. JS Number is safe up to 2^53; the time-step
  // counter for the year 2026 is ~6e7, well within range.
  const counterBuf = Buffer.alloc(8);
  // Write the lower 32 bits at offset 4; the upper 32 stay zero (will overflow
  // around year 4226 — not our problem).
  counterBuf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac("sha1", secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binary % 10 ** digits;
  return otp.toString().padStart(digits, "0");
}

/**
 * Verify a 6-digit TOTP code with ±1 window tolerance (60s skew accepted).
 *
 * @param secret  Base32-encoded shared secret.
 * @param code    User-entered 6-digit code (whitespace tolerated).
 * @param now     Override current time for testing.
 */
export function verifyTotp(
  secret: string,
  code: string,
  now: number = Date.now(),
): boolean {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;

  const decoded = base32Decode(secret);
  if (decoded.length === 0) return false;

  const counter = Math.floor(now / 1000 / DEFAULT_PERIOD);
  for (const offset of [-1, 0, 1]) {
    const expected = hotp(decoded, counter + offset, DEFAULT_DIGITS);
    if (timingSafeEqual(cleaned, expected)) return true;
  }
  return false;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/* ── Recovery codes ──────────────────────────────────────────────── */

/** Format: XXXX-XXXX hex (8 chars, ~32 bits per code). */
export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const buf = randomBytes(4);
    const hex = buf.toString("hex").toUpperCase();
    codes.push(`${hex.slice(0, 4)}-${hex.slice(4, 8)}`);
  }
  return codes;
}
