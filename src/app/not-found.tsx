"use client";

import Link from "next/link";
import { Home, Briefcase, FlaskConical, BookOpen, ArrowLeft } from "lucide-react";

const pages = [
  { href: "/en", label: "Home", icon: Home },
  { href: "/en/serveis", label: "Services", icon: Briefcase },
  { href: "/en/labs", label: "Labs", icon: FlaskConical },
  { href: "/en/blog", label: "Blog", icon: BookOpen },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="relative text-center">
        {/* Large 404 background text */}
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[120px] sm:text-[180px] text-foreground/5 select-none pointer-events-none">
          404
        </span>

        <div className="relative z-10">
          {/* Subtitle */}
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/40 mb-12">
            Page not found
          </p>

          {/* Suggested pages grid */}
          <div className="grid grid-cols-2 gap-3 mb-10 max-w-xs mx-auto">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="surface rounded-lg p-4 flex flex-col items-center gap-2 hover:border-accent/30 transition-colors duration-200"
              >
                <page.icon className="w-5 h-5 text-foreground/40" />
                <span className="font-mono text-xs text-foreground/60">
                  {page.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Back button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 font-mono text-xs text-foreground/40 hover:text-foreground/60 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
