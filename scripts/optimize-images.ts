/**
 * One-shot image optimisation script.
 *
 * Reduces JPGs in public/images/ to a max width of 1600px and re-encodes
 * them with mozjpeg quality 82. Also writes a parallel `.webp` version at
 * quality 80 so `next/image` can pick the smaller one for browsers that
 * support it.
 *
 * Originals (the pre-optimisation JPGs) are backed up to
 * public/images/_originals/ on first run, in case we ever want to roll
 * back. The backup directory is gitignored.
 *
 * Run once locally:
 *   npx tsx scripts/optimize-images.ts
 *
 * Then commit the optimised JPGs and new WebPs.
 */
import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { join, extname, basename } from "path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public", "images");
const BACKUP = join(ROOT, "_originals");
const MAX_WIDTH = 1600;
const JPG_QUALITY = 82;
const WEBP_QUALITY = 80;

// Process only the case/project/service photo set. Logos (PNG) get a
// separate pass if/when needed — they're not yet referenced by the active
// codebase.
const TARGET_PREFIXES = ["case-", "project-", "service-"];

async function main() {
  if (!existsSync(BACKUP)) {
    mkdirSync(BACKUP, { recursive: true });
  }

  const files = readdirSync(ROOT).filter((f) => {
    if (extname(f).toLowerCase() !== ".jpg") return false;
    return TARGET_PREFIXES.some((p) => f.startsWith(p));
  });

  if (files.length === 0) {
    console.log("No matching JPG files found.");
    return;
  }

  let savedJpg = 0;
  let savedTotalIncludingWebp = 0;

  for (const file of files) {
    const fullPath = join(ROOT, file);
    const before = statSync(fullPath).size;

    // Backup original (idempotent — only on first run)
    const backupPath = join(BACKUP, file);
    if (!existsSync(backupPath)) {
      copyFileSync(fullPath, backupPath);
    }

    // Re-encode JPG (in place)
    const buffer = await sharp(backupPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPG_QUALITY, mozjpeg: true })
      .toBuffer();
    await sharp(buffer).toFile(fullPath);
    const afterJpg = statSync(fullPath).size;

    // Companion WebP
    const webpPath = join(ROOT, `${basename(file, ".jpg")}.webp`);
    await sharp(backupPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
    const afterWebp = statSync(webpPath).size;

    const jpgSavings = before - afterJpg;
    const webpSavings = before - afterWebp;
    savedJpg += jpgSavings;
    savedTotalIncludingWebp += jpgSavings + webpSavings;

    console.log(
      `${file.padEnd(28)} ${(before / 1024).toFixed(0)}KB → JPG ${(
        afterJpg / 1024
      ).toFixed(0)}KB · WebP ${(afterWebp / 1024).toFixed(0)}KB`,
    );
  }

  console.log(
    `\nProcessed ${files.length} files. JPG saved ${(savedJpg / 1024).toFixed(0)}KB; WebP variant saves another ${((savedTotalIncludingWebp - savedJpg) / 1024).toFixed(0)}KB on capable browsers.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
