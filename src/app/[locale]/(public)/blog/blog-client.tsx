"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  readTime: number | null;
  publishedAt: Date | null;
  author: { name: string };
}

export function BlogClient({ posts }: { posts: PostData[] }) {
  const t = useTranslations("blog");

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

      {/* Post list — minimal Lovable style */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="divide-y divide-border">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group py-8 sm:py-12 grid lg:grid-cols-12 gap-4 lg:gap-8"
              >
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-1">
                    <span className="font-mono text-[11px] text-foreground/20">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toISOString().slice(0, 10)
                        : "—"}
                    </span>
                    <span className="font-mono text-[10px] tracking-wider uppercase text-accent">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-10">
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl sm:text-2xl font-medium mb-2 group-hover:text-accent transition-colors duration-200">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-foreground/40 leading-relaxed max-w-2xl">
                    {post.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
