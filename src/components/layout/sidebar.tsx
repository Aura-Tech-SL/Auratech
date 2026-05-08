"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  MessageSquare,
  UserCircle,
  LogOut,
  Settings,
  Users,
  FileText,
  PenSquare,
  Image,
  Mail,
  Wrench,
  ShieldCheck,
  ScrollText,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR"];

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: "contact";
};

const clientNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projectes", href: "/dashboard/projectes", icon: FolderKanban },
  { name: "Factures", href: "/dashboard/factures", icon: Receipt },
  { name: "Missatges", href: "/dashboard/missatges", icon: MessageSquare },
  { name: "Perfil", href: "/dashboard/perfil", icon: UserCircle },
];

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pàgines", href: "/admin/pagines", icon: FileText },
  { name: "Blog", href: "/admin/blog", icon: PenSquare },
  { name: "Programació", href: "/admin/scheduled", icon: CalendarClock },
  { name: "Serveis", href: "/admin/serveis", icon: Wrench },
  { name: "Projectes", href: "/admin/projectes", icon: FolderKanban },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Contacte", href: "/admin/contacte", icon: Mail, badgeKey: "contact" },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Audit log", href: "/admin/audit-log", icon: ScrollText },
  { name: "Configuració", href: "/admin/configuracio", icon: Settings },
];

interface SidebarProps {
  role?: "ADMIN" | "CLIENT";
  userRole?: string;
  badges?: Partial<Record<"contact", number>>;
}

export function Sidebar({
  role = "CLIENT",
  userRole,
  badges = {},
}: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "ADMIN" ? adminNav : clientNav;
  const isPrivileged = !!userRole && ADMIN_ROLES.includes(userRole);
  const showAdminLink = role === "CLIENT" && isPrivileged;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card pt-16">
      <div className="flex flex-col h-full px-3 py-4">
        <div className="flex-1 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {role === "ADMIN" ? "Administració" : "El meu espai"}
          </p>
          {nav.map((item) => {
            const isActive = item.href === "/admin" || item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const badgeCount = item.badgeKey
              ? badges[item.badgeKey as "contact"] ?? 0
              : 0;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {badgeCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-medium",
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}

          {showAdminLink && (
            <>
              <div className="my-3 border-t border-border" />
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                <ShieldCheck className="h-5 w-5" />
                Panell admin
              </Link>
            </>
          )}
        </div>

        <div className="border-t pt-4 space-y-1">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Tancar sessió
          </button>
        </div>
      </div>
    </aside>
  );
}
