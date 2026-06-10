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
- **API**: Cloudflare Worker (`atualiza-resultados` in repo root) serves lottery data from Workers KV
- **KV Namespace**: `RESULTADOS` (ID: `3dffd78b43d34e5db66b3149db287821`)
- **Functions**: Cloudflare Pages Function for contact form (`/api/contato`)

## Repository Structure

### Single Repo: `loteriabronline`
- **`main`** branch → Production (`loteriabr.online`)
- **`loteriabrteste`** branch → Test environment

### Git Remotes
```bash
origin    → git@github.com:loteriabronline-coder/update-QWEN.git (legacy, to be deleted)
production → git@github.com:loteriabronline-coder/loteriabronline.git
```

## Deployment

### Site (Cloudflare Pages)

#### Production (`loteriabr.online`)
```bash
# Auto-deploys on push to main branch
git push production main
```

#### Test (`update-gpt.pages.dev`)
```bash
# Auto-deploys on push to loteriabrteste branch
git push production loteriabrteste
```

#### Manual Deploy via API (if needed)
```bash
# For production
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/f5f2b9d01f0c51159e468dd49339b8be/pages/projects/loteriabronline/deployments" \
  -H "Authorization: Bearer <TOKEN>" \
  -F 'branch=main' \
  -F 'production=true' \
  -F 'manifest={}' \
  -F 'dist_dir=@/home/valdo/DEV/update-GPT/dist'

# For test
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/f5f2b9d01f0c51159e468dd49339b8be/pages/projects/update-gpt/deployments" \
  -H "Authorization: Bearer <TOKEN>" \
  -F 'branch=main' \
  -F 'manifest={}' \
  -F 'dist_dir=@/home/valdo/DEV/update-GPT/dist'
```

### Worker (`atualiza-resultados`)

#### Configuration File
`wrangler.toml` at repo root contains worker configuration and observability settings.

#### Deploy via Cloudflare REST API
```bash
# Copy with .js extension for upload
cp atualiza-resultados /tmp/atualiza-resultados-worker.js

# Create metadata JSON (must include KV binding)
cat > /tmp/deploy-meta.json << 'EOF'
{
  "main_module": "atualiza-resultados-worker.js",
  "compatibility_date": "2024-01-01",
  "bindings": [
    {
      "name": "RESULTADOS",
      "type": "kv_namespace",
      "namespace_id": "3dffd78b43d34e5db66b3149db287821"
    }
  ]
}
EOF

# Deploy (requires token with Workers:Edit + KV:Edit)
curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/f5f2b9d01f0c51159e468dd49339b8be/workers/scripts/atualiza-resultados" \
  -H "Authorization: Bearer <TOKEN>" \
  -F 'metadata=@/tmp/deploy-meta.json;type=application/json' \
  -F 'atualiza-resultados-worker.js=@/tmp/atualiza-resultados-worker.js;type=application/javascript+module'
```

**CRITICAL**: The API token MUST have both `Workers:Edit` AND `KV:Edit` permissions. Two separate tokens won't work — the deploy API requires a single token with both. Without KV:Edit, the binding gets silently removed and the worker breaks (returns empty data).

#### Observability
Worker has observability enabled via `wrangler.toml`:
```toml
[observability]
enabled = true
head_sampling_rate = 1

[observability.logs]
enabled = true
head_sampling_rate = 1
persist = true
invocation_logs = true

[observability.traces]
enabled = false
persist = true
head_sampling_rate = 1
```

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
- **Large (1440px+)**: 5 columns (same as desktop)
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

## Lottery Data Rules
- **BAHIA**: Prizes 1º-10º are ALL drawn (sorteados), never computed. They come raw from scraping and must be stored/displayed as-is. `LOTERIAS_10_PREMIOS` in the worker includes `['BA']` for this.
- **origem field**: All BA entries in KV must use `origem: "BA"` (not `"BAHIA"`). The scraping function uses `sigla: 'BA'`. If you see `"BAHIA"` in KV data, it's stale — normalize it to `"BA"`.
- **Other lotteries** (RJ, SP, LBR, LOOK): 5 prizes + computed 6º-8º via math formulas in the worker API.

## Design System (tailwind.config.mjs)
- **Colors**: bg `#050510`, surface `#0C0C24`, accent `#6366F1`, violet `#8B5CF6`, pink `#EC4899`
- **Fonts**: Inter (sans), Space Grotesk (display), JetBrains Mono (mono)
- **Animations**: gradient-x, float, shimmer, glow-border
- **Shadows**: glow, glow-lg, glow-violet, glow-pink, card, card-hover

## External Dependencies
- `@astrojs/sitemap` for sitemap generation
- `resend.com` API for contact emails (requires `RESEND_API_KEY` env var)

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
- **Calendar picker**: Use `md:[&::-webkit-calendar-picker-indicator]:invert` for desktop visibility on dark theme. Mobile uses native date picker overlay.
- **WhatsApp share**: Uses formatted text with 🍀 clover emoji (no calendar emoji), bolding, and separator. "BR" displayed as "LBR" via `utils.ts` `nomeExibicao()` function
- **Contact form**: Sends to `loteriabronline@gmail.com` from `contato@loteriabr.online`. Returns explicit error if `RESEND_API_KEY` not configured (does NOT return success without sending)

## Verification
```bash
npm run build  # Must pass without errors
```

No test suite exists. Manual verification: check dev server loads, date navigation works, cards render correctly on mobile (2 cols) and desktop (5+ cols).
