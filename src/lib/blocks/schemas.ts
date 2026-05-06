import { z } from "zod";

// --- Hero ---
export const heroSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  backgroundImage: z.string().optional(),
});
export type HeroData = z.infer<typeof heroSchema>;

// --- Rich Text ---
export const richTextSchema = z.object({
  content: z.string().min(1),
});
export type RichTextData = z.infer<typeof richTextSchema>;

// --- Image ---
export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional().default(""),
  caption: z.string().optional(),
  fullWidth: z.boolean().optional().default(false),
});
export type ImageData = z.infer<typeof imageSchema>;

// --- Gallery ---
export const gallerySchema = z.object({
  images: z.array(
    z.object({
      src: z.string().min(1),
      alt: z.string().optional().default(""),
    })
  ),
  columns: z.number().min(1).max(6).optional().default(3),
});
export type GalleryData = z.infer<typeof gallerySchema>;

// --- CTA ---
export const ctaSchema = z.object({
  heading: z.string().min(1),
  text: z.string().optional(),
  buttonText: z.string().min(1),
  buttonLink: z.string().min(1),
  accentBackground: z.boolean().optional().default(true),
});
export type CtaData = z.infer<typeof ctaSchema>;

// --- Features Grid ---
export const featuresGridSchema = z.object({
  heading: z.string().optional(),
  features: z.array(
    z.object({
      icon: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
    })
  ),
});
export type FeaturesGridData = z.infer<typeof featuresGridSchema>;

// --- Testimonial ---
export const testimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
});
export type TestimonialData = z.infer<typeof testimonialSchema>;

// --- Stats ---
export const statsSchema = z.object({
  items: z.array(
    z.object({
      value: z.string().min(1),
      label: z.string().min(1),
    })
  ),
});
export type StatsData = z.infer<typeof statsSchema>;

// --- Video ---
export const videoSchema = z.object({
  url: z.string().min(1),
  title: z.string().optional(),
  autoplay: z.boolean().optional().default(false),
});
export type VideoData = z.infer<typeof videoSchema>;

// --- Code ---
export const codeSchema = z.object({
  code: z.string().min(1),
  language: z.string().optional().default("plaintext"),
});
export type CodeData = z.infer<typeof codeSchema>;

// --- Divider ---
export const dividerSchema = z.object({
  style: z.enum(["solid", "dashed", "gradient"]).optional().default("solid"),
});
export type DividerData = z.infer<typeof dividerSchema>;

// --- Accordion ---
export const accordionSchema = z.object({
  items: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ),
});
export type AccordionData = z.infer<typeof accordionSchema>;

// --- Pricing ---
export const pricingSchema = z.object({
  heading: z.string().optional(),
  tiers: z.array(
    z.object({
      name: z.string().min(1),
      price: z.string().min(1),
      period: z.string().optional().default("mes"),
      features: z.array(z.string()),
      ctaText: z.string().optional().default("Comença"),
      ctaLink: z.string().optional().default("#"),
      highlighted: z.boolean().optional().default(false),
    })
  ),
});
export type PricingData = z.infer<typeof pricingSchema>;

// --- Team Grid ---
export const teamGridSchema = z.object({
  heading: z.string().optional(),
  members: z.array(
    z.object({
      name: z.string().min(1),
      role: z.string().optional(),
      image: z.string().optional(),
      bio: z.string().optional(),
    })
  ),
});
export type TeamGridData = z.infer<typeof teamGridSchema>;

// --- Contact Form ---
export const contactFormSchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  fields: z
    .array(z.enum(["name", "email", "phone", "company", "message"]))
    .optional()
    .default(["name", "email", "message"]),
});
export type ContactFormData = z.infer<typeof contactFormSchema>;

// --- Logo Grid ---
export const logoGridSchema = z.object({
  heading: z.string().optional(),
  logos: z.array(
    z.object({
      src: z.string().min(1),
      alt: z.string().optional().default(""),
      href: z.string().optional(),
    })
  ),
});
export type LogoGridData = z.infer<typeof logoGridSchema>;

// --- Spacer ---
export const spacerSchema = z.object({
  height: z.enum(["sm", "md", "lg", "xl"]).optional().default("md"),
});
export type SpacerData = z.infer<typeof spacerSchema>;

// --- Schema map ---
const schemaMap: Record<string, z.ZodSchema> = {
  hero: heroSchema,
  "rich-text": richTextSchema,
  image: imageSchema,
  gallery: gallerySchema,
  cta: ctaSchema,
  "features-grid": featuresGridSchema,
  testimonial: testimonialSchema,
  stats: statsSchema,
  video: videoSchema,
  code: codeSchema,
  divider: dividerSchema,
  accordion: accordionSchema,
  pricing: pricingSchema,
  "team-grid": teamGridSchema,
  "contact-form": contactFormSchema,
  "logo-grid": logoGridSchema,
  spacer: spacerSchema,
};

export function validateBlockData(
  type: string,
  data: unknown
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = schemaMap[type];
  if (!schema) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: "custom",
          message: `Tipus de bloc desconegut: ${type}`,
          path: ["type"],
        },
      ]),
    };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
