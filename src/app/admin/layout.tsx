import { Sidebar } from "@/components/layout/sidebar";
import { GridBackground } from "@/components/ui/grid-background";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single cheap query to surface the unread-contacts badge in the sidebar.
  // If the DB is unreachable (e.g. local dev without docker), fall back to 0.
  let unreadContacts = 0;
  try {
    unreadContacts = await prisma.contactSubmission.count({
      where: { isRead: false },
    });
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GridBackground className="opacity-[0.15]" />
      <Sidebar role="ADMIN" badges={{ contact: unreadContacts }} />
      <main className="pl-64 pt-4 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
