import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.models import UserCreate, UserPublic
from app.services.user import create_user_record
from tests.utils.item import create_random_item
from tests.utils.utils import random_email

pytestmark = pytest.mark.anyio


async def test_user_responses_never_include_passwords(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    prefix = settings.API_V1_STR
    headers = superuser_token_headers
    with patch("app.services.user.send_email", new_callable=AsyncMock):
        responses = [
            client.post(
                f"{prefix}{path}",
                headers=headers,
                json={
                    "email": random_email(),
                    "password": "test-password",
                    "full_name": "Test User",
                },
            )
            for path in ("/users/", "/users/signup", "/private/users/")
        ]
    user_id = responses[0].json()["id"]
    responses.extend(
        [
            client.get(f"{prefix}/users/me", headers=headers),
            client.get(f"{prefix}/users/{user_id}", headers=headers),
            client.patch(f"{prefix}/users/me", headers=headers, json={}),
            client.patch(f"{prefix}/users/{user_id}", headers=headers, json={}),
            client.post(f"{prefix}/login/test-token", headers=headers),
        ]
    )
    for response in responses:
        assert response.status_code == 200, response.text
        assert set(response.json()) == set(UserPublic.model_fields)
        assert "hashed_password" not in response.json()
        assert "password" not in response.json()
    schema = client.get(f"{prefix}/openapi.json").json()
    assert "hashed_password" not in str(schema)


@pytest.mark.parametrize("resource", ["items", "users"])
@pytest.mark.parametrize("query", ["skip=-1", "limit=0", "limit=-1", "limit=101"])
async def test_pagination_rejects_invalid_bounds(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    resource: str,
    query: str,
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/{resource}/?{query}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", query.split("=")[0]]


@pytest.mark.parametrize("resource", ["items", "users"])
async def test_pagination_limits_and_offsets_results(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: AsyncSession,
    resource: str,
) -> None:
    await create_random_item(db)
    await create_random_item(db)
    pages = [
        client.get(
            f"{settings.API_V1_STR}/{resource}/?skip={skip}&limit=1",
            headers=superuser_token_headers,
        )
        for skip in (0, 1)
    ]
    for response in pages:
        assert response.status_code == 200
        assert len(response.json()["data"]) == 1
        assert response.json()["count"] >= 2
    assert pages[0].json()["data"][0]["id"] != pages[1].json()["data"][0]["id"]


@pytest.mark.parametrize(
    ("method", "path", "field"),
    [
        ("PUT", "items/{id}", "title"),
        ("PATCH", "users/me", "email"),
        ("PATCH", "users/{id}", "email"),
        ("PATCH", "users/{id}", "password"),
        ("PATCH", "users/{id}", "is_active"),
        ("PATCH", "users/{id}", "is_superuser"),
    ],
)
async def test_updates_reject_null_for_required_values(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    method: str,
    path: str,
    field: str,
) -> None:
    response = client.request(
        method,
        f"{settings.API_V1_STR}/{path.format(id=uuid.uuid4())}",
        headers=superuser_token_headers,
        json={field: None},
    )
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", field]


async def test_partial_updates_preserve_omitted_fields_and_allow_clearing(
    client: TestClient, superuser_token_headers: dict[str, str], db: AsyncSession
) -> None:
    user = await create_user_record(
        session=db,
        user_create=UserCreate(
            email=random_email(),
            password="test-password",
            full_name="Original name",
            is_active=False,
            is_superuser=True,
        ),
    )
    original_hash = user.hashed_password
    response = client.patch(
        f"{settings.API_V1_STR}/users/{user.id}",
        headers=superuser_token_headers,
        json={"full_name": None},
    )
    assert response.status_code == 200
    assert response.json()["full_name"] is None
    await db.refresh(user)
    assert user.email
    assert user.is_active is False
    assert user.is_superuser is True
    assert user.hashed_password == original_hash

    item = await create_random_item(db)
    response = client.put(
        f"{settings.API_V1_STR}/items/{item.id}",
        headers=superuser_token_headers,
        json={"description": None},
    )
    assert response.status_code == 200
    assert response.json()["title"] == item.title
    assert response.json()["description"] is None
