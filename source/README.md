# Default Storefront — SvelteKit source

Day-to-day development for the default Oshkelosh storefront. See [../README.md](../README.md) for the full addon guide.

## Development

Requires the Oshkelosh backend running at `http://127.0.0.1:8000`.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API requests go to `http://127.0.0.1:8000` (via `.env.development`).

Ensure backend `CORS_ORIGINS` includes:

```
http://localhost:5173,http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

Static output is written to `../dist/` with SPA fallback (`index.html`). Reload `http://localhost:8000/` after building.

## Type-check

```bash
npm run check
```

## Storefront contract

On startup the app:

1. Loads theme CSS from `/api/v1/storefront/theme.css`
2. Fetches merged config from `/api/v1/storefront/config`
3. Applies site branding (name, colors, fonts, logo)

If no frontend addon is enabled (503), the app falls back to default branding.

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — featured products |
| `/products` | Catalog with search and pagination |
| `/products/[slug]` | Product detail |
| `/categories/[slug]` | Products in a category |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/login`, `/register`, `/account` | Auth |
| `/forgot-password`, `/reset-password`, `/verify-email` | Password and email flows |
| `/orders`, `/orders/[id]` | Order history |
| `/auth/sso/callback` | SSO token exchange |

## API client modules

| File | Purpose |
|------|---------|
| `lib/api/storefront.ts` | Config and theme |
| `lib/api/products.ts` | Product catalog |
| `lib/api/categories.ts` | Categories |
| `lib/api/auth.ts` | Login, register, profile, password reset |
| `lib/api/cart.ts` | Cart |
| `lib/api/orders.ts` | Orders and checkout |
| `lib/api/sso.ts` | SSO flows |
| `lib/api/client.ts` | Shared fetch wrapper |
| `lib/api/config.ts` | Dev vs prod API base URL |

## Deployment

1. Run `npm run build` (outputs to `../dist/`)
2. Reload `http://localhost:8000/`
3. Enable **Default Storefront** at `/admin/frontends/default` if not already active
