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
- **Zod** validácia API vstupov
- nasadenie na **Vercel Free**

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
MVP ukladá nové články do `/tmp` (ephemeral storage), čo je vhodné na demo/prototyp.
Pre produkciu odporúčané free varianty:
- **Supabase (Postgres free tier)** alebo
- **Neon (Postgres free tier)**.

## Build pre Vercel
```bash
npm run build
```

Vercel deteguje Next.js projekt automaticky.

## Endpointy
- `GET /api/social/refresh` – načíta externé eventy/fotky + fallback dáta
- `POST /api/articles` – uloženie článku (title/content/status)

## Pôvodná špecifikácia
Detailná analýza a roadmapa: `docs/swing-community-portal-spec-sk.md`.
