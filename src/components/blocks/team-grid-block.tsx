import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamGridData } from "@/lib/blocks/schemas";

interface TeamGridBlockProps {
  data: TeamGridData;
}

export function TeamGridBlock({ data }: TeamGridBlockProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {data.heading && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.heading}
          </h2>
        )}

        <div
          className={cn(
            "grid gap-8",
            data.members.length <= 2
              ? "mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2"
              : data.members.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {data.members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-secondary">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-accent/60">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {member.name}
              </h3>
              {member.role && (
                <p className="mt-1 font-mono text-sm text-accent">
                  {member.role}
                </p>
              )}
              {member.bio && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
