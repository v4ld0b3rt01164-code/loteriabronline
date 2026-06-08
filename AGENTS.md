# LoteriaBR v2 — AGENTS.md

## Stack

- **Astro 6** (static output) + **Tailwind CSS v4** + **TypeScript strict**
- All result rendering is **client-side** in `DateNav.astro`'s `<script>` — not SSR
- Backend is a separate Cloudflare Worker (`motor-cron.js`) at another repo — **not in this repo**

## Commands

```bash
npm run dev      # localhost:4321
npm run build    # outputs to dist/
npm run preview  # preview production build
```

Requires Node >= 22.12.0 (Astro 6 constraint).

## Architecture

```
src/
├── pages/        # 9 pages: 6 result pages + 3 static (contato, privacidade, termos)
├── layouts/      # BaseLayout (HTML shell + Footer), ResultLayout (adds Header + DateNav)
├── components/   # Header, Footer, DateNav, LotterySelector
├── lib/          # constants.ts, utils.ts
├── styles/       # global.css (Tailwind layers + custom CSS vars)
functions/api/    # contato.ts (Pages Function — posts to Resend)
public/           # animais-webp/, logo.webp, favicon.ico, manifest.json, robots.txt
```

## Deploy

Cloudflare Pages auto-deploys from `update-deepseek` repo on push to `main`.

**Build settings:**
- Framework: Astro
- Build command: `npm run build`
- Output directory: `/dist`
- Node version: 22+ (set via `NODE_VERSION` env var in Cloudflare Pages if needed)

**Env vars:**
- `RESEND_API_KEY` — required for contact form to actually send email. Without it, the form shows success but no email is sent (soft fail).

## Critical gotchas

- **Do NOT use `client:load` on `.astro` files** — Astro components with inline `<script>` already run client-side. `client:load` only works for framework components (React/Svelte/etc).
- **Tailwind v4** is built into Astro via `@tailwindcss/vite` plugin in `astro.config.mjs`. No PostCSS config needed. CSS is imported in `BaseLayout.astro`.
- **Result pages are thin wrappers** — `index.astro`, `look.astro`, `nacional.astro`, `bahia.astro`, `saopaulo.astro`, `federal.astro` all just pass `pageSlug` to `ResultLayout`. All rendering logic is in `DateNav.astro`'s `<script>`.
- **BA limit**: Bahia shows only 1º-5º (hardcoded `isBA` check in DateNav script).
- **API URL**: defined in `src/lib/constants.ts` — must point to the live Worker URL.
- **Worker is external**: `motor-cron.js` lives in `loteriabronline-coder/loteriabronline`. Updates are manual paste into Cloudflare dashboard — no CI/CD.

## Theme colors (Tailwind)

Custom colors defined in `tailwind.config.mjs`:

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0A` | Body background |
| `surface` | `#1E1E1E` | Cards, containers |
| `surface-2` | `#2D2D2D` | Elevated surfaces |
| `accent` | `#F59E0B` (amber) | Title bars (pares), links, headers |
| `success` | `#06B6D4` (cyan) | Title bars (ímpares), hover glow |
| `text-primary` | `#E5E7EB` | Body text |
| `text-secondary` | `#9CA3AF` | Labels, headers |
| `text-muted` | `#6B7280` | Subtle text |

### Gradients

- Pares cards: `bg-gradient-to-r from-accent to-orange-500`
- Ímpares cards: `bg-gradient-to-r from-success to-cyan-700`
- Card bg: `bg-gradient-to-br from-accent/[0.02] to-transparent`
- Body bg: `radial-gradient(ellipse 50% 0%, #181818 -> #0A0A0A)`

### Card hover

`-translate-y-1.5` + `shadow-[0_12px_40px_rgba(6,182,212,0.15)]` (cyan glow)

## Card grid layout

```
mobile:   grid-cols-2 gap-[6px] p-[6px]
tablet:   md:grid-cols-3 md:gap-[10px] md:p-[10px]
desktop:  lg:grid-cols-5
```

