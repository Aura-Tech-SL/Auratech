/**
 * One-shot user lifecycle script.
 *
 * - Promotes oscar.rovira@auratech.cat to SUPERADMIN.
 * - Creates sandra.romero@auratech.cat as EDITOR if missing (with a random
 *   password printed once to stdout). If she already exists, only updates
 *   her role to EDITOR — never overwrites her password.
 * - Removes the seed users admin@auratech.cat and editor@auratech.cat:
 *   reassigns any content they authored (Pages, BlogPosts, PageVersions,
 *   Media) to Oscar first, then deletes the user.
 *
 * Idempotent. Safe to run multiple times.
 *
 * Usage:
 *   docker compose exec backend npx tsx prisma/promote-users.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function generatePassword(): string {
  // 16 chars, base64url, no ambiguous chars
  return randomBytes(12).toString("base64url");
}

async function main() {
  // 1. Promote Oscar
  const oscar = await prisma.user.findUnique({
    where: { email: "oscar.rovira@auratech.cat" },
  });
  if (!oscar) {
    console.error("[promote] Oscar not found. Run main seed first.");
    process.exit(1);
  }
  if (oscar.role !== "SUPERADMIN") {
    await prisma.user.update({
      where: { email: "oscar.rovira@auratech.cat" },
      data: { role: "SUPERADMIN" },
    });
    console.log(`[promote] Oscar promoted: ${oscar.role} -> SUPERADMIN`);
  } else {
    console.log("[promote] Oscar already SUPERADMIN, skipped.");
  }

  // 2. Sandra
  const sandra = await prisma.user.findUnique({
    where: { email: "sandra.romero@auratech.cat" },
  });
  if (sandra) {
    if (sandra.role !== "EDITOR") {
      await prisma.user.update({
        where: { email: "sandra.romero@auratech.cat" },
        data: { role: "EDITOR" },
      });
      console.log(`[promote] Sandra role updated: ${sandra.role} -> EDITOR`);
    } else {
      console.log("[promote] Sandra already EDITOR, skipped.");
    }
    console.log("[promote] (password not touched — already exists)");
  } else {
    const tempPassword = generatePassword();
    const hashed = await hash(tempPassword, 12);
    await prisma.user.create({
      data: {
        name: "Sandra Romero Escobar",
        email: "sandra.romero@auratech.cat",
        password: hashed,
        role: "EDITOR",
        company: "Auratech",
      },
    });
    console.log("[promote] Sandra created as EDITOR");
    console.log("─".repeat(60));
    console.log(`  email:    sandra.romero@auratech.cat`);
    console.log(`  password: ${tempPassword}`);
    console.log("─".repeat(60));
    console.log("  ⚠ Save this password now. It is not stored anywhere else.");
    console.log("  ⚠ Sandra should change it at first login via admin UI.");
  }
}

async function removeSeedUser(email: string, oscarId: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`[promote] ${email} already absent, skipped.`);
    return;
  }
  // Reassign any authored content to Oscar so FK constraints don't block delete.
  const [pages, posts, versions, media] = await prisma.$transaction([
    prisma.page.updateMany({ where: { authorId: user.id }, data: { authorId: oscarId } }),
    prisma.blogPost.updateMany({ where: { authorId: user.id }, data: { authorId: oscarId } }),
    prisma.pageVersion.updateMany({ where: { createdById: user.id }, data: { createdById: oscarId } }),
    prisma.media.updateMany({ where: { uploadedById: user.id }, data: { uploadedById: oscarId } }),
  ]);
  console.log(
    `[promote] Reassigned from ${email} to oscar — pages:${pages.count} posts:${posts.count} versions:${versions.count} media:${media.count}`
  );
  // Sent/received messages, if any, get cascaded? Check schema. They have no
  // explicit onDelete, so a Message with senderId or receiverId pointing at
  // the user will block the delete. Reassign sent messages to Oscar; delete
  // received messages (which are addressed to the seed user).
  const sentRe = await prisma.message.updateMany({
    where: { senderId: user.id },
    data: { senderId: oscarId },
  });
  const receivedDel = await prisma.message.deleteMany({
    where: { receiverId: user.id },
  });
  console.log(
    `[promote] Messages — sent reassigned: ${sentRe.count}, received deleted: ${receivedDel.count}`
  );
  await prisma.user.delete({ where: { email } });
  console.log(`[promote] Deleted user ${email}`);
}

main()
  .then(async () => {
    // After main(), Oscar is SUPERADMIN. Use his id as the reassignment target.
    const oscar = await prisma.user.findUnique({
      where: { email: "oscar.rovira@auratech.cat" },
    });
    if (!oscar) throw new Error("Oscar disappeared mid-run");
    await removeSeedUser("admin@auratech.cat", oscar.id);
    await removeSeedUser("editor@auratech.cat", oscar.id);
    await prisma.$disconnect();
    console.log("[promote] Done.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
