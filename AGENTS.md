# LoteriaBR - Agent Instructions

## Project
Astro 6 static site for Brazilian lottery results (Jogo do Bicho, Federal, Nacional). Fetches from Cloudflare Workers KV. Glassmorphism UI with indigo/violet/pink on dark background.

## Commands
- `npm run dev` — dev server (Node >=22.12.0)
- `npm run build` — production build
- `npm run preview` — preview build locally

No test suite exists.

## Repository
- GitHub: `v4ld0b3rt01164-code/loteriabronline`
- Production: `loteriabr.online` (Cloudflare Pages)
- Deploy: automatic on push to `main` via Cloudflare Pages integration

## Architecture
- **Framework**: Astro 6, `output: 'static'`, `build.assets: '_assets'`
- **Styling**: Tailwind v3, custom design system (`bg:#050510`, `accent:#6366F1`, `violet:#8B5CF6`, `pink:#EC4899`)
- **Fonts**: Inter (sans), Space Grotesk (display), JetBrains Mono (mono)
- **API**: Cloudflare Worker at `https://atualiza-resultados.v4ld0b3rt01164.workers.dev/api/listar?data=YYYY-MM-DD`
- **Worker KV**: Namespace `RESULTADOS`, ID `3dffd78b43d34e5db66b3149db287821`
- **Worker file**: `atualiza-resultados` (no extension) at repo root

## Components
- `Header.astro` — Main header (lottery result pages). Logo has `fetchpriority="high"`.
- `StaticHeader.astro` — Simplified header for static pages (contato, política, termos)
- `Footer.astro` — Fixed footer with `aria-current="page"` on active nav link, `aria-label="Rodapé"`
- `LotterySelector.astro` — Dropdown to switch between lottery pages
- `DatePicker.astro` — Extracted date navigation controls (prev/input/next)
- `DateNav.astro` — Imports DatePicker, contains `<template id="cardTemplate">` and all client-side logic (fetch, filter, render, WhatsApp share, auto-refresh)
- `ResultCard.astro` — Semantic card component (`<article>`, `<h3>`, `<caption>`, `<table>`) for future SSR use

## Card Rendering
Cards are rendered client-side via `<template>` cloning (not `createElement`). The template is in `DateNav.astro`. Each card is an `<article class="result-card">` with proper headings and table semantics. The JS clones the template, populates data, and appends to `#resultContainer`.

WhatsApp share is an `<a>` tag (not `<button>`) with `target="_blank" rel="noopener noreferrer"`.

## Pages
- `src/pages/index.astro` — Homepage (BR, Rio de Janeiro, Federal). Standalone file.
- `src/pages/[slug].astro` — Dynamic route for look, nacional, bahia, saopaulo. Uses `getStaticPaths()`.
- Static pages: `contato.astro`, `politica-de-privacidade.astro`, `termos-de-uso.astro`, `404.astro`

## SEO
- `og-image.webp` in `public/` (1200x630px) for social media sharing
- `BaseLayout.astro`: canonical, `hreflang="pt-BR"`, `robots: index, follow`, og:url, og:locale, og:image dimensions, twitter:summary_large_image
- Structured data (JSON-LD `WebSite`) on homepage
- `manifest.json` with PWA icons (192x192, 512x512)

## WhatsApp Share
Message is plain text only (no emojis — caused encoding issues on PC Web):
```
*{nome}*
*{data}*

*1* • 3047 — Elefante
*2* • 2002 — Avestruz
...

━━━━━━━━━━━━━━
*loteriabr.online*
```
Share link uses `wa.me` with `encodeURIComponent`. Opens with `rel="noopener,noreferrer"`.

## i18n
Text strings are centralized in `src/lib/constants.ts` as `TEXTOS` object. Use this instead of hardcoding Portuguese strings in components.

## Grid System
- `<640px`: 2 cols; `640-1024px`: 3 cols; `1024px+`: 5 cols
- Defined in `src/styles/global.css` as `.card-grid`
- `prefers-reduced-motion: reduce` disables all animations

## Lottery Pages & Filters (`FILTROS` in `constants.ts`)
| slug | lotteries |
|------|-----------|
| index | BR, RIO DE JANEIRO, FEDERAL |
| look | GOIÁS |
| nacional | NACIONAL |
| bahia | BAHIA |
| saopaulo | SÃO PAULO |

## Lottery Data Rules
- **BAHIA**: 10 prizes, all drawn. `origem: "BA"` in KV (not "BAHIA").
- **Others**: 5 prizes + computed 6-8 via worker math formulas.

## Naming (`utils.ts` `nomeExibicao`)
- `BR` displays as `LBR`
- `RIO DE JANEIRO` displays as `RJ`
- Time suffix appended: `"{nome} - {horario}"`

## Deploy — Worker via REST API
Worker deploys via Cloudflare API (not wrangler CLI). Token MUST have both `Workers:Edit` AND `KV:Edit` in a single token — two separate tokens silently strip the KV binding.

`wrangler.toml` has `[observability]` — do NOT add `[observability.logs]` or `[observability.traces]` sub-tables (invalid schema, causes error 1102 on deploy).

## Key Directories
- `src/components/` — Header, StaticHeader, Footer, DatePicker, DateNav, LotterySelector, ResultCard
- `src/lib/` — `constants.ts` (ANIMAIS, FILTROS, TEXTOS, API_URL), `utils.ts`
- `public/animais-webp/` — 25 animal images (1-25.webp)
- `public/og-image.webp` — Open Graph image (1200x630)
- `public/icon-192.png`, `icon-512.png` — PWA icons
- `functions/api/contato.ts` — contact form (Resend, sends to loteriabronline@gmail.com)

## Gotchas
- `API_URL` in `constants.ts` falls back to `window.API_URL` for dev override
- `getDataInteligente()` uses America/Sao_Paulo, shifts to previous day before 1 AM
- Auto-refresh every 15 min when tab visible
- Logo: `logo.webp` (1134x304, alpha). Mobile: 65px h, Desktop: 100px h
- Table `<thead>` is hidden on mobile (`hidden md:table-header-group`) to prevent column overflow
- Animal images use `loading="lazy"` and explicit `width`/`height` for CLS prevention
- `getStaticPaths()` in `[slug].astro` must inline props directly — cannot reference variables defined outside the function (Astro compilation quirk)
