import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar userRole={userRole} />
      <main className="pl-64 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
