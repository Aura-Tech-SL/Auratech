import type { BlockType } from "@/lib/blocks/registry";
import { HeroBlock } from "./hero-block";
import { RichTextBlock } from "./rich-text-block";
import { ImageBlock } from "./image-block";
import { GalleryBlock } from "./gallery-block";
import { CtaBlock } from "./cta-block";
import { FeaturesGridBlock } from "./features-grid-block";
import { TestimonialBlock } from "./testimonial-block";
import { StatsBlock } from "./stats-block";
import { VideoBlock } from "./video-block";
import { CodeBlock } from "./code-block";
import { DividerBlock } from "./divider-block";
import { AccordionBlock } from "./accordion-block";
import { PricingBlock } from "./pricing-block";
import { TeamGridBlock } from "./team-grid-block";
import { ContactFormBlock } from "./contact-form-block";
import { LogoGridBlock } from "./logo-grid-block";
import { SpacerBlock } from "./spacer-block";

interface Block {
  id: string;
  type: string;
  order: number;
  data: unknown;
  isVisible: boolean;
}

const blockComponents: Record<BlockType, React.ComponentType<{ data: any }>> = {
  hero: HeroBlock,
  "rich-text": RichTextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  cta: CtaBlock,
  "features-grid": FeaturesGridBlock,
  testimonial: TestimonialBlock,
  stats: StatsBlock,
  video: VideoBlock,
  code: CodeBlock,
  divider: DividerBlock,
  accordion: AccordionBlock,
  pricing: PricingBlock,
  "team-grid": TeamGridBlock,
  "contact-form": ContactFormBlock,
  "logo-grid": LogoGridBlock,
  spacer: SpacerBlock,
};

export function BlockRenderer({ block }: { block: Block }) {
  if (!block.isVisible) return null;

  const Component = blockComponents[block.type as BlockType];

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="mx-auto my-4 max-w-4xl rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="font-mono text-sm text-destructive">
            Bloc desconegut: <code>{block.type}</code>
          </p>
        </div>
      );
    }
    return null;
  }

  return <Component data={block.data as any} />;
}

export function PageBlocks({ blocks }: { blocks: Block[] }) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div>
      {sortedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
