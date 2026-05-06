"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccordionData } from "@/lib/blocks/schemas";

interface AccordionBlockProps {
  data: AccordionData;
}

function AccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-4 py-5 text-left",
          "transition-colors hover:text-accent"
        )}
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-foreground sm:text-lg">
          {question}
        </span>
        <span className="flex-shrink-0 text-muted-foreground">
          {isOpen ? (
            <Minus className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function AccordionBlock({ data }: AccordionBlockProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="border-t border-border">
          {data.items.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
