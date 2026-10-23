# Docker deployment with Supabase

The image runs FastAPI and serves the React SPA. Deploy it on any platform that
can run Docker containers, with Supabase providing PostgreSQL. Configure your
public domain and HTTPS through your hosting platform or a reverse proxy.

## Build and run

Build from the repository root so both workspaces and their lockfiles are available:

```bash
docker build -f backend/Dockerfile -t my-app .
```

The Dockerfile builds the frontend with relative API URLs and packages it with
FastAPI. The server listens on `0.0.0.0`, using `PORT` when set or port 8000 by
default. Use the image's default command to start the application.

Supply the environment variables below through your hosting platform's settings
or a private environment file. For example, with a `production.env` file kept
outside the repository:

```bash
docker run --rm --env-file /path/to/production.env my-app bash scripts/prestart.sh
docker run -d --name my-app --restart unless-stopped \
  --env-file /path/to/production.env -p 8000:8000 my-app
```

Run the second command only after migrations succeed. If you set a different
`PORT`, update the container port mapping to match. Configure HTTPS separately
and set `FRONTEND_HOST` to the application's public HTTPS URL.

## Environment variables

Set these in the container's runtime environment. Local `.env` files are
excluded from the Docker build.

| Variable | Value |
| --- | --- |
| `PROJECT_NAME` | Your application name |
| `ENVIRONMENT` | `production` |
| `SECRET_KEY` | A generated secret, kept stable across deployments |
| `FIRST_SUPERUSER` | Initial administrator email |
| `FIRST_SUPERUSER_PASSWORD` | Initial administrator password |
| `FRONTEND_HOST` | `https://app.your-domain.com` |
| `FORWARDED_ALLOW_IPS` | Trusted reverse proxy IPs; use `*` only when all incoming traffic comes through a trusted proxy |
| `POSTGRES_SERVER` | Host copied from Supabase's session pooler connection |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_USER` | Session pooler username, typically `postgres.<project-ref>` |
| `POSTGRES_PASSWORD` | Supabase database password |
| `POSTGRES_DB` | `postgres` |
| `PGSSLMODE` | `require` |

Generate the secret and an administrator password separately:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

In Supabase, open **Connect → Session pooler** and copy the exact host and
username. Session mode supports IPv4 and the driver's prepared statements.
A direct connection also works if your deployment has connectivity to that
endpoint; use its host and username together. See the
[Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres).

`PGSSLMODE=require` is read by psycopg/libpq from the container's process environment
for both the application and Alembic. Use session mode on port 5432 with the
current driver configuration.

The application uses Supabase as PostgreSQL and retains FastAPI authentication.
Its tables are managed by Alembic. If Supabase's Data API is enabled, ensure these
tables cannot be accessed through it outside the application's authorization;
for a database-only project, disable the Data API in Supabase settings.

The frontend and API share the same origin, so `VITE_API_URL` and additional
`BACKEND_CORS_ORIGINS` are unnecessary. Password reset links use `FRONTEND_HOST`.

## Email

Configure an SMTP provider for account emails and password recovery:

```dotenv
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_SSL=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
EMAILS_FROM_EMAIL=noreply@your-domain.com
```

Use the port and TLS/SSL settings required by your provider. `SENTRY_DSN` is optional.

## Migrations and health checks

Configure your platform's release or pre-deploy command to run
`bash scripts/prestart.sh` using the same image and database environment as the
application. Alternatively, run the one-off container shown above before starting
the app. The image's default startup command does not run migrations.

The script waits for PostgreSQL, applies Alembic migrations, and creates the
initial administrator if missing. Require this command to succeed before
releasing the new application. Existing administrator passwords are not changed
by subsequent deployments.

Configure an HTTP health check at `/api/v1/utils/health-check/` on the application's
port. This verifies the HTTP application is running; it is not a database
availability check. A missing frontend build fails production startup.

To inspect the deployment, open `/login` and `/docs` on its public domain.
The private test API is disabled when `ENVIRONMENT=production`.

## Optional: Railway

Keep the service root at the repository root and select `backend/Dockerfile` in
the service settings. Set the pre-deploy command to `bash scripts/prestart.sh`
and the health check path to `/api/v1/utils/health-check/`. Add the runtime
variables above and configure a public domain. The server reads Railway's `PORT`;
leave the start-command override empty to use the image's default command.

See Railway's [pre-deploy command documentation](https://docs.railway.com/deployments/pre-deploy-command)
for configuring the migration step.
