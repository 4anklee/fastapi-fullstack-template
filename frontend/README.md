# Frontend

React, Vite, TypeScript, TanStack Query and Router, Tailwind CSS, HeroUI v3, and Gravity UI icons.
Use Node.js 24 and the pnpm version pinned in the root `package.json`.

## Development

Start the backend and local database following the [README](../README.md).
From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:5173>. Vite proxies `/api` to `http://localhost:8000`.
For a remote API, set `VITE_API_URL` in `frontend/.env` and configure the API's
allowed CORS origins accordingly.

## Production build

`backend/Dockerfile` builds the frontend and copies `dist` into the FastAPI
image. FastAPI serves `/` with SPA navigation fallback alongside `/api/v1`.
Any Docker-capable host can run this combined image; the API client uses relative URLs.

To serve a local build, run `pnpm --filter frontend build` from the repository
root and restart FastAPI. Open <http://localhost:8000>.
`FRONTEND_DIST_DIR` can override the build directory.

## Generate the API client

After backend schema changes, run from the repository root:

```bash
bash scripts/generate-client.sh
```

Or, with the API running on port 8000:

```bash
pnpm --filter frontend gen:client
```

Commit generated changes in `src/client/` with the corresponding API changes.

The build uses TypeScript 7 (`@typescript/native`). TypeScript 6 remains installed
as `typescript` (the official `@typescript/typescript6` compatibility package) because the API generator requires the classic compiler API.

## Code structure

- `src/assets/`: static assets.
- `src/client/`: generated API client.
- `src/components/`: app components built with `@heroui/react`; icons come from
  `@gravity-ui/icons`. Pages use HeroUI directly; `common/` contains app-specific
  helpers such as the responsive shell, loading buttons, and password inputs.
- `src/index.css`: HeroUI styles and the app’s light/dark teal accent theme.
- `src/hooks/`: custom hooks.
- `src/routes/`: pages and route definitions.

## Browser tests

Start FastAPI in `ENVIRONMENT=local` against a dedicated test database and run
MailCatcher as described in [development.md](../development.md#browser-tests).
From the repository root:

```bash
pnpm --filter frontend exec playwright install chromium
pnpm test
```

Playwright loads the root `.env` and starts Vite. To test the built SPA served
by FastAPI instead:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8000 pnpm test
```

Use `pnpm test:ui` for interactive testing. Run `pnpm lint` for frontend lint
and formatting checks and fixes.
