# Auratech Web

Nova web corporativa i plataforma de clients d'Auratech, construïda amb Next.js 14, TypeScript i Tailwind CSS.

## Stack Tecnològic

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estils**: Tailwind CSS + shadcn/ui components
- **Autenticació**: NextAuth.js
- **Base de dades**: PostgreSQL + Prisma ORM
- **Animacions**: Framer Motion
- **Formularis**: React Hook Form + Zod
- **Icons**: Lucide React

## Prerequisits

- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

## Instal·lació

```bash
# 1. Instal·lar dependències
npm install

# 2. Configurar variables d'entorn
cp .env.example .env
# Edita .env amb les teves dades de connexió

# 3. Generar client Prisma
npx prisma generate

# 4. Crear taules a la base de dades
npx prisma db push

# 5. Seed de dades inicials
npm run db:seed

# 6. Iniciar servidor de desenvolupament
npm run dev
```

## Credencials de prova

- **Admin**: admin@auratech.cat / admin123
- **Client**: oscar.rovira@auratech.cat / client123

## Estructura del projecte

```
src/
├── app/
│   ├── (public)/    → Pàgines públiques (Home, Serveis, Projectes, etc.)
│   ├── (auth)/      → Login i Registre
│   ├── dashboard/   → Àrea de clients
│   ├── admin/       → Panel d'administració
│   └── api/         → API Routes
├── components/
│   ├── ui/          → Components base (Button, Card, Input, etc.)
│   ├── layout/      → Header, Footer, Sidebar
│   ├── sections/    → Seccions de pàgines
│   └── dashboard/   → Components del dashboard
├── lib/
│   ├── auth.ts      → Configuració NextAuth
│   ├── db.ts        → Client Prisma
│   ├── utils.ts     → Utilitats
│   └── validations/ → Esquemes Zod
└── types/           → TypeScript types
```

## Scripts disponibles

```bash
npm run dev          # Servidor de desenvolupament
npm run build        # Build de producció
npm run start        # Iniciar en producció
npm run lint         # Linter
npm run db:generate  # Generar client Prisma
npm run db:push      # Sincronitzar schema amb BD
npm run db:seed      # Seed de dades inicials
npm run db:studio    # Prisma Studio (GUI de BD)
```

## Desplegament

### Vercel (recomanat)
1. Connecta el repositori a Vercel
2. Configura les variables d'entorn
3. Vercel detectarà Next.js automàticament

### Docker
```bash
docker build -t auratech-web .
docker run -p 3000:3000 auratech-web
```

## Llicència

Privat - Auratech &copy; 2026
