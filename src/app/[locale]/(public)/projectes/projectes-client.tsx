"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { SectionLabel } from "@/components/ui/section-label";
import { Badge } from "@/components/ui/badge";
import { GlowOrb } from "@/components/ui/glow-orb";

const fallbackImages = [
  "/images/project-erp.jpg",
  "/images/project-retail.jpg",
  "/images/project-app.jpg",
  "/images/project-security.jpg",
];

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  client: string;
  category: string;
  description: string;
  technologies: string[];
  image: string | null;
  status: string;
}

function ProjectCard({
  project,
  index,
  clientLabel,
  statusLabel,
}: {
  project: ProjectData;
  index: number;
  clientLabel: string;
  statusLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);

  const isInProgress =
    project.status === "IN_PROGRESS" || project.status === "PENDING";
  const imageSrc =
    project.image || fallbackImages[index % fallbackImages.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="group surface rounded-xl overflow-hidden hover:border-accent/20 transition-all duration-500"
    >
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <motion.div
          className="w-full h-full"
          style={{ scale: imgScale }}
        >
          <Image
            src={imageSrc}
            alt={project.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4">
          <Badge
            variant="outline"
            className={`text-[10px] backdrop-blur-md ${
              isInProgress
                ? "border-accent/40 text-accent bg-accent/10"
                : "border-foreground/15 text-foreground/50 bg-background/50"
            }`}
          >
            {statusLabel}
          </Badge>
        </div>
        <motion.div
          className="absolute bottom-4 left-4 font-mono text-[10px] text-foreground/40 tracking-wider"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-lg sm:text-xl font-medium group-hover:text-accent transition-colors duration-200">
            {project.name}
          </h2>
          <ArrowUpRight className="h-4 w-4 text-foreground/20 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 transition-all duration-300 mt-1" />
        </div>
        <p className="text-sm text-foreground/50 leading-relaxed mb-5">
          {project.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tag: string) => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-wider text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="font-mono text-[10px] text-foreground/25 tracking-wider uppercase">
              {clientLabel}
            </p>
            <p className="text-xs font-medium text-foreground/60">
              {project.client}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectesClient({ projects }: { projects: ProjectData[] }) {
  const t = useTranslations("projects");

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "REVIEW":
        return t("completed");
      case "IN_PROGRESS":
      case "PENDING":
        return t("inProgress");
      default:
        return status;
    }
  };

  return (
    <>
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <GlowOrb className="w-[500px] h-[500px] -top-20 right-0 opacity-20" />
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
              <span className="italic text-foreground/30">{t("subtitle")}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                clientLabel={t("client")}
                statusLabel={getStatusLabel(project.status)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
