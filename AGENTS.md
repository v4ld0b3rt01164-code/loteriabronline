# LoteriaBR - Agent Instructions

## Project Overview
Astro 6 static site for lottery results (Jogo do Bicho, Federal, Nacional, etc.). Fetches data from Workers KV via external API. Premium glassmorphism UI with indigo/violet/pink palette.

## Commands
```bash
npm run dev       # Start dev server (astro dev)
npm run build     # Production build (astro build)
npm run preview   # Preview build locally
```

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
| Bahia | `bahia` | BAHIA (shows only 5 prizes) |
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
- Bahia page limits to 5 prizes (`isBA` flag in DateNav)
- Date logic in `getDataInteligente()` uses America/Sao_Paulo timezone, shifts to previous day before 1 AM
- Animal images loaded from `/animais-webp/{grupo}.webp` (1-25)
- Share button uses WhatsApp deep link with formatted text
- Auto-refresh every 15 min when tab visible

## Verification
```bash
npm run build  # Must pass without errors
```

No test suite exists. Manual verification: check dev server loads, date navigation works, cards render correctly on mobile (2 cols) and desktop (5+ cols).