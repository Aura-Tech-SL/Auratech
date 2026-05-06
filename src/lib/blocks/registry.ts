export type BlockType =
  | "hero"
  | "rich-text"
  | "image"
  | "gallery"
  | "cta"
  | "features-grid"
  | "testimonial"
  | "stats"
  | "video"
  | "code"
  | "divider"
  | "accordion"
  | "pricing"
  | "team-grid"
  | "contact-form"
  | "logo-grid"
  | "spacer";

export type BlockCategory = "contingut" | "media" | "layout" | "interactiu";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: BlockCategory;
  defaultData: Record<string, unknown>;
}

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  hero: {
    type: "hero",
    label: "Capçalera principal",
    icon: "Sparkles",
    category: "contingut",
    defaultData: {
      heading: "Títol principal",
      subheading: "Subtítol descriptiu del contingut",
      ctaText: "Comença ara",
      ctaLink: "#",
      secondaryCtaText: "",
      secondaryCtaLink: "",
      backgroundImage: "",
    },
  },
  "rich-text": {
    type: "rich-text",
    label: "Text enriquit",
    icon: "FileText",
    category: "contingut",
    defaultData: {
      content: "<p>Escriu el teu contingut aquí.</p>",
    },
  },
  image: {
    type: "image",
    label: "Imatge",
    icon: "Image",
    category: "media",
    defaultData: {
      src: "",
      alt: "",
      caption: "",
      fullWidth: false,
    },
  },
  gallery: {
    type: "gallery",
    label: "Galeria",
    icon: "LayoutGrid",
    category: "media",
    defaultData: {
      images: [],
      columns: 3,
    },
  },
  cta: {
    type: "cta",
    label: "Crida a l'acció",
    icon: "MousePointerClick",
    category: "contingut",
    defaultData: {
      heading: "Preparat per començar?",
      text: "Contacta'ns avui i descobreix com podem ajudar-te.",
      buttonText: "Contacta'ns",
      buttonLink: "/contacte",
      accentBackground: true,
    },
  },
  "features-grid": {
    type: "features-grid",
    label: "Graella de funcionalitats",
    icon: "Grid3X3",
    category: "layout",
    defaultData: {
      heading: "Les nostres funcionalitats",
      features: [
        {
          icon: "Zap",
          title: "Ràpid",
          description: "Rendiment optimitzat per a la millor experiència.",
        },
        {
          icon: "Shield",
          title: "Segur",
          description: "Protecció de dades de primer nivell.",
        },
        {
          icon: "Puzzle",
          title: "Flexible",
          description: "S'adapta a les teves necessitats.",
        },
      ],
    },
  },
  testimonial: {
    type: "testimonial",
    label: "Testimoni",
    icon: "Quote",
    category: "interactiu",
    defaultData: {
      quote: "Un servei excel·lent que ha transformat el nostre negoci.",
      author: "Maria Garcia",
      role: "Directora",
      company: "Empresa SL",
    },
  },
  stats: {
    type: "stats",
    label: "Estadístiques",
    icon: "BarChart3",
    category: "contingut",
    defaultData: {
      items: [
        { value: "150+", label: "Projectes completats" },
        { value: "98%", label: "Clients satisfets" },
        { value: "24/7", label: "Suport tècnic" },
        { value: "10+", label: "Anys d'experiència" },
      ],
    },
  },
  video: {
    type: "video",
    label: "Vídeo",
    icon: "Play",
    category: "media",
    defaultData: {
      url: "",
      title: "",
      autoplay: false,
    },
  },
  code: {
    type: "code",
    label: "Bloc de codi",
    icon: "Code2",
    category: "interactiu",
    defaultData: {
      code: "console.log('Hola món!');",
      language: "javascript",
    },
  },
  divider: {
    type: "divider",
    label: "Separador",
    icon: "Minus",
    category: "layout",
    defaultData: {
      style: "solid" as "solid" | "dashed" | "gradient",
    },
  },
  accordion: {
    type: "accordion",
    label: "Acordió",
    icon: "ChevronDown",
    category: "interactiu",
    defaultData: {
      items: [
        {
          question: "Quins serveis oferiu?",
          answer: "Oferim una àmplia gamma de serveis digitals.",
        },
        {
          question: "Quin és el temps de lliurament?",
          answer: "Depèn del projecte, normalment entre 4 i 8 setmanes.",
        },
      ],
    },
  },
  pricing: {
    type: "pricing",
    label: "Preus",
    icon: "CreditCard",
    category: "contingut",
    defaultData: {
      heading: "Plans i preus",
      tiers: [
        {
          name: "Bàsic",
          price: "29",
          period: "mes",
          features: ["Funcionalitat 1", "Funcionalitat 2", "Suport per correu"],
          ctaText: "Comença",
          ctaLink: "#",
          highlighted: false,
        },
        {
          name: "Professional",
          price: "79",
          period: "mes",
          features: [
            "Tot del pla Bàsic",
            "Funcionalitat avançada",
            "Suport prioritari",
            "Informes detallats",
          ],
          ctaText: "Comença",
          ctaLink: "#",
          highlighted: true,
        },
        {
          name: "Empresa",
          price: "199",
          period: "mes",
          features: [
            "Tot del pla Professional",
            "Personalització completa",
            "Gestor dedicat",
            "SLA garantit",
          ],
          ctaText: "Contacta'ns",
          ctaLink: "/contacte",
          highlighted: false,
        },
      ],
    },
  },
  "team-grid": {
    type: "team-grid",
    label: "Equip",
    icon: "Users",
    category: "layout",
    defaultData: {
      heading: "El nostre equip",
      members: [
        {
          name: "Nom Cognom",
          role: "Càrrec",
          image: "",
          bio: "",
        },
      ],
    },
  },
  "contact-form": {
    type: "contact-form",
    label: "Formulari de contacte",
    icon: "Mail",
    category: "interactiu",
    defaultData: {
      heading: "Contacta'ns",
      description: "Envia'ns un missatge i et respondrem el més aviat possible.",
      fields: ["name", "email", "phone", "message"],
    },
  },
  "logo-grid": {
    type: "logo-grid",
    label: "Graella de logos",
    icon: "Building2",
    category: "media",
    defaultData: {
      heading: "Confien en nosaltres",
      logos: [],
    },
  },
  spacer: {
    type: "spacer",
    label: "Espai",
    icon: "ArrowUpDown",
    category: "layout",
    defaultData: {
      height: "md" as "sm" | "md" | "lg" | "xl",
    },
  },
};

export const blockCategories: Record<BlockCategory, string> = {
  contingut: "Contingut",
  media: "Multimèdia",
  layout: "Disposició",
  interactiu: "Interactiu",
};

export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return Object.values(blockRegistry).filter((b) => b.category === category);
}

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockRegistry[type as BlockType];
}
