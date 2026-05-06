import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  name: string;
  role: string;
  location?: string;
  bio: string;
  imageSrc?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamMemberCard({
  name,
  role,
  location,
  bio,
  imageSrc,
  className,
}: TeamMemberCardProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent/40",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-accent/30 to-accent/10">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-lg font-semibold tracking-wider text-accent">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {name}
          </h3>
          <p className="truncate font-mono text-xs uppercase tracking-wider text-accent">
            {role}
          </p>
        </div>
      </div>
      {location && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          <span>{location}</span>
        </div>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
    </div>
  );
}
