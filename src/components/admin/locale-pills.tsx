import Link from "next/link";
import { cn } from "@/lib/utils";

const LOCALES = ["ca", "en", "es"] as const;
type Locale = (typeof LOCALES)[number];

type Status = "PUBLISHED" | "SCHEDULED" | "DRAFT" | "ARCHIVED";

export interface LocaleVariant {
  id: string;
  locale: string;
  status?: Status;
  updatedAt?: Date;
}

interface LocalePillsProps {
  variants: LocaleVariant[];
  /** Path prefix for the edit page (e.g. "/admin/pagines"). Variant id appended. */
  editPrefix?: string;
  /** Optional: target for missing locales (e.g. "/admin/pagines/nova?slug=foo&locale=en"). */
  createPrefixForSlug?: string;
  /** Render all pills as non-interactive (no edit UI yet for this entity). */
  readOnly?: boolean;
}

const STATUS_LABEL: Record<Status, string> = {
  PUBLISHED: "Publicat",
  SCHEDULED: "Programat",
  DRAFT: "Esborrany",
  ARCHIVED: "Arxivat",
};

function pillClasses(status: Status | undefined, missing: boolean) {
  if (missing) {
    return "border-dashed border-foreground/15 text-foreground/30 hover:text-foreground/60 hover:border-foreground/30";
  }
  if (status === "PUBLISHED") {
    return "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20";
  }
  if (status === "SCHEDULED") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
  }
  if (status === "ARCHIVED") {
    return "border-foreground/20 bg-foreground/5 text-foreground/50 hover:bg-foreground/10";
  }
  // DRAFT or unknown
  return "border-foreground/30 text-foreground/70 hover:bg-secondary";
}

export function LocalePills({
  variants,
  editPrefix,
  createPrefixForSlug,
  readOnly = false,
}: LocalePillsProps) {
  const byLocale = new Map<string, LocaleVariant>();
  for (const v of variants) byLocale.set(v.locale, v);

  return (
    <div className="flex items-center gap-1.5">
      {LOCALES.map((loc) => {
        const variant = byLocale.get(loc);
        const missing = !variant;
        const status = variant?.status;

        const tooltip = missing
          ? `Crear traducció ${loc.toUpperCase()}`
          : `${loc.toUpperCase()} · ${
              status ? STATUS_LABEL[status] : "Sense estat"
            }${
              variant?.updatedAt
                ? ` · ${variant.updatedAt.toISOString().slice(0, 10)}`
                : ""
            }`;

        const className = cn(
          "inline-flex items-center justify-center min-w-[2.25rem] h-6 px-2 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors",
          pillClasses(status, missing),
        );

        const isInert =
          readOnly ||
          (missing && !createPrefixForSlug) ||
          (!missing && !editPrefix);
        if (isInert) {
          return (
            <span key={loc} className={className} title={tooltip}>
              {loc}
            </span>
          );
        }

        const href = missing
          ? createPrefixForSlug!
          : `${editPrefix}/${variant!.id}`;
        return (
          <Link key={loc} href={href} className={className} title={tooltip}>
            {loc}
          </Link>
        );
      })}
    </div>
  );
}
