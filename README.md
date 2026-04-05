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
NEXTAUTH_SECRET=swingdancekosiceweb

# Databáza (Supabase / Neon)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require

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
Články, interné eventy a interná galéria sú uložené v **PostgreSQL databáze** cez Prisma ORM.
Pre nasadenie na Vercel nastav `DATABASE_URL` ako environment variable.

## Build pre Vercel
```bash
npm run build
```

Vercel deteguje Next.js projekt automaticky.
Build script na Verceli automaticky spustí `prisma migrate deploy`, ak sú dostupné `VERCEL`, `DATABASE_URL` a `DIRECT_URL`.
Pred buildom aj runtime nastav vo Vercel Project Settings -> Environment Variables hodnoty `DATABASE_URL` a `DIRECT_URL` pre Production aj Preview.
Pre Supabase používaj:
- `DATABASE_URL` = transaction pooler URL (port `6543`) pre runtime aplikácie
- `DIRECT_URL` = direct Postgres URL (port `5432`) pre Prisma migrácie

Príklad pre serverless runtime (odporúčané parametre):
```bash
DATABASE_URL=postgresql://USER:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://USER:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

Ak použiješ session pooler URL na porte `5432` pre runtime, môžeš dostať chybu `MaxClientsInSessionMode`.
Ak `migrate deploy` vráti `P3005` (existujúca DB bez Prisma migration histórie), build script automaticky použije `prisma db push` ako fallback pre prvé zosúladenie schémy.
Odporúčané dlhodobé riešenie je spraviť Prisma baseline migráciu pre produkčnú databázu.
Po nastavení `DATABASE_URL` aplikuj schému aj na cieľovej databáze (`npx prisma db push` alebo produkčne `npx prisma migrate deploy`), inak Prisma vráti chybu `P2021` (chýbajúca tabuľka).

### Rýchly fix chyby `internal_events` neexistuje
Ak vidíš chybu `The table public.internal_events does not exist`, databáza nemá aplikovanú aktuálnu schému.

Spusti:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

Pre lokálny vývoj môžeš použiť aj:
```bash
npx prisma db push
```

## Vercel auth konfigurácia
Pre funkčné prihlasovanie nastav vo Vercel Environment Variables:
- `NEXTAUTH_SECRET` (dlhý náhodný secret, minimálne 32 znakov)
- `NEXTAUTH_URL` (produkčná URL, napr. `https://your-app.vercel.app`)

Ak `NEXTAUTH_SECRET` chýba, NextAuth v produkcii vráti chybu `Configuration` a prihlasovanie zlyhá.

## Admin editory
- `/admin/articles` - vytvorenie a editácia existujúcich článkov
- `/admin/events` - vytvorenie a editácia interných eventov
- `/admin/gallery` - vytvorenie a editácia interných položiek galérie
- `/admin/users` - schvaľovanie registrácií používateľov (iba admin)

### Albumy v galérii
Editor galérie podporuje aj albumové zdroje:
- `instagram` - zadaj Instagram Business account ID; potrebuje `IG_ACCESS_TOKEN`
- `google-drive` - zadaj verejný Google Drive folder URL alebo folder ID; potrebuje `GOOGLE_DRIVE_API_KEY`
- `local-folder` - zadaj relatívnu cestu pod `LOCAL_GALLERY_ROOT`; vhodné pre lokálny/self-hosted server, nie pre trvalé úložisko na Vercel

### Eventy - opakovanie a séria
- Pri vytváraní eventu môžeš zapnúť opakovanie, vybrať dni v týždni a dátum "opakovať do".
- Pri editácii existujúceho opakovaného eventu môžeš zvoliť "upraviť celú sériu".
- Pri mazaní je dostupná aj akcia "vymazať celú sériu".
- Eventy podporujú aj polia `description` a `category` (`course`, `dance-party`, `workshop`, `festival`, `concert`, `other`).
- Verejné stránky článkov a eventov obsahujú tlačidlá na zdieľanie.
- Stránka eventov obsahuje mini kalendár aktuálneho mesiaca s farebným odlíšením podľa kategórie eventu.
- Stránka eventov podporuje filtrovanie podľa kategórie.
- Klik na deň v mini kalendári zobrazí eventy pre vybraný deň.
- Články aj eventy majú samostatné detail stránky vhodné na priame zdieľanie URL.

Po pullnutí nových zmien aplikuj migrácie, aby sa vytvorili nové stĺpce v `internal_events` (`recurrenceGroupId`, `description`, `category`):
```bash
npx prisma migrate deploy
```

## Registrácia používateľov
- Verejná registrácia: `/register`
- Nový účet má stav `pending` a prihlásenie je možné až po schválení adminom.
- Admin schvaľuje/zamieta účty v `/admin/users`.

Po zmene Prisma schémy nezabudni aplikovať zmeny do DB:
```bash
npx prisma db push
```

## Endpointy
- `GET /api/social/refresh` – načíta externé eventy/fotky + fallback dáta
- `POST /api/articles` – uloženie článku (title/content/status)

## Pôvodná špecifikácia
Detailná analýza a roadmapa: `docs/swing-community-portal-spec-sk.md`.
