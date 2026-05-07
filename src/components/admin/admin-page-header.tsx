"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/section-label";

interface AdminPageHeaderProps {
  label: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function AdminPageHeader({
  label,
  title,
  description,
  action,
  icon,
}: AdminPageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-between gap-4 flex-wrap"
    >
      <div className="min-w-0">
        <SectionLabel className="mb-3">{label}</SectionLabel>
        <h1 className="font-light text-4xl tracking-tight flex items-center gap-3 leading-tight">
          {icon}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-foreground/50 mt-2 text-sm max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}
