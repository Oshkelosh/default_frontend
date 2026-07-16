# Default Storefront (`default`)

SvelteKit reference storefront for Oshkelosh: catalog, auth, cart, checkout, orders, and SSO callback integration.

This package is both a **developer example** and a **production-ready** frontend. The GitHub source archive on `main` is installable via Admin → Install addon (no separate release artifact).

## Overview

| | |
|---|---|
| Addon ID | `default` |
| Category | frontend (on-disk folder: `frontends/`) |
| Version | 1.0.0 |
| Category guide | [../README.md](../README.md) |
| Source | `source/` (SvelteKit 2 + Svelte 5) |
| Build output | `dist/` (committed; served at `/`) |
| Manifest | `oshkelosh-addon.json` |

Only **one** frontend addon is active at a time. API routes stay at `/api/v1/*` on the same host.

## Production install

From an Oshkelosh admin session (**Dashboard → Install addon**), use the GitHub source archive URL:

```
https://github.com/Oshkelosh/default_frontend/archive/refs/heads/main.zip
```

The archive includes `oshkelosh-addon.json`, the Python addon package, and a prebuilt `dist/`. After install:

1. Restart Oshkelosh (or rely on the addon-restart watcher)
2. Enable **Default Storefront** under **Admin → Addons**
3. Configure layout options at `/admin/frontends/default`
4. Set site branding at `/admin/settings`

## Local development

Clone into the host category path:

```bash
git clone git@github.com:Oshkelosh/default_frontend.git app/addons/frontends/default
```

### Prerequisites

- Oshkelosh backend at `http://127.0.0.1:8000` (`./scripts/run_dev.sh`)
- Node.js 18+

```bash
cd source
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Add to backend `.env` if CORS fails:

```
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000
```

### Releasing SPA changes

Because the raw `main` archive is the distribution channel, commit an updated `dist/` whenever you ship storefront changes:

```bash
cd source
npm install
npm run build   # writes ../dist/
git add ../dist ../oshkelosh-addon.json
git commit -m "Rebuild storefront dist for ZIP install"
git push origin main
```

Keep ignoring `node_modules/` and `.svelte-kit/`; do **not** gitignore `dist/`.

## Configuration schema

Frontend-specific options only — site branding comes from Site Settings.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `layout` | `"grid"` \| `"list"` | `"grid"` | Product listing layout |
| `hero_products` | int (1–100) | `5` | Homepage carousel size |
| `category_products` | int (1–100) | `8` | Products per category row on homepage |
| `products_per_page` | int (1–100) | `12` | Catalog page size (`/products`, category pages) |
| `show_category_nav` | bool | `true` | Show category navigation |

## Routes

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/frontends/default` | Config form |
| POST | `/admin/frontends/default/save` | Save config |

### Storefront (SPA)

| Path | Description |
|------|-------------|
| `/` | Home — featured products |
| `/products` | Catalog with search, sort, pagination |
| `/products/[slug]` | Product detail |
| `/categories/[slug]` | Products in a category |
| `/cart` | Shopping cart |
| `/checkout` | Checkout and payment redirect |
| `/login`, `/register`, `/account` | Authentication |
| `/forgot-password`, `/reset-password`, `/verify-email` | Password and email flows |
| `/orders`, `/orders/[id]` | Order history and detail (`?payment=return` after hosted checkout) |
| `/auth/sso/callback` | SSO token exchange |

Backend email deep-links are handled by the API before the SPA loads:

| Link | Backend behavior | SPA lands on |
|------|------------------|--------------|
| `/verify-email?token=` | Verifies token, then 302 | `/login?auth=verified` or `/login?auth=verify_failed` |
| `/reset-password?token=` (valid) | Serves SPA shell (token kept) | Same URL — form posts to API |
| `/reset-password?token=` (invalid) | 302 | `/forgot-password?auth=reset_failed` |

Login also shows banners for `?auth=password_reset` (after a successful reset) and `?error=sso_failed` (SSO failure).

## Core integration

On startup the SPA:

1. Loads theme CSS from `GET /api/v1/storefront/theme.css`
2. Fetches merged config from `GET /api/v1/storefront/config` (`site` + `frontend.config`)
3. Applies site branding (name, colors, fonts, logo)

See the [frontend bootstrap contract](../README.md#spa-bootstrap-contract-required) for details.

## API modules

Backend calls live in `source/src/lib/api/`:

| Module | Endpoints used |
|--------|----------------|
| `storefront.ts` | `/api/v1/storefront/config`, `theme.css` |
| `products.ts` | `/api/v1/products`, product by slug |
| `categories.ts` | `/api/v1/categories` |
| `auth.ts` | register, login, refresh, profile, password reset, verify email |
| `cart.ts` | cart CRUD |
| `orders.ts` | create order, list, detail, checkout |
| `sso.ts` | SSO authorize and exchange |

In development (`npm run dev`), requests target `http://127.0.0.1:8000`. In production they are same-origin.

## Configuration layers

| What | Admin UI | SPA usage |
|------|----------|-----------|
| Store name, logo, colors, fonts | `/admin/settings` | `config.site.*` |
| Layout, page size, category nav | `/admin/frontends/default` | `config.frontend.config.*` |

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | SvelteKit 2 |
| UI | Svelte 5 (runes) |
| Build | Vite 8 |
| Output | `@sveltejs/adapter-static` → `../dist/` |
| Rendering | Client-side only (`ssr = false`) |

Run `npm run check` from `source/` for type-checking.

## Creating a new frontend from this sample

1. Copy `default/` to `app/addons/frontends/my_theme/`
2. Rename `addon_id`, names, and config in `addon.py`, `routes.py`, and `oshkelosh-addon.json`
3. Update `source/svelte.config.js` adapter paths to `../dist`
4. Customize `source/src/` — keep the storefront bootstrap unless replacing it intentionally
5. Build (`npm run build`), commit `dist/`, restart server, enable in admin

Any framework works as long as you produce a `dist/` with `index.html` and follow the [bootstrap contract](../README.md#spa-bootstrap-contract-required).

## Package layout

```
default/
├── oshkelosh-addon.json   # required for ZIP / GitHub archive install
├── README.md
├── __init__.py
├── addon.py
├── routes.py
├── templates/
├── dist/                  # built SPA (committed for production install)
└── source/                # SvelteKit project
    ├── README.md          # dev commands
    └── src/
        ├── routes/
        └── lib/
```

## See also

- [Frontend addon development](../README.md)
- [Oshkelosh addon guide](../../README.md)
- Full API reference: `/docs` when `DEBUG=true`
