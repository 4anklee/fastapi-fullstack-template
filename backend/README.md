# Backend

FastAPI, SQLModel, PostgreSQL, and Alembic. Dependencies are managed in the root
uv workspace; its virtual environment is `.venv/` at the repository root.

## Development

Set up local PostgreSQL and the root `.env` as described in the
[README](../README.md#local-setup). From `backend/`:

```bash
uv sync
uv run bash scripts/prestart.sh
uv run fastapi dev app/main.py
```

Configure your editor to use the root `.venv/bin/python`. Models live in
`app/models/`, business logic in `app/services/`, and routes in `app/api/routes/`.

## Tests and lint

From the repository root, with a separate local `app_test` database available:

```bash
bash scripts/test.sh
```

For focused checks from `backend/` after initializing the test database:

```bash
POSTGRES_DB=app_test uv run pytest tests/ -x
uv run bash scripts/lint.sh
```

The root test script generates a coverage report in `backend/htmlcov/`.
See [development.md](../development.md) for browser tests and email capture.

## Migrations

After changing a model, create and review an Alembic revision from `backend/`:

```bash
uv run alembic revision --autogenerate -m "Describe the model change"
uv run alembic upgrade head
```

Commit the revision in `app/alembic/versions/` with the model changes.
Configure your deployment to run `bash scripts/prestart.sh` before starting
the application to apply migrations and initialize the administrator. See [deployment.md](../deployment.md).

## Email templates

MJML source templates are in `app/email-templates/src/`; the application sends
HTML from `app/email-templates/build/`. After editing an MJML template, export
its HTML to the build directory using an MJML tool or the VS Code MJML extension.
Commit both files.
