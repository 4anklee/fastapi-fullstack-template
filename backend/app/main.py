import sentry_sdk
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


async def reject_api_fallback(request: Request) -> None:
    path = request.url.path
    if path == settings.API_V1_STR or path.startswith(f"{settings.API_V1_STR}/"):
        raise HTTPException(status_code=404, detail="Not Found")


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        generate_unique_id_function=custom_generate_unique_id,
    )

    if settings.all_cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.all_cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Local API development and schema generation do not require a frontend build.
    # Deployments fail at startup if the build is missing.
    if settings.FRONTEND_DIST_DIR.is_dir() or settings.ENVIRONMENT != "local":
        # Apply this guard only to frontend responses, after normal API routing.
        frontend = APIRouter(dependencies=[Depends(reject_api_fallback)])
        frontend.frontend(
            "/",
            directory=settings.FRONTEND_DIST_DIR,
            fallback="index.html",
            check_dir=True,
        )
        app.include_router(frontend)

    return app


app = create_app()
