# Handwriting Recognition

Handwriting Recognition is a full-stack application scaffold for building a
handwriting recognition product.

## Stack

- FastAPI backend with SQLModel, Pydantic, PostgreSQL, Alembic, and Pytest
- React frontend with TypeScript, Vite, Tailwind CSS, shadcn/ui, and Playwright
- Docker Compose for local development and deployment
- Generated TypeScript API client from the backend OpenAPI schema

## Local Development

Start the full local stack:

```bash
docker compose watch
```

Useful local URLs:

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:8000>
- API docs: <http://localhost:8000/docs>
- Adminer: <http://localhost:8080>
- MailCatcher: <http://localhost:1080>

Backend-only development:

```bash
cd backend
uv run fastapi dev app/main.py
```

Frontend-only development:

```bash
cd frontend
pnpm dev
```

## Configuration

Local configuration lives in `.env`. Before deploying, replace default values
for:

- `SECRET_KEY`
- `FIRST_SUPERUSER_PASSWORD`
- `POSTGRES_PASSWORD`

You can generate a secure value with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Development Docs

- Backend docs: [backend/README.md](./backend/README.md)
- Frontend docs: [frontend/README.md](./frontend/README.md)
- General development: [development.md](./development.md)
- Deployment: [deployment.md](./deployment.md)
