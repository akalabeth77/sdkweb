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
