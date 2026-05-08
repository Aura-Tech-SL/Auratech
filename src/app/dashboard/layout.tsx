import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { GridBackground } from "@/components/ui/grid-background";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  return (
    <div className="min-h-screen bg-background relative">
      <GridBackground className="opacity-[0.15]" />
      <Sidebar userRole={userRole} />
      <main className="pl-64 pt-4 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
