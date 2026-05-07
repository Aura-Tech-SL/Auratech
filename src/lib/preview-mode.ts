import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR"];

/**
 * Returns true when the current request is allowed to view draft / archived
 * content. Triggered by `?preview=admin` on the URL plus a logged-in admin
 * session. Anything less falls through to the normal published-only resolver.
 */
export async function isPreviewMode(searchParams?: {
  preview?: string;
}): Promise<boolean> {
  if (!searchParams || searchParams.preview !== "admin") return false;
  const session = await getServerSession(authOptions);
  return Boolean(session?.user?.role && ADMIN_ROLES.includes(session.user.role));
}
