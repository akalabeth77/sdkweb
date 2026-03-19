# Swing Dance Košice

Production-ready bilingual (SK/EN) community website built with Next.js 14, TypeScript, TailwindCSS, and Sanity CMS v3.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env.local
```

3. Run dev server:

```bash
npm run dev
```

## Facebook integration

- Add `FACEBOOK_ACCESS_TOKEN` to `.env.local` to load the latest Facebook posts server-side on the community page.
- `FACEBOOK_PAGE_ID` is optional; if omitted, the app tries to discover the first manageable Facebook page from the token.
- `NEXT_PUBLIC_FACEBOOK_PAGE_URL` controls the public CTA link shown next to the Facebook feed.
- Keep the token only in `.env.local`; it is ignored by git and never exposed to the browser.

## Authentication module

- Login page: `/auth/signin`
- User management page: `/admin/users` (ADMIN only)
- Auth is cookie-based with signed server session token.
- User data is stored in `data/users.json`.
- Optional bootstrap admin is created automatically on first login attempt when these env vars are set:
  - `AUTH_BOOTSTRAP_ADMIN_EMAIL`
  - `AUTH_BOOTSTRAP_ADMIN_PASSWORD`
  - `AUTH_BOOTSTRAP_ADMIN_NAME` (optional)

## Features

- Localized routes (`/sk`, `/en`) with locale switcher.
- Sanity-driven pages for home, events, courses, syllabus, teachers, blog, gallery, and community.
- GROQ-based data layer and typed frontend models.
- SEO metadata, OpenGraph, sitemap, event JSON-LD, and ICS export.
- Mobile-first responsive UI, dark/light friendly design, smooth card animations.
- Auth module with role-based user management (ADMIN, EDITOR).
