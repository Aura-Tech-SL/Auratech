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
