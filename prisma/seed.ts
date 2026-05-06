import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@auratech.cat" },
    update: {},
    create: {
      name: "Admin Auratech",
      email: "admin@auratech.cat",
      password: adminPassword,
      role: "SUPERADMIN",
      company: "Auratech",
    },
  });

  // Create editor user
  const editorPassword = await hash("editor123", 12);
  await prisma.user.upsert({
    where: { email: "editor@auratech.cat" },
    update: {},
    create: {
      name: "Editor Auratech",
      email: "editor@auratech.cat",
      password: editorPassword,
      role: "EDITOR",
      company: "Auratech",
    },
  });

  // Create client user
  const clientPassword = await hash("client123", 12);
  const client = await prisma.user.upsert({
    where: { email: "oscar.rovira@auratech.cat" },
    update: {},
    create: {
      name: "Oscar Rovira",
      email: "oscar.rovira@auratech.cat",
      password: clientPassword,
      role: "CLIENT",
      company: "Auratech",
      phone: "+34 93 XXX XX XX",
    },
  });

  // Create services
  const services = [
    {
      name: "IoT & Retail Tech",
      slug: "iot-retail-tech",
      description: "Etiquetatge electrònic, senyalització digital, inventari en temps real, sensors i sistemes de fidelització.",
      icon: "Cpu",
      features: JSON.stringify([
        { title: "Etiquetatge electrònic (ESL)", description: "Desplegament i gestió de preus digitals" },
        { title: "Senyalització digital", description: "Pantalles i continguts per a retail i hostaleria" },
        { title: "Sensors IoT", description: "Monitorització d'espais i condicions ambientals" },
      ]),
      order: 1,
    },
    {
      name: "Cloud & Infraestructura",
      slug: "cloud-infraestructura",
      description: "AWS, Azure, GCP, Docker, Kubernetes, CI/CD, monitorització i seguretat.",
      icon: "Cloud",
      features: JSON.stringify([
        { title: "Migració al núvol", description: "Zero downtime, planificació i execució" },
        { title: "Kubernetes", description: "Orquestració de contenidors a escala" },
        { title: "CI/CD", description: "Pipelines d'integració i desplegament continu" },
      ]),
      order: 2,
    },
    {
      name: "Estratègia Digital",
      slug: "estrategia-digital",
      description: "Diagnòstic, roadmaps, selecció tecnològica, optimització de processos.",
      icon: "Target",
      features: JSON.stringify([
        { title: "Diagnòstic tecnològic", description: "Auditoria de l'estat actual i oportunitats" },
        { title: "Roadmap digital", description: "Pla d'acció amb fites i prioritats" },
        { title: "Gestió del canvi", description: "Acompanyament en la transformació digital" },
      ]),
      order: 3,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug_locale: { slug: service.slug, locale: "ca" } },
      update: {},
      create: service,
    });
  }

  // Create CMS pages with blocks
  const homePage = await prisma.page.upsert({
    where: { slug_locale: { slug: "home", locale: "ca" } },
    update: {},
    create: {
      title: "Inici",
      slug: "home",
      description: "Pàgina principal d'Auratech",
      metaTitle: "Auratech — Construïm el que no es veu",
      metaDescription: "Infraestructura tecnològica, IoT i estratègia digital per a empreses.",
      status: "PUBLISHED",
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  // Home page blocks
  const homeBlocks = [
    {
      type: "hero",
      order: 0,
      pageId: homePage.id,
      data: {
        heading: "Construïm el que no es veu",
        subheading: "Infraestructura tecnològica, IoT i estratègia digital perquè la teva empresa funcioni millor.",
        ctaText: "Parlem",
        ctaLink: "/contacte",
        secondaryCtaText: "Què fem",
        secondaryCtaLink: "/serveis",
      },
    },
    {
      type: "features-grid",
      order: 1,
      pageId: homePage.id,
      data: {
        heading: "Què fem",
        features: [
          { icon: "Cpu", title: "IoT & Retail Tech", description: "Etiquetatge electrònic, senyalització digital i sensors." },
          { icon: "Cloud", title: "Cloud & Infraestructura", description: "Migració, Kubernetes, CI/CD i monitorització." },
          { icon: "Target", title: "Estratègia Digital", description: "Diagnòstic, roadmaps i transformació digital." },
        ],
      },
    },
    {
      type: "stats",
      order: 2,
      pageId: homePage.id,
      data: {
        items: [
          { value: "15.000+", label: "Etiquetes ESL desplegades" },
          { value: "25+", label: "Hotels amb senyalització digital" },
          { value: "99.9%", label: "Uptime en infraestructura" },
          { value: "8+", label: "Anys d'experiència" },
        ],
      },
    },
    {
      type: "cta",
      order: 3,
      pageId: homePage.id,
      data: {
        heading: "Tens un projecte en ment?",
        text: "Parlem sense compromís. T'ajudem a trobar la millor solució tecnològica.",
        buttonText: "Contacta'ns",
        buttonLink: "/contacte",
        style: "accent",
      },
    },
  ];

  for (const block of homeBlocks) {
    await prisma.block.create({ data: block });
  }

  // About page
  const aboutPage = await prisma.page.upsert({
    where: { slug_locale: { slug: "sobre", locale: "ca" } },
    update: {},
    create: {
      title: "Sobre nosaltres",
      slug: "sobre",
      description: "Qui som i com treballem",
      metaTitle: "Sobre Auratech — Qui som",
      metaDescription: "Coneix l'equip d'Auratech i la nostra filosofia de treball.",
      status: "PUBLISHED",
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  const aboutBlocks = [
    {
      type: "hero",
      order: 0,
      pageId: aboutPage.id,
      data: {
        heading: "Sobre nosaltres",
        subheading: "Vam començar connectant etiquetes electròniques en botigues. Avui dissenyem infraestructura i estratègia digital.",
      },
    },
    {
      type: "rich-text",
      order: 1,
      pageId: aboutPage.id,
      data: {
        content: "<h2>Com treballem</h2><p>Escoltem de debò. No fem propostes genèriques. Si no és el nostre camp, ho diem. Entreguem de manera iterativa amb sprints curts. I no desapareixem després del lliurament.</p>",
      },
    },
    {
      type: "team-grid",
      order: 2,
      pageId: aboutPage.id,
      data: {
        heading: "L'equip",
        members: [
          { name: "Oscar Rovira", role: "CEO & Founder", image: null },
          { name: "Maria Garcia", role: "CTO", image: null },
          { name: "Jordi Puig", role: "Lead Developer", image: null },
        ],
      },
    },
  ];

  for (const block of aboutBlocks) {
    await prisma.block.create({ data: block });
  }

  // Projects (portfolio)
  const projects = [
    {
      name: "Desplegament ESL per a retail",
      slug: "desplegament-esl-retail",
      client: "Cadena de supermercats",
      category: "IOT" as const,
      description: "Desplegament de 15.000 etiquetes electròniques en 12 botigues.",
      technologies: ["ESL", "MQTT", "Node.js", "Dashboard"],
      status: "COMPLETED" as const,
      progress: 100,
      isActive: true,
      order: 1,
      userId: client.id,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-12-01"),
    },
    {
      name: "Senyalització digital per hotels",
      slug: "senyalitzacio-digital-hotels",
      client: "Grup hoteler",
      category: "IOT" as const,
      description: "Sistema de senyalització digital per a 25 hotels amb gestió centralitzada.",
      technologies: ["Digital Signage", "CMS", "React", "AWS"],
      status: "COMPLETED" as const,
      progress: 100,
      isActive: true,
      order: 2,
    },
    {
      name: "Migració cloud zero-downtime",
      slug: "migracio-cloud-zero-downtime",
      client: "Startup fintech",
      category: "CLOUD" as const,
      description: "Migració completa d'infraestructura on-premise a AWS amb zero temps d'inactivitat.",
      technologies: ["AWS", "Terraform", "Docker", "Kubernetes"],
      status: "COMPLETED" as const,
      progress: 100,
      isActive: true,
      order: 3,
    },
    {
      name: "Transformació digital industrial",
      slug: "transformacio-digital-industrial",
      client: "Grup industrial",
      category: "STRATEGY" as const,
      description: "Diagnòstic i roadmap de transformació digital per a un grup industrial amb 5 plantes.",
      technologies: ["Consultoria", "ERP", "IoT", "BI"],
      status: "IN_PROGRESS" as const,
      progress: 60,
      isActive: true,
      order: 4,
      userId: client.id,
      startDate: new Date("2026-01-15"),
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug_locale: { slug: project.slug, locale: "ca" } },
      update: {},
      create: project,
    });
  }

  // Create invoices
  const invoices = [
    {
      number: "FAC-2026-001",
      amount: 3500,
      tax: 735,
      total: 4235,
      status: "PAID" as const,
      items: JSON.stringify([{ description: "Desplegament ESL - Fase 1", quantity: 1, price: 3500 }]),
      userId: client.id,
      dueDate: new Date("2026-01-15"),
      paidAt: new Date("2026-01-12"),
    },
    {
      number: "FAC-2026-002",
      amount: 1250,
      tax: 262.5,
      total: 1512.5,
      status: "PENDING" as const,
      items: JSON.stringify([{ description: "Consultoria estratègia digital - Gener", quantity: 1, price: 1250 }]),
      userId: client.id,
      dueDate: new Date("2026-02-28"),
    },
  ];

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { number: invoice.number },
      update: {},
      create: invoice,
    });
  }

  // Create blog posts with blocks
  const post1 = await prisma.blogPost.upsert({
    where: { slug_locale: { slug: "iot-retail-botigues-intel-ligents", locale: "ca" } },
    update: {},
    create: {
      title: "IoT al Retail: les botigues intel·ligents que ho canvien tot",
      slug: "iot-retail-botigues-intel-ligents",
      excerpt: "Com la tecnologia IoT està transformant l'experiència de compra i la gestió de botigues.",
      coverImage: null,
      tags: ["IoT", "Retail", "ESL"],
      category: "IOT",
      status: "PUBLISHED",
      readTime: 5,
      authorId: admin.id,
      publishedAt: new Date("2026-02-15"),
    },
  });

  await prisma.block.createMany({
    data: [
      {
        type: "rich-text",
        order: 0,
        blogPostId: post1.id,
        data: { content: "<p>La transformació digital del retail va molt més enllà de tenir una botiga online. Les botigues físiques estan adoptant tecnologies IoT que milloren l'experiència del client i optimitzen les operacions.</p><h2>Etiquetatge electrònic (ESL)</h2><p>Les etiquetes de preu electròniques permeten actualitzar preus en temps real a milers de productes simultàniament.</p>" },
      },
      {
        type: "stats",
        order: 1,
        blogPostId: post1.id,
        data: { items: [{ value: "90%", label: "Reducció d'errors de preu" }, { value: "15min", label: "Temps d'actualització vs 3 dies" }] },
      },
      {
        type: "rich-text",
        order: 2,
        blogPostId: post1.id,
        data: { content: "<h2>Sensors i monitorització</h2><p>Sensors de temperatura, humitat i ocupació permeten prendre decisions basades en dades reals. El resultat: botigues més eficients i clients més satisfets.</p>" },
      },
    ],
  });

  const post2 = await prisma.blogPost.upsert({
    where: { slug_locale: { slug: "guia-practica-migracio-cloud", locale: "ca" } },
    update: {},
    create: {
      title: "Guia pràctica de migració al núvol",
      slug: "guia-practica-migracio-cloud",
      excerpt: "Tot el que necessites saber per migrar la teva infraestructura al núvol sense riscos.",
      tags: ["Cloud", "AWS", "DevOps"],
      category: "CLOUD",
      status: "PUBLISHED",
      readTime: 8,
      authorId: admin.id,
      publishedAt: new Date("2026-03-01"),
    },
  });

  await prisma.block.createMany({
    data: [
      {
        type: "rich-text",
        order: 0,
        blogPostId: post2.id,
        data: { content: "<p>Migrar al núvol no és simplement moure servidors. És repensar com la teva infraestructura dóna suport al negoci.</p><h2>1. Avaluació</h2><p>Comença per entendre què tens, què necessites i quin és el cost real de mantenir-ho on-premise.</p><h2>2. Estratègia</h2><p>Lift-and-shift, re-platform o re-architect? La resposta depèn de cada aplicació.</p>" },
      },
    ],
  });

  // Welcome message
  await prisma.message.create({
    data: {
      content: "Benvingut a la plataforma de clients d'Auratech. Des d'aquí podràs seguir l'estat dels teus projectes, consultar factures i enviar-nos missatges.",
      senderId: admin.id,
      receiverId: client.id,
      isRead: true,
    },
  });

  // ────────────────────────────────────────────────────────
  // AI Automations landing page (3 locales: ca, en, es)
  // ────────────────────────────────────────────────────────
  type AiContent = {
    title: string;
    metaTitle: string;
    metaDescription: string;
    description: string;
    hero: { heading: string; subheading: string; ctaText: string; ctaSecondary: string };
    layers: { heading: string; consultoriaTitle: string; consultoriaDesc: string; productTitle: string; productDesc: string; whiteLabelTitle: string; whiteLabelDesc: string };
    intro: string;
    stats: Array<{ value: string; label: string }>;
    useCases: { heading: string; items: Array<{ title: string; description: string }> };
    pricing: { heading: string; recommendedLabel: string; period: string; tier1: { name: string; features: string[]; cta: string }; tier2: { name: string; features: string[]; cta: string }; tier3: { name: string; features: string[]; cta: string }; setupNote: string };
    faq: Array<{ question: string; answer: string }>;
    cta: { heading: string; text: string; buttonText: string };
  };

  const aiContent: Record<string, AiContent> = {
    ca: {
      title: "Automatitzacions amb IA",
      metaTitle: "Automatitzacions amb IA — Auratech",
      metaDescription: "Agents conversacionals d'IA i workflows intel·ligents per a pimes. Especialització en clíniques estètiques: gestió de cites per WhatsApp 24/7, recordatoris automàtics i compliment RGPD.",
      description: "Línia de negoci d'Auratech especialitzada en agents d'IA i automatització de processos per a pimes.",
      hero: {
        heading: "Automatitzacions amb IA per a pimes",
        subheading: "Agents conversacionals que responen, gestionen i venen 24/7. Especialitzats en clíniques estètiques i sector salut.",
        ctaText: "Veure paquets",
        ctaSecondary: "Parlem",
      },
      layers: {
        heading: "Tres formes de treballar amb nosaltres",
        consultoriaTitle: "Consultoria d'IA",
        consultoriaDesc: "T'acompanyem en el disseny i implementació d'IA al teu negoci. Casos d'ús, ROI mesurable, formació de l'equip. Tickets des de 2.000€.",
        productTitle: "Producte vertical clíniques",
        productDesc: "SaaS especialitzat per a clíniques estètiques: agent IA sobre WhatsApp, gestió de cites, recordatoris i postvenda. Des de 149€/mes.",
        whiteLabelTitle: "White-label per a agències",
        whiteLabelDesc: "Per a agències de màrqueting que volen oferir IA als seus clients. Plataforma sota la teva marca, suport tècnic d'Auratech. Acords personalitzats.",
      },
      intro: "<h2>Per a clíniques estètiques: el problema és real</h2><p>Les clíniques estètiques perden cites cada nit per missatges sense respondre. El personal administratiu es passa hores enviant recordatoris manuals. El no-show arriba al 20-35%. Els teus competidors ja automatitzen aquestes tasques amb IA.</p><p>Auratech ofereix un agent d'IA sobre WhatsApp que <strong>respon, qualifica, reserva i recorda</strong> 24 hores al dia, en català i castellà, amb el coneixement específic del sector estètic i compliment RGPD per a dades de salut.</p>",
      stats: [
        { value: "24/7", label: "Disponibilitat de l'agent IA" },
        { value: "98%", label: "Taxa d'obertura WhatsApp" },
        { value: "+7.600", label: "Clíniques estètiques a Espanya" },
        { value: "&lt;2 min", label: "Setup d'una conversa real de demo" },
      ],
      useCases: {
        heading: "Què automatitzem en una clínica",
        items: [
          { title: "Recepció 24/7 per WhatsApp", description: "L'agent respon preguntes sobre serveis, preus i disponibilitat fora d'horari, capturant la cita abans que el client se'n vagi a la competència." },
          { title: "Recordatoris automàtics", description: "Recordatoris 24h i 2h abans del tractament. Confirmació amb un clic. Reducció dràstica del no-show." },
          { title: "Postvenda i fidelització", description: "Seguiment automàtic post-tractament, recomanació de pròxima cita i campanyes de reactivació de clients dormits." },
          { title: "Integració amb la teva agenda", description: "Connexió amb Google Calendar, Calendly o el software de gestió de la clínica. Sincronització bidireccional." },
        ],
      },
      pricing: {
        heading: "Paquets per a clíniques estètiques",
        recommendedLabel: "Recomanat",
        period: "mes",
        tier1: {
          name: "Starter",
          features: [
            "Agent WhatsApp 24/7",
            "Gestió bàsica de cites",
            "Fins a 500 conversacions/mes",
            "Suport per email",
            "Setup únic: 299€",
          ],
          cta: "Vull el pilot Starter",
        },
        tier2: {
          name: "Pro",
          features: [
            "Tot el del Starter",
            "Recordatoris automàtics 24h i 2h",
            "Integració Google Calendar / Calendly",
            "Fins a 1.500 conversacions/mes",
            "Suport prioritari",
            "Setup únic: 449€",
          ],
          cta: "Vull el pilot Pro",
        },
        tier3: {
          name: "Clínica",
          features: [
            "Tot el del Pro",
            "Analítica mensual personalitzada",
            "Múltiples professionals i agendes",
            "Fins a 5.000 conversacions/mes",
            "Onboarding presencial inclòs",
            "Setup únic: 599€",
          ],
          cta: "Vull el pilot Clínica",
        },
        setupNote: "Tots els paquets inclouen formació del personal i compliment RGPD per a dades de salut. Sense permanència. Cancel·la quan vulguis.",
      },
      faq: [
        { question: "Compliu el RGPD per dades de salut?", answer: "Sí. Els missatges es processen i s'emmagatzemen seguint l'Article 9 del RGPD per a dades sensibles. Servidors a la UE. Signem un contracte de DPA amb cada clínica." },
        { question: "Com s'integra amb la nostra agenda?", answer: "Tenim integracions natives amb Google Calendar i Calendly. Per a software de gestió de clíniques específic, fem la integració durant el setup (inclòs als paquets Pro i Clínica)." },
        { question: "I si l'agent no entén alguna cosa?", answer: "Quan detecta complexitat o sensibilitat (queixes, casos clínics complexos), deriva la conversa al personal humà mantenint el context. Configurable amb les teves regles de negoci." },
        { question: "Quant es triga a tenir-ho funcionant?", answer: "Una setmana des de la signatura. Primers tres dies: setup tècnic i integracions. Resta de la setmana: formació, ajust de respostes i prova en paral·lel amb l'agenda real." },
        { question: "Hi ha permanència?", answer: "No. Subscripció mensual cancel·lable amb un mes de preavís. La setup inicial és única i no es retorna." },
        { question: "Com es paga?", answer: "Domiciliació SEPA o transferència. Facturem mensualment. El setup es factura al començament del pilot." },
      ],
      cta: {
        heading: "Comencem el pilot avui?",
        text: "Posa'l a prova durant 30 dies amb la teva clínica real. Si no recuperes el setup en cites recuperades, et tornem els diners.",
        buttonText: "Parla amb Sandra",
      },
    },
    en: {
      title: "AI Automations",
      metaTitle: "AI Automations — Auratech",
      metaDescription: "Conversational AI agents and intelligent workflows for SMBs. Specialised in aesthetic clinics: 24/7 WhatsApp appointment management, automated reminders and GDPR compliance.",
      description: "Auratech's business line specialised in AI agents and process automation for SMBs.",
      hero: {
        heading: "AI Automations for SMBs",
        subheading: "Conversational agents that respond, manage and sell 24/7. Specialised in aesthetic clinics and the health sector.",
        ctaText: "See packages",
        ctaSecondary: "Let's talk",
      },
      layers: {
        heading: "Three ways to work with us",
        consultoriaTitle: "AI consulting",
        consultoriaDesc: "We guide you through designing and implementing AI in your business. Use cases, measurable ROI, team training. Tickets from €2,000.",
        productTitle: "Vertical product for clinics",
        productDesc: "Specialised SaaS for aesthetic clinics: AI agent over WhatsApp, appointment management, reminders and post-sale care. From €149/month.",
        whiteLabelTitle: "White-label for agencies",
        whiteLabelDesc: "For marketing agencies that want to offer AI to their clients. Platform under your brand, technical support from Auratech. Custom agreements.",
      },
      intro: "<h2>For aesthetic clinics: the problem is real</h2><p>Aesthetic clinics lose appointments every night to unanswered messages. Admin staff spend hours sending manual reminders. No-show rates reach 20-35%. Your competitors are already automating these tasks with AI.</p><p>Auratech provides an AI agent over WhatsApp that <strong>responds, qualifies, books and reminds</strong> 24/7, in Catalan and Spanish, with sector-specific knowledge and GDPR compliance for health data.</p>",
      stats: [
        { value: "24/7", label: "AI agent availability" },
        { value: "98%", label: "WhatsApp open rate" },
        { value: "+7,600", label: "Aesthetic clinics in Spain" },
        { value: "&lt;2 min", label: "Setup of a real demo conversation" },
      ],
      useCases: {
        heading: "What we automate in a clinic",
        items: [
          { title: "24/7 WhatsApp reception", description: "The agent answers questions about services, prices and availability outside working hours, capturing the appointment before the client moves to a competitor." },
          { title: "Automated reminders", description: "Reminders 24h and 2h before treatment. One-click confirmation. Drastic reduction of no-shows." },
          { title: "Post-sale and loyalty", description: "Automatic post-treatment follow-up, next appointment recommendations and reactivation campaigns for dormant clients." },
          { title: "Integration with your calendar", description: "Connection with Google Calendar, Calendly or your clinic management software. Two-way sync." },
        ],
      },
      pricing: {
        heading: "Packages for aesthetic clinics",
        recommendedLabel: "Recommended",
        period: "month",
        tier1: {
          name: "Starter",
          features: [
            "24/7 WhatsApp agent",
            "Basic appointment management",
            "Up to 500 conversations/month",
            "Email support",
            "One-time setup: €299",
          ],
          cta: "I want the Starter pilot",
        },
        tier2: {
          name: "Pro",
          features: [
            "Everything in Starter",
            "Automated reminders 24h and 2h",
            "Google Calendar / Calendly integration",
            "Up to 1,500 conversations/month",
            "Priority support",
            "One-time setup: €449",
          ],
          cta: "I want the Pro pilot",
        },
        tier3: {
          name: "Clinic",
          features: [
            "Everything in Pro",
            "Personalised monthly analytics",
            "Multiple practitioners and calendars",
            "Up to 5,000 conversations/month",
            "On-site onboarding included",
            "One-time setup: €599",
          ],
          cta: "I want the Clinic pilot",
        },
        setupNote: "All packages include staff training and GDPR compliance for health data. No lock-in. Cancel anytime.",
      },
      faq: [
        { question: "Are you GDPR compliant for health data?", answer: "Yes. Messages are processed and stored following Article 9 of GDPR for sensitive data. EU servers. We sign a DPA with each clinic." },
        { question: "How does it integrate with our calendar?", answer: "We have native integrations with Google Calendar and Calendly. For specific clinic management software, we handle the integration during setup (included in Pro and Clinic packages)." },
        { question: "What if the agent doesn't understand something?", answer: "When it detects complexity or sensitivity (complaints, complex clinical cases), it hands the conversation off to human staff while keeping the context. Configurable with your business rules." },
        { question: "How long does it take to go live?", answer: "One week from signing. First three days: technical setup and integrations. Rest of the week: training, response tuning and parallel testing with your real calendar." },
        { question: "Is there a lock-in?", answer: "No. Monthly subscription with one month notice. The initial setup is one-off and non-refundable." },
        { question: "How is it paid?", answer: "SEPA direct debit or bank transfer. Monthly invoicing. The setup is invoiced at the start of the pilot." },
      ],
      cta: {
        heading: "Shall we start the pilot today?",
        text: "Try it for 30 days with your real clinic. If you don't recover the setup in recovered appointments, we'll refund you.",
        buttonText: "Talk to Sandra",
      },
    },
    es: {
      title: "Automatizaciones con IA",
      metaTitle: "Automatizaciones con IA — Auratech",
      metaDescription: "Agentes conversacionales de IA y workflows inteligentes para pymes. Especialización en clínicas estéticas: gestión de citas por WhatsApp 24/7, recordatorios automáticos y cumplimiento RGPD.",
      description: "Línea de negocio de Auratech especializada en agentes de IA y automatización de procesos para pymes.",
      hero: {
        heading: "Automatizaciones con IA para pymes",
        subheading: "Agentes conversacionales que responden, gestionan y venden 24/7. Especializados en clínicas estéticas y sector salud.",
        ctaText: "Ver paquetes",
        ctaSecondary: "Hablemos",
      },
      layers: {
        heading: "Tres formas de trabajar con nosotros",
        consultoriaTitle: "Consultoría de IA",
        consultoriaDesc: "Te acompañamos en el diseño e implementación de IA en tu negocio. Casos de uso, ROI medible, formación del equipo. Tickets desde 2.000€.",
        productTitle: "Producto vertical clínicas",
        productDesc: "SaaS especializado para clínicas estéticas: agente IA sobre WhatsApp, gestión de citas, recordatorios y postventa. Desde 149€/mes.",
        whiteLabelTitle: "White-label para agencias",
        whiteLabelDesc: "Para agencias de marketing que quieren ofrecer IA a sus clientes. Plataforma bajo tu marca, soporte técnico de Auratech. Acuerdos personalizados.",
      },
      intro: "<h2>Para clínicas estéticas: el problema es real</h2><p>Las clínicas estéticas pierden citas cada noche por mensajes sin responder. El personal administrativo se pasa horas enviando recordatorios manuales. El no-show llega al 20-35%. Tus competidores ya automatizan estas tareas con IA.</p><p>Auratech ofrece un agente de IA sobre WhatsApp que <strong>responde, califica, reserva y recuerda</strong> 24 horas al día, en catalán y castellano, con conocimiento específico del sector estético y cumplimiento RGPD para datos de salud.</p>",
      stats: [
        { value: "24/7", label: "Disponibilidad del agente IA" },
        { value: "98%", label: "Tasa de apertura WhatsApp" },
        { value: "+7.600", label: "Clínicas estéticas en España" },
        { value: "&lt;2 min", label: "Setup de una conversación real de demo" },
      ],
      useCases: {
        heading: "Qué automatizamos en una clínica",
        items: [
          { title: "Recepción 24/7 por WhatsApp", description: "El agente responde preguntas sobre servicios, precios y disponibilidad fuera de horario, capturando la cita antes de que el cliente se vaya a la competencia." },
          { title: "Recordatorios automáticos", description: "Recordatorios 24h y 2h antes del tratamiento. Confirmación con un clic. Reducción drástica del no-show." },
          { title: "Postventa y fidelización", description: "Seguimiento automático post-tratamiento, recomendación de próxima cita y campañas de reactivación de clientes dormidos." },
          { title: "Integración con tu agenda", description: "Conexión con Google Calendar, Calendly o el software de gestión de la clínica. Sincronización bidireccional." },
        ],
      },
      pricing: {
        heading: "Paquetes para clínicas estéticas",
        recommendedLabel: "Recomendado",
        period: "mes",
        tier1: {
          name: "Starter",
          features: [
            "Agente WhatsApp 24/7",
            "Gestión básica de citas",
            "Hasta 500 conversaciones/mes",
            "Soporte por email",
            "Setup único: 299€",
          ],
          cta: "Quiero el piloto Starter",
        },
        tier2: {
          name: "Pro",
          features: [
            "Todo lo del Starter",
            "Recordatorios automáticos 24h y 2h",
            "Integración Google Calendar / Calendly",
            "Hasta 1.500 conversaciones/mes",
            "Soporte prioritario",
            "Setup único: 449€",
          ],
          cta: "Quiero el piloto Pro",
        },
        tier3: {
          name: "Clínica",
          features: [
            "Todo lo del Pro",
            "Analítica mensual personalizada",
            "Múltiples profesionales y agendas",
            "Hasta 5.000 conversaciones/mes",
            "Onboarding presencial incluido",
            "Setup único: 599€",
          ],
          cta: "Quiero el piloto Clínica",
        },
        setupNote: "Todos los paquetes incluyen formación del personal y cumplimiento RGPD para datos de salud. Sin permanencia. Cancela cuando quieras.",
      },
      faq: [
        { question: "¿Cumplís el RGPD para datos de salud?", answer: "Sí. Los mensajes se procesan y almacenan siguiendo el Artículo 9 del RGPD para datos sensibles. Servidores en la UE. Firmamos un contrato DPA con cada clínica." },
        { question: "¿Cómo se integra con nuestra agenda?", answer: "Tenemos integraciones nativas con Google Calendar y Calendly. Para software de gestión de clínicas específico, hacemos la integración durante el setup (incluido en los paquetes Pro y Clínica)." },
        { question: "¿Y si el agente no entiende algo?", answer: "Cuando detecta complejidad o sensibilidad (quejas, casos clínicos complejos), deriva la conversación al personal humano manteniendo el contexto. Configurable con tus reglas de negocio." },
        { question: "¿Cuánto se tarda en tenerlo funcionando?", answer: "Una semana desde la firma. Primeros tres días: setup técnico e integraciones. Resto de la semana: formación, ajuste de respuestas y prueba en paralelo con la agenda real." },
        { question: "¿Hay permanencia?", answer: "No. Suscripción mensual cancelable con un mes de preaviso. La setup inicial es única y no se devuelve." },
        { question: "¿Cómo se paga?", answer: "Domiciliación SEPA o transferencia. Facturamos mensualmente. El setup se factura al comienzo del piloto." },
      ],
      cta: {
        heading: "¿Empezamos el piloto hoy?",
        text: "Pruébalo durante 30 días con tu clínica real. Si no recuperas el setup en citas recuperadas, te devolvemos el dinero.",
        buttonText: "Habla con Sandra",
      },
    },
  };

  for (const locale of ["ca", "en", "es"] as const) {
    const c = aiContent[locale];
    const aiPage = await prisma.page.upsert({
      where: { slug_locale: { slug: "automatitzacions-ia", locale } },
      update: {
        title: c.title,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        description: c.description,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      create: {
        title: c.title,
        slug: "automatitzacions-ia",
        locale,
        description: c.description,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        status: "PUBLISHED",
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });

    // Wipe existing blocks before re-seeding (idempotent)
    await prisma.block.deleteMany({ where: { pageId: aiPage.id } });

    const subjectPrefix = locale === "en" ? "AI+Clinics+Pilot" : locale === "es" ? "Piloto+IA+Cl%C3%ADnicas" : "Pilot+IA+Cl%C3%ADniques";
    const contactBase = `/contacte?subject=${subjectPrefix}`;

    const blocks = [
      {
        type: "hero",
        order: 0,
        pageId: aiPage.id,
        data: {
          heading: c.hero.heading,
          subheading: c.hero.subheading,
          ctaText: c.hero.ctaText,
          ctaLink: "#pricing",
          secondaryCtaText: c.hero.ctaSecondary,
          secondaryCtaLink: "/contacte",
        },
      },
      {
        type: "features-grid",
        order: 1,
        pageId: aiPage.id,
        data: {
          heading: c.layers.heading,
          features: [
            { icon: "Lightbulb", title: c.layers.consultoriaTitle, description: c.layers.consultoriaDesc },
            { icon: "Bot", title: c.layers.productTitle, description: c.layers.productDesc },
            { icon: "Layers", title: c.layers.whiteLabelTitle, description: c.layers.whiteLabelDesc },
          ],
        },
      },
      {
        type: "rich-text",
        order: 2,
        pageId: aiPage.id,
        data: { content: c.intro },
      },
      {
        type: "stats",
        order: 3,
        pageId: aiPage.id,
        data: { items: c.stats },
      },
      {
        type: "features-grid",
        order: 4,
        pageId: aiPage.id,
        data: {
          heading: c.useCases.heading,
          features: c.useCases.items.map((it) => ({ title: it.title, description: it.description })),
        },
      },
      {
        type: "pricing",
        order: 5,
        pageId: aiPage.id,
        data: {
          heading: c.pricing.heading,
          recommendedLabel: c.pricing.recommendedLabel,
          tiers: [
            {
              name: c.pricing.tier1.name,
              price: "149",
              period: c.pricing.period,
              features: c.pricing.tier1.features,
              ctaText: c.pricing.tier1.cta,
              ctaLink: `${contactBase}+(Starter)`,
              highlighted: false,
            },
            {
              name: c.pricing.tier2.name,
              price: "249",
              period: c.pricing.period,
              features: c.pricing.tier2.features,
              ctaText: c.pricing.tier2.cta,
              ctaLink: `${contactBase}+(Pro)`,
              highlighted: true,
            },
            {
              name: c.pricing.tier3.name,
              price: "399",
              period: c.pricing.period,
              features: c.pricing.tier3.features,
              ctaText: c.pricing.tier3.cta,
              ctaLink: `${contactBase}+(Clinic)`,
              highlighted: false,
            },
          ],
        },
      },
      {
        type: "rich-text",
        order: 6,
        pageId: aiPage.id,
        data: { content: `<p style="text-align:center;font-size:0.9em;color:#888;">${c.pricing.setupNote}</p>` },
      },
      {
        type: "accordion",
        order: 7,
        pageId: aiPage.id,
        data: { items: c.faq },
      },
      {
        type: "cta",
        order: 8,
        pageId: aiPage.id,
        data: {
          heading: c.cta.heading,
          text: c.cta.text,
          buttonText: c.cta.buttonText,
          buttonLink: `${contactBase}+(General)`,
          accentBackground: true,
        },
      },
    ];

    for (const block of blocks) {
      await prisma.block.create({ data: block });
    }
  }

  console.log("Database seeded successfully!");
  console.log("Superadmin: admin@auratech.cat / admin123");
  console.log("Editor: editor@auratech.cat / editor123");
  console.log("Client: oscar.rovira@auratech.cat / client123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