## Table alignment (responsive)

Fixed layout columns: `35% | 30% | 35%`.

### Desktop (lg:)

| Column | Header | Numbers |
|--------|--------|---------|
| Prêmio | text-left | `lg:pl-[13px]` (3px right) |
| Milhar | text-center | text-center |
| Grupo | text-left | `text-right lg:pr-5` (3px left) |

### Mobile

| Column | Header | Numbers |
|--------|--------|---------|
| Prêmio | text-left | `pl-[13px] pr-2` (3px right) |
| Milhar | text-center | text-center |
| Grupo | `pl-3 pr-2.5` | `text-right pr-[13px]` (3px left) |

## DateNav

- **Arrow buttons**: `<` and `>` buttons inside a `bg-surface-2` bordered wrapper
- **Date input**: `[&::-webkit-calendar-picker-indicator]:hidden` (no calendar icon)
- **Auto-refresh**: `setInterval` every 15 min, respects `document.hidden`
- **Data inteligente**: `getDataInteligente()` uses `America/Sao_Paulo` — before 01:00 BRT, shows yesterday
- **Time of day filter**: each loteria page filters by name prefix (`FILTROS[slug]` in constants.ts), sorted by draw time ascending

## Header

- Fixed top, `--header-h: 175px` CSS var
- Logo (WebP) + LotterySelector (dropdown) + DateNav (arrows + date input)
- Responsive: `gap-2 md:gap-5`, `py-3 md:py-4`

## Footer

- Fixed bottom, `--footer-h: 55px`
- `py-[6px]` with Links + copyright

## KV data format (external, read-only)

7 KV keys → `resultados_RJ`, `resultados_SP`, `resultados_BA`, `resultados_LBR`, `resultados_LOOK`, `resultados_LN`, `resultados_FEDERAL`

Each stores an array of `{ id, origem, data, horario, premios: string[], criado_em }`. `premios` has exactly 5 strings (4-digit or 5-digit for Federal).

Derived prizes (6º-10º) are calculated by the Worker API — **not stored in KV**.

## Animal images

25 WebP files at `/animais-webp/{1-25}.webp`. Referenced by group number in result cards. `drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]` styling.

Images are in SVG-based JS file. Converted from original PNGs via `cwebp -q 80`.

## PWA

- `manifest.json`: manual — update if app name/description changes
- Sitemap: auto-generated by `@astrojs/sitemap` based on `astro.config.mjs > site` URL

## Security audit (07/06/2026)

All 21 findings from the audit were fixed in commit `2bab1d9`:

- **XSS**: `innerHTML` replaced with DOM API (`createElement` + `textContent`) in DateNav card rendering. API data never goes through HTML interpolation.
- **Contact form**: error responses now correctly show "Erro" instead of fake "Sucesso". Email body sanitized via `escapeHtml()`. Security headers added to all API responses (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- **Timezone bug**: `getDataInteligente` now constructs the Brazil date from parsed parts instead of manipulating local Date objects, fixing off-by-one errors near midnight.
- **Dead code**: `api.ts`, `sw.js`, `@astrojs/mdx` removed.
- **CSS dedup**: `.btn-voltar`, `.pagina-estatica` moved to `global.css`; 3 static pages had ~50 lines of identical CSS removed.
- **Accessibility**: `focus-visible:ring` on all interactive elements, `aria-hidden` on decorative SVGs, skip-to-content link, 404 page.
- **Colors**: all hardcoded `#F4D03F` (wrong yellow) replaced with `#F59E0B` (accent amber).
- **FontAwesome**: replaced with inline SVGs (was invisible, FA was not loaded).
- **Services**: Event delegation on share buttons (no memory leak), non-blocking Google Fonts.
- **Dependencies**: `engines.node` fixed to `>=22.12.0`. `sw.js` removed (was caching non-existent `/style.css`).

