from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import create_app


@pytest.fixture
def db() -> None:
    """Serving frontend files does not require a database connection."""


@pytest.fixture
def frontend_client(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> Generator[TestClient, None, None]:
    (tmp_path / "index.html").write_text("<html><body>Test SPA</body></html>")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "app.js").write_text("console.log('test app');")
    monkeypatch.setattr(settings, "FRONTEND_DIST_DIR", tmp_path)
    with TestClient(create_app()) as client:
        yield client


@pytest.mark.parametrize("path", ["/", "/login", "/settings", "/items/example"])
def test_frontend_navigation(frontend_client: TestClient, path: str) -> None:
    response = frontend_client.get(path, headers={"Accept": "text/html"})
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Test SPA" in response.text


def test_frontend_assets(frontend_client: TestClient) -> None:
    response = frontend_client.get("/assets/app.js")
    assert response.status_code == 200
    assert response.text == "console.log('test app');"
    assert frontend_client.get("/assets/missing.js").status_code == 404


def test_frontend_fallback_only_for_navigation(frontend_client: TestClient) -> None:
    assert frontend_client.get("/settings").status_code == 404
    assert frontend_client.post("/settings").status_code == 404
    response = frontend_client.head("/settings", headers={"Accept": "text/html"})
    assert response.status_code == 200
    assert response.content == b""


def test_api_and_docs_take_priority(frontend_client: TestClient) -> None:
    response = frontend_client.get(f"{settings.API_V1_STR}/utils/health-check/")
    assert response.status_code == 200
    assert response.json() is True
    assert frontend_client.get("/docs").status_code == 200
    schema = frontend_client.get(f"{settings.API_V1_STR}/openapi.json").json()
    assert f"{settings.API_V1_STR}/users/" in schema["paths"]
    assert "/{path:path}" not in schema["paths"]
    assert frontend_client.get(f"{settings.API_V1_STR}/users/me").status_code == 401
    response = frontend_client.get(
        f"{settings.API_V1_STR}/utils/health-check", follow_redirects=False
    )
    assert response.status_code == 307
    assert response.headers["location"].endswith("/utils/health-check/")


def test_unknown_api_does_not_serve_frontend(frontend_client: TestClient) -> None:
    response = frontend_client.get(
        f"{settings.API_V1_STR}/missing", headers={"Accept": "text/html"}
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_local_backend_without_frontend_build(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "FRONTEND_DIST_DIR", tmp_path / "missing")
    monkeypatch.setattr(settings, "ENVIRONMENT", "local")
    with TestClient(create_app()) as client:
        assert client.get("/").status_code == 404
        assert client.get(f"{settings.API_V1_STR}/utils/health-check/").json() is True


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_deployment_requires_frontend_build(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, environment: str
) -> None:
    monkeypatch.setattr(settings, "FRONTEND_DIST_DIR", tmp_path / "missing")
    monkeypatch.setattr(settings, "ENVIRONMENT", environment)
    with pytest.raises(RuntimeError, match="does not exist"):
        create_app()
