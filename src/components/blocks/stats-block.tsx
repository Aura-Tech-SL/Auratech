"use client";

import { motion } from "framer-motion";
import type { StatsData } from "@/lib/blocks/schemas";

interface StatsBlockProps {
  data: StatsData;
}

export function StatsBlock({ data }: StatsBlockProps) {
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-light tracking-tight text-accent">
                {item.value}
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-wider uppercase text-accent">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
