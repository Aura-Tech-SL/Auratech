"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionLabel } from "@/components/ui/section-label";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";

export default function ContactePage() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const [honeypot, setHoneypot] = useState("");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contacte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: honeypot }),
      });
      if (res.ok) {
        setSubmitted(true);
        reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel className="mb-6">{t("label")}</SectionLabel>
            <h1 className="font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl leading-[0.95]">
              {t("title")}
              <br />
              <span className="text-foreground/40">{t("subtitle")}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-20">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="lg:col-span-4 space-y-12"
            >
              <div>
                <SectionLabel className="mb-4">{t("emailLabel")}</SectionLabel>
                <a
                  href="mailto:info@auratech.cat"
                  className="text-lg hover:text-foreground/60 transition-colors duration-200"
                >
                  info@auratech.cat
                </a>
              </div>

              <div>
                <SectionLabel className="mb-4">{t("locationLabel")}</SectionLabel>
                <p className="text-lg">{t("location")}</p>
              </div>

              <div>
                <SectionLabel className="mb-4">{t("scheduleLabel")}</SectionLabel>
                <div className="space-y-1">
                  <p className="text-sm">{t("weekdays")}</p>
                  <p className="text-sm text-foreground/30">{t("weekend")}</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="lg:col-span-7 lg:col-start-6"
            >
              {submitted ? (
                <div className="py-20 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-6 text-accent" />
                  <h3 className="font-light text-3xl tracking-tight mb-3">{t("sentTitle")}</h3>
                  <p className="text-foreground/50 mb-8 text-sm">
                    {t("sentDescription")}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-mono text-xs tracking-wider uppercase text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {t("sendAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Honeypot — hidden from users, catches bots */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute -left-[9999px] opacity-0 h-0 w-0"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <SectionLabel className="mb-3">{t("nameLabel")}</SectionLabel>
                      <Input
                        placeholder={t("namePlaceholder")}
                        className="border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-accent"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive mt-2">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <SectionLabel className="mb-3">{t("emailField")}</SectionLabel>
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-accent"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive mt-2">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <SectionLabel className="mb-3">{t("phoneLabel")}</SectionLabel>
                      <Input
                        placeholder={t("phonePlaceholder")}
                        className="border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-accent"
                        {...register("phone")}
                      />
                    </div>
                    <div>
                      <SectionLabel className="mb-3">{t("subjectLabel")}</SectionLabel>
                      <Input
                        placeholder={t("subjectPlaceholder")}
                        className="border-0 border-b border-border rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-accent"
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className="text-xs text-destructive mt-2">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <SectionLabel className="mb-3">{t("messageLabel")}</SectionLabel>
                    <Textarea
                      placeholder={t("messagePlaceholder")}
                      rows={5}
                      className="border-0 border-b border-border rounded-none px-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:border-accent"
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive mt-2">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-3 font-mono text-xs tracking-wider uppercase bg-foreground text-background px-8 py-4 rounded-md hover:bg-foreground/90 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? t("submitting") : t("submit")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
