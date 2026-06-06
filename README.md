# Default Storefront — sample frontend

A minimal, working storefront for [Oshkelosh](https://github.com/oshkelosh/oshkelosh). Use it as a **starting point** when building your own frontend addon: copy the folder, rename the addon, swap in your UI, and keep the same integration patterns with the backend.

The sample is a **SvelteKit 2 + Svelte 5** client-side SPA. Source lives in `source/`; the production build goes to `dist/`, which FastAPI serves at `/`.

## What this sample demonstrates

- Loading merged storefront config from `GET /api/v1/storefront/config` (site branding + frontend options)
- Applying theme CSS from `GET /api/v1/storefront/theme.css`
- Product catalog, search, pagination, and product detail pages
- Category tree and category product listings
- Admin-configurable layout options (grid/list, page size, category nav)
- The full frontend-addon package layout (`addon.py`, admin routes, templates, `dist/`)

**Not included yet:** authentication, cart, checkout, or orders. The backend APIs exist — this sample focuses on catalog browsing and the addon integration pattern.

## Package layout

```
default/
├── README.md           ← you are here
├── AGENT.md            ← detailed reference for AI-assisted development
├── addon.py            ← registers the addon, points at dist/
├── routes.py           ← admin config UI
├── templates/          ← Jinja form for admin settings
├── dist/               ← built SPA (generated — do not edit by hand)
└── source/             ← SvelteKit project (edit here)
    ├── README.md       ← day-to-day dev commands
    └── src/
        ├── routes/     ← pages
        └── lib/        ← API client, components, types
```

When Oshkelosh runs, only **one** frontend addon is active. The enabled addon’s `dist/` folder is served at `/`; API routes stay at `/api/v1/*` on the same host.

## Creating a new frontend from this sample

1. **Copy the folder**
   ```bash
   cp -r app/addons/frontends/default app/addons/frontends/my_theme
   ```

2. **Rename the addon** in `my_theme/addon.py`:
   - Change `addon_id`, `addon_name`, `addon_description`, `version`
   - Rename `DefaultFrontendConfig` / `DefaultFrontendAddon` (or keep names — IDs matter more than class names)
   - Update imports in `routes.py` and admin template paths

3. **Update the Svelte build output** in `my_theme/source/svelte.config.js` so `pages` and `assets` point at `../dist` inside your new folder.

4. **Customize the SPA** in `my_theme/source/` — routes, components, styles. Keep the storefront bootstrap (config + theme CSS) unless you intentionally replace it.

5. **Build and enable**
   ```bash
   cd app/addons/frontends/my_theme/source
   npm install
   npm run build
   ```
   Restart the Oshkelosh server (new addon packages are discovered at startup), then enable **My Theme** under **Admin → Addons**. Configure options at `/admin/frontends/my_theme`.

You can also replace Svelte entirely with React, Vue, or plain HTML/JS — as long as you produce a `dist/` with `index.html` and implement the [storefront bootstrap contract](../README.md#spa-bootstrap-contract-required). See the parent [frontends README](../README.md) for framework-agnostic addon details.

## Quick start (working on this sample)

### Prerequisites

- Oshkelosh backend running at `http://127.0.0.1:8000` (from repo root: `./scripts/run_dev.sh`)
- Node.js 18+

### Development (hot reload)

```bash
cd source
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server calls the API at `http://127.0.0.1:8000` directly.

Add these to your backend `.env` if API requests fail from the dev server:

```
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000
```

Enable the addon at `/admin/frontends/default` if you also want to test the integrated build on port 8000.

### Production build

```bash
cd source
npm run build
```

Output is written to `../dist/` with SPA fallback (`index.html`). Reload the browser at `http://localhost:8000/` — the server reads files from disk on each request.

## Configuration

Storefront settings come from two places. **Do not** put site branding (store name, logo, colors) in your frontend addon config — read it from the API.

| What | Where to set it | Used in the SPA as |
|------|-----------------|-------------------|
| Store name, logo, colors, fonts | Admin → Settings (`/admin/settings`) | `data.config.site` |
| Layout, page size, category nav | Admin → Default Storefront (`/admin/frontends/default`) | `data.config.frontend.config` |

This sample’s frontend-specific options are defined in `addon.py` (`DefaultFrontendConfig`):

- `layout` — `"grid"` or `"list"`
- `products_per_page` — 1–100 (default 12)
- `show_category_nav` — show/hide category navigation

See [`source/src/routes/+layout.svelte`](source/src/routes/+layout.svelte) and [`source/src/lib/api/storefront.ts`](source/src/lib/api/storefront.ts) for how config is loaded and applied.

## Routes included

| Path | Description |
|------|-------------|
| `/` | Home — featured products |
| `/products` | Catalog with search, sort, and pagination |
| `/products/[id]` | Product detail |
| `/categories` | Category tree |
| `/categories/[slug]` | Products in a category |

## API usage

All backend calls go through `source/src/lib/api/`. In development, requests target `http://127.0.0.1:8000`; in production they are same-origin (`/api/v1/...`).

Common endpoints this sample uses:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/storefront/config` | Merged site + frontend config |
| `GET /api/v1/storefront/theme.css` | Theme CSS variables |
| `GET /api/v1/products` | Product list |
| `GET /api/v1/products/{id}` | Product detail |
| `GET /api/v1/categories` | Category tree |
| `GET /api/v1/media/{key}` | Product images |

Full API reference: `http://localhost:8000/docs` (with `DEBUG=true`) or `curl -s http://localhost:8000/openapi.json`.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | SvelteKit 2 |
| UI | Svelte 5 (runes) |
| Build | Vite 8 |
| Output | `@sveltejs/adapter-static` → `../dist/` |
| Rendering | Client-side only (`ssr = false`) |

Type-check with `npm run check` from `source/`.

## Customization checklist

When forking this sample, you will typically change:

- [ ] `addon_id`, names, and descriptions in `addon.py`
- [ ] Admin routes, template, and config schema in `routes.py` / `templates/`
- [ ] Routes, components, and styles in `source/src/`
- [ ] `svelte.config.js` adapter paths (if folder name changed)
- [ ] Types in `source/src/lib/types/` to match your API usage

Keep unless you know you need to replace:

- Storefront config bootstrap in `+layout.ts` / `+layout.svelte`
- `source/src/lib/api/config.ts` base-URL logic (dev vs prod)
- `source/src/lib/api/client.ts` fetch wrapper

## Further reading

- [`source/README.md`](source/README.md) — npm scripts and local dev notes
- [`../README.md`](../README.md) — frontend addon system (bootstrap contract, CSS variables, `FrontendAddon` API)
- [`AGENT.md`](AGENT.md) — in-depth architecture and conventions (useful for tooling and AI-assisted work)
- [`../../../addons/README.md`](../../../addons/README.md) — general Oshkelosh addon system
