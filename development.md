# Local development

Follow the [README](./README.md#local-setup) to install dependencies and create
`.env`. Run PostgreSQL locally, FastAPI on port 8000, and Vite on port 5173.
Production uses a [Docker container and Supabase](./deployment.md).

## Database

Set `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
and `POSTGRES_DB` in the root `.env` to match your local database.

From `backend/`, initialize the database and run the API:

```bash
uv run bash scripts/prestart.sh
uv run fastapi dev app/main.py
```

From the repository root, start Vite:

```bash
pnpm dev
```

Vite proxies `/api` to `http://localhost:8000`. Use the local database for
development; keep Supabase production credentials in your deployment environment.

## Local email

Password recovery tests need a local SMTP server with MailCatcher's HTTP API.
If you have Docker installed, run this optional standalone service:

```bash
docker run --rm --name app-mailcatcher \
  -p 127.0.0.1:1025:1025 -p 127.0.0.1:1080:1080 schickling/mailcatcher
```

Alternatively, run MailCatcher directly on your machine. The example `.env`
uses SMTP on port 1025 and `MAILCATCHER_HOST=http://localhost:1080`.
Open <http://localhost:1080> to inspect emails.

## Backend tests

Create a dedicated test database with your local PostgreSQL tools, for example:

```bash
createdb app_test
bash scripts/test.sh
```

The test script initializes `app_test` using your configured local connection
and generates `backend/htmlcov/index.html`. To select a different test database:

```bash
POSTGRES_TEST_DB=my_app_test bash scripts/test.sh
```

For individual tests, from `backend/`:

```bash
POSTGRES_DB=app_test uv run pytest tests/api/routes/test_users.py -x
```

## Browser tests

Start MailCatcher, initialize the test database, and run FastAPI against it:

```bash
cd backend
POSTGRES_DB=app_test uv run bash scripts/prestart.sh
POSTGRES_DB=app_test uv run fastapi dev app/main.py
```

Keep `ENVIRONMENT=local`: the browser fixtures use the private test API.
In another terminal, from the repository root:

```bash
pnpm --filter frontend exec playwright install chromium
pnpm test
```

Playwright reads the root `.env` for administrator and email settings and starts
Vite automatically. Environment variables override the file. `pnpm test:ui`
opens the interactive test runner. Tests create, modify, and delete records in
the database used by the running backend.

## Test the built SPA

Build the frontend, then restart FastAPI so it registers the frontend routes:

```bash
pnpm --filter frontend build
cd backend
POSTGRES_DB=app_test uv run fastapi run app/main.py
```

Open <http://localhost:8000>. To run browser tests against this combined app,
from the repository root:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8000 pnpm test
```

`FRONTEND_DIST_DIR` overrides the build directory. Local API development can
start without a frontend build; staging and production require one.

To check the production container build locally:

```bash
docker build -f backend/Dockerfile -t my-app .
```

## CI

Backend and browser jobs use temporary PostgreSQL service containers. The
browser job builds the SPA and runs it through FastAPI with MailCatcher for
email tests. The Docker job checks the production image on a custom `PORT`.
Services and data are discarded with each GitHub Actions runner.

## API client and formatting

User and item responses use public schemas; database-only fields such as password
hashes must never be returned. List endpoints accept `skip >= 0` and
`1 <= limit <= 100` (defaults: `0` and `100`). Update bodies leave omitted fields
unchanged. Only nullable fields (`full_name` and `description`) accept explicit
`null`; required values return a validation error instead.

Timestamps use SQLModel's UTC datetime handling. Write timezone-aware values
(for example, `datetime.now(UTC)`); reads normalize them to UTC. Existing
`created_at` columns already use PostgreSQL `TIMESTAMP WITH TIME ZONE`, so this
change needs no schema migration. Legacy null timestamps remain supported.

Regenerate the TypeScript client after changing the API schema:

```bash
bash scripts/generate-client.sh
```

Run `pnpm lint` for frontend checks and fixes. Run `uv run bash scripts/lint.sh`
from `backend/` for ty and Ruff. See [backend/README.md](./backend/README.md)
for Alembic migrations.
