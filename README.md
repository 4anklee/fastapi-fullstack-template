# FastAPI Full-Stack Template

A FastAPI backend, React SPA, and PostgreSQL database with authentication,
user administration, password recovery, and an example items workflow.

## Architecture

- **Production:** one Docker container runs FastAPI and serves the built React
  frontend on any Docker-capable host. Supabase hosts PostgreSQL; your hosting
  platform or reverse proxy handles the public domain and HTTPS.
- **Development:** run FastAPI and Vite locally against your local PostgreSQL
  database. Vite proxies `/api` to FastAPI on port 8000.
- **Backend:** SQLModel, Pydantic, Alembic, Pytest, ty, and Ruff.
- **Frontend:** TypeScript, TanStack Router and Query, Tailwind CSS, shadcn/ui,
  Playwright, and Biome.
- **CI:** backend tests, browser tests, and a combined Docker image smoke test.
  Dependabot checks backend and frontend dependencies daily.

## Local setup

Install Python 3.14, [uv](https://docs.astral.sh/uv/), Node.js 24, and PostgreSQL.
Enable Corepack for the pnpm version pinned in `package.json`:

```bash
corepack enable
cp .env.example .env
```

Start your local PostgreSQL server and create an `app` database, for example
with `createdb app`. Edit `POSTGRES_*` in `.env` to match its host, database,
username, and password. On Homebrew installations, the initial PostgreSQL
username is usually your macOS username.

Initialize and run the backend:

```bash
cd backend
uv sync
uv run bash scripts/prestart.sh
uv run fastapi dev app/main.py
```

The prestart script applies migrations and creates the first administrator from
`FIRST_SUPERUSER` and `FIRST_SUPERUSER_PASSWORD` in `.env`.

In another terminal, from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:5173> and sign in with your configured administrator.
API documentation is at <http://localhost:8000/docs>.

## Checks and tests

Create a separate local test database with `createdb app_test`, then run:

```bash
bash scripts/test.sh
cd backend
uv run bash scripts/lint.sh
```

The root test script selects `app_test` (or `POSTGRES_TEST_DB`), applies migrations,
and runs backend tests with coverage. It uses your configured PostgreSQL connection.

See [development.md](./development.md) for Playwright, local email capture, and
running the built SPA. Run `pnpm lint` to check and fix frontend lint and formatting.

## Deploy with Docker

Follow [deployment.md](./deployment.md) to build the image, set Supabase
credentials, run migrations, and configure your public URL and health check.
Build from the repository root using `backend/Dockerfile`; the image includes
the frontend automatically.

## Make it your own

1. Set the project name and administrator credentials in your environment.
2. Update the package name in `package.json`, the title in `frontend/index.html`,
   and branding in `frontend/src/components/common/` and `frontend/src/routes/`.
   Some files still use **Handwriting Recognition** as example branding.
3. Adapt backend models in `backend/app/models/`, services in
   `backend/app/services/`, and endpoints in `backend/app/api/routes/`.
4. Create Alembic migrations for database changes and regenerate the TypeScript
   client after API changes with `bash scripts/generate-client.sh`.

- [Backend development and migrations](./backend/README.md)
- [Frontend development](./frontend/README.md)
- [Local development and testing](./development.md)
- [Docker deployment](./deployment.md)

## License

[MIT](./LICENSE).
