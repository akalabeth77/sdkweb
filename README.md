# Swing Community Portal (Vercel-ready MVP)

Tento repozitár obsahuje funkčný MVP portál pre swing komunitu podľa pôvodnej špecifikácie:
- verejné stránky (domov, eventy, galéria, články),
- prepojenie na Facebook/Instagram/Google API (cez env premenné),
- prihlásenie (NextAuth + demo credentials + voliteľný Google OAuth),
- admin editor článkov s draft/published workflow,
- API endpoint pre refresh externých dát.

## Tech stack (free-friendly)
- **Next.js 14 + TypeScript**
- **NextAuth.js** (credentials + Google OAuth)
- **Prisma ORM** + **PostgreSQL** (Supabase / Neon free tier)
- **Zod** validácia API vstupov
- nasadenie na **Vercel Free**

## Nastavenie databázy (Supabase / Neon)

1. Vytvor projekt na [supabase.com](https://supabase.com) alebo [neon.tech](https://neon.tech)
2. Skopíruj connection string (formát `postgresql://...`) do `.env.local`
3. Spusti setup skript a inicializuj schému:
   ```bash
   node setup-prisma.js
   npm install
   npx prisma generate
   npx prisma db push
   ```

## Spustenie lokálne
```bash
npm install
npm run dev
```

## Demo prihlásenie
- `admin@swing.local` / `admin123`
- `editor@swing.local` / `editor123`
- `member@swing.local` / `member123`

## Environment variables (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-long-random-secret

# Databáza (Supabase / Neon)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require

# Voliteľné: Google OAuth login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Voliteľné: Facebook eventy
FB_PAGE_ID=
FB_ACCESS_TOKEN=

# Voliteľné: Instagram média
IG_ACCOUNT_ID=
IG_ACCESS_TOKEN=

# Voliteľné: Google Calendar eventy
GCAL_CALENDAR_ID=
GCAL_API_KEY=
```

Ak externé API kľúče nie sú nastavené, portál stále funguje s internými fallback dátami.

## Dôležitá poznámka k úložisku
Články sú uložené v **PostgreSQL databáze** cez Prisma ORM.
Pre nasadenie na Vercel nastav `DATABASE_URL` ako environment variable.

## Build pre Vercel
```bash
npm run build
```

Vercel deteguje Next.js projekt automaticky.
Pred buildom aj runtime nastav vo Vercel Project Settings -> Environment Variables hodnotu `DATABASE_URL` pre Production aj Preview.
Po nastavení `DATABASE_URL` aplikuj schému aj na cieľovej databáze (`npx prisma db push` alebo produkčne `npx prisma migrate deploy`), inak Prisma vráti chybu `P2021` (chýbajúca tabuľka).

## Endpointy
- `GET /api/social/refresh` – načíta externé eventy/fotky + fallback dáta
- `POST /api/articles` – uloženie článku (title/content/status)

## Pôvodná špecifikácia
Detailná analýza a roadmapa: `docs/swing-community-portal-spec-sk.md`.
