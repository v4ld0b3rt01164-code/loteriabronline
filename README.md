# LoteriaBR v2 — Ultra-Atualização

Frontend reconstruído com **Astro + Tailwind CSS + TypeScript**.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Astro 6 |
| CSS | Tailwind CSS 3 |
| TypeScript | Strict mode |
| Ícones | Lucide (bundled) |
| Backend | Worker Cloudflare (inalterado) |
| Banco | KV Cloudflare (inalterado) |

## Comandos

```bash
npm run dev      # Dev server local (porta 4321)
npm run build    # Build produção → dist/
npm run preview  # Preview do build local
```

## Deploy

1. Conecte este repositório ao Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. (Opcional) Configurar KV binding `RESULTADOS` se usar Pages Functions
5. Para email no formulário de contato: configurar `RESEND_API_KEY` como env var
