/**
 * Magic-byte detection for the file types we accept on uploads.
 *
 * We deliberately keep this tiny and inline rather than pulling in `file-type`
 * (ESM-only, awkward in our Next 14 setup). The list mirrors the upload
 * allowlist defined in src/app/api/media/upload/route.ts. Add a signature here
 * if and only if the MIME type is also added to ALLOWED_MIMES.
 */

interface Signature {
  mime: string;
  /** Either an array of byte values (with `null` as wildcard) starting at `offset`,
   *  or a function that inspects the full buffer and returns true on match. */
  check: number[] | ((buf: Buffer) => boolean);
  offset?: number;
}

const SIGNATURES: Signature[] = [
  // JPEG: FF D8 FF
  { mime: "image/jpeg", check: [0xff, 0xd8, 0xff] },
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  { mime: "image/png", check: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // GIF: "GIF87a" or "GIF89a"
  { mime: "image/gif", check: [0x47, 0x49, 0x46, 0x38] }, // "GIF8"
  // WebP: "RIFF....WEBP" (offset 0..3 = RIFF, 8..11 = WEBP)
  {
    mime: "image/webp",
    check: (buf) =>
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50,
  },
  // PDF: "%PDF-"
  { mime: "application/pdf", check: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  // MP4 / ISO BMFF: at offset 4, "ftyp"
  { mime: "video/mp4", check: [0x66, 0x74, 0x79, 0x70], offset: 4 },
  // WebM / Matroska: 1A 45 DF A3
  { mime: "video/webm", check: [0x1a, 0x45, 0xdf, 0xa3] },
];

/**
 * Detect the MIME type by inspecting the first bytes of the buffer.
 * Returns the detected MIME or null if no known signature matched.
 */
export function detectFileType(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (typeof sig.check === "function") {
      if (sig.check(buffer)) return sig.mime;
      continue;
    }
    const offset = sig.offset ?? 0;
    if (buffer.length < offset + sig.check.length) continue;
    let matches = true;
    for (let i = 0; i < sig.check.length; i++) {
      if (buffer[offset + i] !== sig.check[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return sig.mime;
  }
  return null;
}
