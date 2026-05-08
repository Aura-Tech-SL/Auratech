"use client";

import { useState, useMemo } from "react";
import { Calendar, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScheduleControlsProps {
  status: string;
  publishAt: string | null;
  onSchedule: (publishAt: Date) => Promise<void> | void;
  onCancel: () => Promise<void> | void;
  /** Disable the form (e.g. while a save is in flight). */
  disabled?: boolean;
}

/**
 * Compact UI inside the document/article inspector tab. When the row is in
 * DRAFT it offers a date+time picker; when SCHEDULED it shows the planned
 * publication moment with a cancel button.
 */
export function ScheduleControls({
  status,
  publishAt,
  onSchedule,
  onCancel,
  disabled,
}: ScheduleControlsProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Default picker value: now + 24h, snapped to the next quarter hour.
  const defaultLocal = useMemo(() => toLocalInput(addHours(new Date(), 24)), []);
  const [picker, setPicker] = useState(defaultLocal);

  const isScheduled = status === "SCHEDULED" && publishAt;

  async function handleSchedule() {
    setError("");
    if (!picker) {
      setError("Tria una data");
      return;
    }
    const when = new Date(picker);
    if (Number.isNaN(when.getTime())) {
      setError("Data no vàlida");
      return;
    }
    if (when.getTime() <= Date.now()) {
      setError("Tria una data futura");
      return;
    }
    setPending(true);
    try {
      await onSchedule(when);
    } catch (e: any) {
      setError(e?.message || "Error programant");
    } finally {
      setPending(false);
    }
  }

  async function handleCancel() {
    setError("");
    setPending(true);
    try {
      await onCancel();
    } catch (e: any) {
      setError(e?.message || "Error cancel·lant");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-foreground/40" />
        <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
          Publicació programada
        </label>
      </div>

      {isScheduled ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/[0.04] px-3 py-2.5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-amber-500/80">
            Programat per
          </p>
          <p className="mt-0.5 text-sm tabular-nums">
            {new Date(publishAt!).toLocaleString("ca-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={pending || disabled}
            className="mt-2 h-7 gap-1.5 px-2 text-xs text-foreground/60 hover:text-foreground"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            Cancel·la la programació
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="datetime-local"
            value={picker}
            onChange={(e) => setPicker(e.target.value)}
            className="h-8 text-sm"
            disabled={disabled || pending}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSchedule}
            disabled={pending || disabled}
            className="w-full gap-1.5"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Calendar className="h-3.5 w-3.5" />
            )}
            Programa la publicació
          </Button>
          <p className="text-[10px] text-foreground/40">
            El cron revisa cada 5 minuts les publicacions programades.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function addHours(d: Date, h: number) {
  return new Date(d.getTime() + h * 3600_000);
}

function toLocalInput(d: Date) {
  // Format YYYY-MM-DDTHH:mm in local time (datetime-local input expects this).
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
