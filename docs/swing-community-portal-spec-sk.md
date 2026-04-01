# Komplexný online portál pre swingovú komunitu

## 1. Cieľ portálu
Vytvoriť centrálny webový portál pre swingovú komunitu, ktorý:
- agreguje obsah zo sociálnych sietí (Facebook, Instagram) a Google účtu,
- ponúka kalendár udalostí,
- obsahuje používateľské účty s rolami a prístupovými právami,
- umožňuje tvorbu a publikovanie článkov cez interný editor,
- je prehľadný, responzívny a jednoduchý na používanie.

---

## 2. Funkčné požiadavky

### 2.1 Verejná časť portálu
- **Domovská stránka**
  - najbližšie udalosti,
  - najnovšie fotografie,
  - zvýraznené články/novinky,
  - CTA prvky (registrácia, prihlásenie, členstvo).
- **Galéria**
  - automaticky načítané albumy/fotografie z Facebooku/Instagramu,
  - filtrovanie podľa udalosti, dátumu, tagov.
- **Udalosti (Eventy)**
  - prehľad udalostí (zo sociálnych sietí + interné eventy),
  - detail eventu: dátum, miesto, popis, organizátor, registrácia.
- **Blog/Novinky**
  - zoznam článkov,
  - kategórie a štítky,
  - fulltextové vyhľadávanie.

### 2.2 Používateľské účty
- Registrácia (e-mail + heslo, prípadne OAuth Google/Facebook).
- Prihlásenie/odhlásenie.
- Obnova hesla.
- Profil používateľa (meno, avatar, preferencie).
- Role a oprávnenia (RBAC):
  - **Guest** – iba verejný obsah,
  - **Member** – komunitné sekcie, RSVP, komentáre,
  - **Editor** – tvorba a úprava článkov,
  - **Admin** – správa používateľov, rolí, integrácií a publikácie.

### 2.3 Editor článkov (CMS modul)
- WYSIWYG editor (napr. TipTap/Editor.js).
- Draft/Published workflow.
- Verzionovanie článkov.
- Nahrávanie obrázkov a média knižnica.
- Schvaľovanie článkov (Editor -> Admin publish).

### 2.4 Admin panel
- Správa používateľov (aktivácia/deaktivácia, role).
- Správa článkov a kategórií.
- Moderácia komentárov.
- Nastavenie API integrácií (Facebook, Instagram, Google).
- Monitoring synchronizácií (logy, chyby, posledný sync).

---

## 3. Integrácie so sociálnymi sieťami a Google

### 3.1 Facebook
- Integrácia cez **Meta Graph API**.
- Načítavanie:
  - udalostí z Facebook stránky,
  - fotografií/albumov,
  - základných metadát príspevkov.
- Synchronizácia periodicky cez background job (napr. každých 15–30 min).

### 3.2 Instagram
- Integrácia cez **Instagram Graph API** (Business/Creator účet prepojený na FB stránku).
- Načítavanie:
  - médií (obrázky, reels preview),
  - popisov a odkazov.

### 3.3 Google účet
- **Google Calendar API**: import udalostí do interného kalendára.
- **Google Photos API** (ak použiteľné podľa scope): import vybraných albumov.
- **Google OAuth 2.0**: prihlásenie používateľa cez Google účet.

### 3.4 Architektúra synchronizácie
- Samostatná tabuľka `external_sync_jobs` a `external_items`.
- Idempotentný import podľa externého ID.
- Retry politika pri API chybách (exponenciálny backoff).
- Manuálne spustenie synchronizácie v admin paneli.

---

## 4. Odporúčaná technická architektúra

### 4.1 Frontend
- **Next.js (React + TypeScript)**
- UI knižnica: Tailwind CSS + komponentový systém (napr. shadcn/ui)
- SSR/ISR pre rýchle načítanie verejného obsahu

### 4.2 Backend
- **Node.js (NestJS alebo Next.js API routes)**
- REST alebo GraphQL API
- Autentifikácia: JWT + refresh tokens, OAuth 2.0
- RBAC middleware

### 4.3 Databáza a storage
- **PostgreSQL** (users, roles, posts, events, media metadata)
- **Redis** (cache/session/rate-limit)
- Objektové úložisko pre média (S3 kompatibilné)

### 4.4 Asynchrónne spracovanie
- Queue systém (BullMQ/RabbitMQ)
- Cron joby pre synchronizácie sociálnych sietí

### 4.5 Deployment
- Docker kontajnery
- CI/CD (GitHub Actions)
- Hosting: Vercel (frontend) + Render/Fly/Cloud (backend), alebo full-stack na jednej platforme

---

## 5. Návrh dátového modelu (zjednodušene)

- `users` (id, email, password_hash, name, role_id, is_active, created_at)
- `roles` (id, name)
- `articles` (id, title, slug, content_json, status, author_id, published_at)
- `article_versions` (id, article_id, content_json, edited_by, created_at)
- `events` (id, title, start_at, end_at, location, description, source, external_id)
- `media_items` (id, type, url, thumbnail_url, source, external_id, event_id)
- `oauth_accounts` (id, user_id, provider, provider_user_id, access_token_meta)
- `sync_logs` (id, provider, status, message, started_at, finished_at)

---

## 6. UX/UI požiadavky
- Moderný, čistý dizajn (mobil-first).
- Jasná navigácia: Domov / Eventy / Galéria / Články / Komunita.
- Konzistentné CTA (Pridať sa, Registrovať, Prihlásiť).
- Prístupnosť (WCAG 2.1 AA): kontrast, alt texty, ovládanie klávesnicou.
- Jazykové verzie (min. SK, voliteľne EN).

---

## 7. Bezpečnosť a GDPR
- Hashovanie hesiel (Argon2/Bcrypt).
- CSRF ochrana, rate limiting, audit logy.
- Consent management pre cookies.
- Export a vymazanie osobných údajov (GDPR práva používateľa).
- Minimalizácia scope pri API tokenoch tretích strán.

---

## 8. Realizačný plán (fázy)

### Fáza 1 – MVP (4–6 týždňov)
- Auth + role systém
- Základný CMS (články)
- Eventy (manuálne)
- Jednoduchá galéria

### Fáza 2 – Integrácie (3–5 týždňov)
- Facebook/Instagram import médií a eventov
- Google Calendar sync
- Admin monitoring syncu

### Fáza 3 – Komunitné funkcie (2–4 týždne)
- RSVP/registrácia na eventy
- Komentáre, notifikácie
- Rozšírený profil používateľa

### Fáza 4 – Optimalizácia a rast (priebežne)
- SEO a analytika
- Výkonnostné optimalizácie
- Automatizované testy a observabilita

---

## 9. Kritériá úspechu
- Automatická synchronizácia eventov a médií bez manuálneho zásahu.
- Administrátor zvládne publikovať článok do 5 minút.
- Používateľ sa zaregistruje a prihlási do 1 minúty.
- Mobilné skóre Lighthouse > 85.
- Dostupnosť systému > 99,5 %.

---

## 10. Ďalšie odporúčania
- Začať s MVP a neimplementovať naraz všetko.
- Pri sociálnych integráciách počítať s limitmi API a schvaľovacími procesmi Meta/Google.
- Zaviesť staging prostredie s testovacími účtami pre Facebook/Instagram/Google.
- Pripraviť redakčné pravidlá pre editorov (štýl článkov, workflow schvaľovania).
