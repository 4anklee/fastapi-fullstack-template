# FastAPI Full-Stack Template

A starting point for building web applications with a FastAPI backend, a React
frontend, and PostgreSQL. It includes authentication, user administration, and
an example items workflow that you can adapt to your own application.

## What's Included

- **Backend:** FastAPI, SQLModel, Pydantic, PostgreSQL, and Alembic migrations.
- **Frontend:** React, TypeScript, Vite, TanStack Router and Query, Tailwind CSS,
  and shadcn/ui.
- **Accounts:** JWT authentication, signup, password recovery, profile settings,
  and administrator tools for managing users.
- **API integration:** A generated TypeScript client based on the backend's
  OpenAPI schema.
- **Development tools:** Docker Compose, Adminer, MailCatcher, Pytest,
  Playwright, Ruff, Biome, and GitHub Actions workflows.
- **Deployment configuration:** Docker images and Traefik routing for HTTPS.

## Use This Template

Create a repository from this project using GitHub's **Use this template** action
if available, or copy the repository into your own project. Clone your new
repository and run the following commands from its root unless noted otherwise.

Some files still use **Handwriting Recognition** as example branding. See
[Make It Your Own](#make-it-your-own) for the places to update.

### Requirements

- Docker with Docker Compose.
- Python 3.14 or newer within the 3.x series, as required by
  [backend/pyproject.toml](./backend/pyproject.toml), and `uv` for local backend
  development.
- Node.js 24 and pnpm 11.1.3 for local frontend development. The pnpm version is
  pinned in the root [package.json](./package.json).

### Configure Your Environment

Create a `.env` file at the repository root with the following local settings.
The repository does not include a tracked `.env` or `.env.example` file.

```dotenv
PROJECT_NAME="My App"
STACK_NAME=my-app
DOMAIN=localhost
ENVIRONMENT=local
FRONTEND_HOST=http://localhost:5173
BACKEND_CORS_ORIGINS="http://localhost:5173,http://localhost"

SECRET_KEY=replace-with-a-generated-secret
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=replace-with-a-unique-password

POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace-with-a-unique-database-password

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_TLS=false
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=noreply@example.com
SENTRY_DSN=

DOCKER_IMAGE_BACKEND=my-app-backend
DOCKER_IMAGE_FRONTEND=my-app-frontend
TAG=latest
```

Replace the three secret/password placeholders before starting. Generate a
separate value for each with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

The root `.env` file is ignored by Git. Docker Compose overrides the database
and SMTP hostnames so containers can reach the local services.

### Start Local Development

Start PostgreSQL and MailCatcher, then initialize and run the backend:

```bash
docker compose up -d --wait db mailcatcher
cd backend
uv sync
uv run bash scripts/prestart.sh
uv run fastapi dev app/main.py
```

The prestart script applies database migrations and creates the first
administrator using `FIRST_SUPERUSER` and `FIRST_SUPERUSER_PASSWORD`.

In another terminal, from the repository root, start the frontend:

```bash
pnpm install
VITE_API_URL=http://localhost:8000 pnpm dev
```

To persist the frontend API URL, create `frontend/.env` containing
`VITE_API_URL=http://localhost:8000` and use `pnpm dev` directly.

| Service | Local URL |
| --- | --- |
| Frontend | <http://localhost:5173> |
| Backend API docs | <http://localhost:8000/docs> |
| Backend OpenAPI schema | <http://localhost:8000/api/v1/openapi.json> |
| MailCatcher | <http://localhost:1080> |

Sign in with the administrator credentials you configured in `.env`.

### Run the Application in Docker

As an alternative to running the application processes locally:

```bash
docker compose watch
```

Stop any local backend and frontend servers first to free ports 8000 and 5173.
The Compose stack also exposes Adminer at <http://localhost:8080> and the
Traefik dashboard at <http://localhost:8090>. Backend changes are synchronized
into the container; use the local Vite server for frontend hot reload.

See [development.md](./development.md) for logs, service management, and local
proxy configuration.

## Make It Your Own

1. Set your project name, stack name, image names, and administrator credentials
   in `.env`.
2. Update the package name in the root `package.json`, the title in
   `frontend/index.html`, and the branding in `frontend/src/components/common/`
   and `frontend/src/routes/`. Replace example names and domains in the docs.
3. Adapt the example items feature to your domain. Backend models live in
   `backend/app/models/`, business logic in `backend/app/services/`, and routes
   in `backend/app/api/routes/`. Frontend pages live in `frontend/src/routes/`.
4. Create and apply Alembic migrations when changing database models, then
   regenerate the API client when changing the API schema.
5. Review `.github/workflows/` and configure your own CI environment, secrets,
   and deployment settings.

### Regenerate the API Client

With the backend running on port 8000 and frontend dependencies installed:

```bash
pnpm --filter frontend gen:client
```

Commit the generated changes in `frontend/src/client/` with your API changes.

## Checks and Tests

Run backend tests against your local development database from `backend/`:

```bash
uv run bash scripts/tests-start.sh
```

With the backend and MailCatcher running, run frontend tests from the repository
root. Playwright starts the frontend development server automatically:

```bash
pnpm --filter frontend exec playwright install chromium
VITE_API_URL=http://localhost:8000 pnpm test
```

Tests create and modify database records; use a development or test database.

Build the frontend with `pnpm --filter frontend build`. Run `pnpm lint` to check
and automatically fix frontend formatting and lint issues.

## Deployment and Further Documentation

Before deploying, configure your domain, production secrets, SMTP provider,
frontend URL, and allowed CORS origins. Set `ENVIRONMENT=production` and follow
the [deployment guide](./deployment.md) for Docker Compose and Traefik setup.

- [Backend development and migrations](./backend/README.md)
- [Frontend development](./frontend/README.md)
- [General development](./development.md)
- [Deployment](./deployment.md)

## License

This project is distributed under the [MIT License](./LICENSE).
