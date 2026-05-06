"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { FeaturesGridData } from "@/lib/blocks/schemas";

interface FeaturesGridBlockProps {
  data: FeaturesGridData;
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function FeaturesGridBlock({ data }: FeaturesGridBlockProps) {
  const features = data.features || (data as any).items || [];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {data.heading && (
          <h2 className="mb-12 text-center font-light text-3xl sm:text-4xl tracking-tight text-foreground">
            {data.heading}
          </h2>
        )}

        <div
          className={cn(
            "grid gap-6 sm:gap-8",
            features.length <= 2
              ? "grid-cols-1 sm:grid-cols-2"
              : features.length === 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: "easeOut",
              }}
              className={cn(
                "surface group rounded-xl p-6 sm:p-8",
                "hover:border-accent/30 transition-colors duration-300"
              )}
            >
              {feature.icon && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 text-accent"
                >
                  <DynamicIcon name={feature.icon} className="h-6 w-6" />
                </motion.div>
              )}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              {feature.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
