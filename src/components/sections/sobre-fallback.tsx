"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { GridBackground } from "@/components/ui/grid-background";
import { TeamMemberCard } from "@/components/team/team-member-card";

export function SobreFallback() {
  const t = useTranslations("about");

  const values = [
    { title: t("v1Title"), description: t("v1Desc") },
    { title: t("v2Title"), description: t("v2Desc") },
    { title: t("v3Title"), description: t("v3Desc") },
    { title: t("v4Title"), description: t("v4Desc") },
  ];

  const team = [
    {
      name: t("m1Name"),
      role: t("m1Role"),
      location: t("m1Loc"),
      bio: t("m1Bio"),
    },
    {
      name: t("m2Name"),
      role: t("m2Role"),
      location: t("m2Loc"),
      bio: t("m2Bio"),
    },
  ];

  return (
    <>
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <GridBackground />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
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

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-5"
            >
              <SectionLabel className="mb-4">{t("whoLabel")}</SectionLabel>
              <h2 className="font-light text-3xl tracking-tight mb-6">
                {t("whoTitle")}
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="lg:col-span-6 lg:col-start-7 text-sm text-foreground/50 leading-relaxed space-y-4"
            >
              <p>{t("whoP1")}</p>
              <p>{t("whoP2")}</p>
              <p>{t("whoP3")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionLabel className="mb-12">{t("valuesLabel")}</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="surface rounded-lg p-6 sm:p-8"
              >
                <h3 className="font-medium text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-foreground/40 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <SectionLabel className="mb-4">{t("teamLabel")}</SectionLabel>
              <h2 className="font-light text-3xl tracking-tight mb-6">
                {t("teamTitle")}
                <br />
                <span className="text-foreground/40">{t("teamSubtitle")}</span>
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 text-sm text-foreground/50 leading-relaxed">
              <p>{t("teamDescription")}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <TeamMemberCard
                  name={member.name}
                  role={member.role}
                  location={member.location}
                  bio={member.bio}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
