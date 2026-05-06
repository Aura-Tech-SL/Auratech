"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactFormData } from "@/lib/blocks/schemas";

interface ContactFormBlockProps {
  data: ContactFormData;
}

const fieldLabels: Record<string, string> = {
  name: "Nom",
  email: "Correu electrònic",
  phone: "Telèfon",
  company: "Empresa",
  message: "Missatge",
};

const fieldTypes: Record<string, string> = {
  name: "text",
  email: "email",
  phone: "tel",
  company: "text",
  message: "textarea",
};

export function ContactFormBlock({ data }: ContactFormBlockProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fields = data.fields ?? ["name", "email", "message"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSubmitted(true);
    } catch {
      // Silently handle - could add error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto max-w-2xl px-4">
        {data.heading && (
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.heading}
          </h2>
        )}

        {data.description && (
          <p className="mb-10 text-center text-lg text-muted-foreground">
            {data.description}
          </p>
        )}

        {submitted ? (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
            <p className="text-lg font-medium text-foreground">
              Missatge enviat correctament!
            </p>
            <p className="mt-2 text-muted-foreground">
              Et respondrem el més aviat possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => {
              const label = fieldLabels[field] || field;
              const type = fieldTypes[field] || "text";

              if (type === "textarea") {
                return (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      {label}
                    </label>
                    <textarea
                      id={field}
                      name={field}
                      rows={5}
                      required
                      className={cn(
                        "w-full rounded-lg border border-border bg-secondary px-4 py-3",
                        "text-foreground placeholder:text-muted-foreground/50",
                        "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
                        "transition-colors resize-none"
                      )}
                      placeholder={`El teu ${label.toLowerCase()}...`}
                    />
                  </div>
                );
              }

              return (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {label}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={type}
                    required={field !== "phone" && field !== "company"}
                    className={cn(
                      "h-11 w-full rounded-lg border border-border bg-secondary px-4",
                      "text-foreground placeholder:text-muted-foreground/50",
                      "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
                      "transition-colors"
                    )}
                    placeholder={`El teu ${label.toLowerCase()}`}
                  />
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-md",
                "bg-accent text-accent-foreground font-medium text-sm uppercase tracking-wide",
                "transition-all duration-200 hover:bg-accent/90",
                "shadow-[0_0_20px_hsl(195_90%_55%/0.3)]",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviant...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envia el missatge
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
