# LoteriaBR - Agent Instructions

## Project Overview
Astro 6 static site for lottery results (Jogo do Bicho, Federal, Nacional, etc.). Fetches data from Workers KV via external API. Premium glassmorphism UI with indigo/violet/pink palette.

## Commands
```bash
npm run dev       # Start dev server (astro dev) - requires Node >=22.12.0
npm run build     # Production build (astro build)  - requires Node >=22.12.0
npm run preview   # Preview build locally
```

> **Node**: Astro 6 requires Node >=22.12.0. Use `nvm use 22.22.3` (available in the environment).

## Architecture
- **Framework**: Astro 6 (static output)
- **Styling**: Tailwind CSS v3 with custom design system
- **TypeScript**: Strict mode
- **API**: External Workers KV endpoint (`https://atualiza-resultados.v4ld0b3rt01164.workers.dev/api/listar`)
- **Functions**: Cloudflare Pages Function for contact form (`/api/contato`)

## Key Directories
```
src/
├── components/    # Header, Footer, DateNav, LotterySelector
├── layouts/       # BaseLayout, ResultLayout
├── lib/           # constants.ts (ANIMAIS, LOTERIA_PAGES, FILTROS, API_URL), utils.ts
├── pages/         # 6 result pages + 3 static + 404
├── styles/        # global.css (design system, animations, card-grid)
public/
├── animais-webp/  # 25 animal images (1-25.webp)
functions/api/
└── contato.ts     # Contact form handler (Resend)
```

## Grid System (Critical)
- **Mobile (<640px)**: 2 columns (`repeat(2, 1fr)`)
- **Tablet (640-1024px)**: 3 columns
- **Desktop (1024-1440px)**: 5 columns
- **Large (1440px+)**: 6 columns
Defined in `src/styles/global.css` as `.card-grid`

## Lottery Pages & Filters
| Page | Slug | Filter (FILTROS) |
|------|------|------------------|
| Index | `index` | BR, RIO DE JANEIRO, FEDERAL |
| Look | `look` | GOIÁS |
| Nacional | `nacional` | NACIONAL |
| Bahia | `bahia` | BAHIA |
| São Paulo | `saopaulo` | SÃO PAULO |
| Federal | `federal` | FEDERAL |

## Data Flow
1. User selects date via `DateNav` component
2. `DateNav` script fetches from `API_URL?data=YYYY-MM-DD`
3. Filters lotteries by `FILTROS[pageSlug]`
4. Sorts by time (extracted from lottery name)
5. Renders cards via `renderizarCards()` into `#resultContainer`

## Design System (tailwind.config.mjs)
- **Colors**: bg `#050510`, surface `#0C0C24`, accent `#6366F1`, violet `#8B5CF6`, pink `#EC4899`
- **Fonts**: Inter (sans), Space Grotesk (display), JetBrains Mono (mono)
- **Animations**: gradient-x, float, shimmer, glow-border
- **Shadows**: glow, glow-lg, glow-violet, glow-pink, card, card-hover

## External Dependencies
- `@astrojs/sitemap` for sitemap generation
- `resend.com` API for contact emails (requires `RESEND_API_KEY` env var)

## Deployment
- Static output to `dist/`
- Assets in `dist/_assets/`
- Configured for `https://loteriabr.online`
- Cloudflare Pages compatible (functions/api)

## Gotchas
- `API_URL` in `constants.ts` uses `window.API_URL` fallback for dev
- Date logic in `getDataInteligente()` uses America/Sao_Paulo timezone, shifts to previous day before 1 AM
- Animal images loaded from `/animais-webp/{grupo}.webp` (1-25)
- Share button uses WhatsApp deep link with formatted text
- Auto-refresh every 15 min when tab visible
- **Logo**: `public/logo.webp` (1134x304, RGBA with alpha). Source: `public/logo.png` converted via sharp (`sharp(input).webp({quality:90, alphaQuality:90})`). Mobile: 78px height, Desktop: 100px height
- **Table dividers**: Use `border-b border-white/5` on `<tr>` instead of `divide-y` on `<tbody>` to avoid vertical column lines. Table must use `border-collapse` (Tailwind preflight default) — do NOT use `border-separate`.
- **Card background**: `rgba(10, 10, 28, 0.55)` with `blur(14px)`, border `rgba(99, 102, 241, 0.15)`, and inset shadow — elegant distinction against `#050510` body background
- **Mobile header**: `--header-h: 175px` (CSS var in `global.css:20`). Desktop: `180px`. Body has `padding-top: var(--header-h)` in BaseLayout
- **Mobile select**: `max-w-none w-auto` (no width constraint) to avoid text clipping. Desktop: `md:max-w-[220px]`
- **WhatsApp share**: Uses formatted text with 🍀 clover emoji (no calendar emoji), bolding, and separator. "BR" displayed as "LBR" via `utils.ts` `nomeExibicao()` function
- **Contact form**: Sends to `loteriabronline@gmail.com` from `contato@loteriabr.online`. Returns explicit error if `RESEND_API_KEY` not configured (does NOT return success without sending)

## Verification
```bash
npm run build  # Must pass without errors
```

No test suite exists. Manual verification: check dev server loads, date navigation works, cards render correctly on mobile (2 cols) and desktop (5+ cols).