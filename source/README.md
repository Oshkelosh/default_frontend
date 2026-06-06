# Oshkelosh Basic Storefront

SvelteKit source for the default Oshkelosh storefront. See [../README.md](../README.md) for the full sample-frontend guide.

For AI-assisted development, see [../AGENT.md](../AGENT.md).

## Development

Requires the Oshkelosh backend running at `http://127.0.0.1:8000`.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API requests go directly to `http://127.0.0.1:8000` (configured via `.env.development`).

Ensure the backend `CORS_ORIGINS` includes `http://localhost:5173` and `http://127.0.0.1:5173`.

## Build

```bash
npm run build
```

Static output is written to `../dist/` with SPA fallback (`index.html`). Reload the browser at `http://localhost:8000/` after building.

## Storefront contract

On startup the app:

1. Loads theme CSS from `/api/v1/storefront/theme.css`
2. Fetches merged config from `/api/v1/storefront/config`
3. Applies site branding (name, colors, fonts, logo)

If no frontend addon is enabled on the backend (503), the app falls back to default branding.

## Deployment

1. Run `npm run build` (outputs to `../dist/`)
2. Reload `http://localhost:8000/` (or restart the server if needed)
3. Enable the **Default Storefront** addon at `/admin/frontends/default` if not already active

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — featured products |
| `/products` | Product catalog with search and pagination |
| `/products/[id]` | Product detail |
| `/categories` | Category tree |
| `/categories/[slug]` | Products in a category |
