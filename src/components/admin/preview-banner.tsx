import Link from "next/link";
import { Eye } from "lucide-react";

interface PreviewBannerProps {
  /** Where the back-to-edit button takes the user (e.g. /admin/pagines/{id}). */
  backHref: string;
  /** Status of the previewed content, shown in the badge. */
  status?: string;
}

export function PreviewBanner({ backHref, status }: PreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-amber-300">
        <Eye className="h-4 w-4" />
        <span className="font-mono text-[11px] uppercase tracking-wider">
          Vista prèvia
        </span>
        {status && (
          <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300/80">
            {status}
          </span>
        )}
        <span className="text-xs text-amber-300/70">
          — visible només per a tu mentre estiguis loguejat com a admin
        </span>
      </div>
      <Link
        href={backHref}
        className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:bg-amber-500/20"
      >
        ← Tornar a edició
      </Link>
    </div>
  );
}
