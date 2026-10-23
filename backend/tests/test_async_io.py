from threading import get_ident
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest

from app import utils
from app.core import security
from app.core.config import settings
from app.main import create_app, lifespan

pytestmark = pytest.mark.anyio


@pytest.fixture
def db() -> None:
    """These tests exercise I/O boundaries without a database."""


@pytest.mark.parametrize("fail", [False, True])
async def test_lifespan_disposes_pool_even_on_failure(fail: bool) -> None:
    with patch(
        "sqlalchemy.ext.asyncio.AsyncEngine.dispose", new_callable=AsyncMock
    ) as dispose:
        try:
            async with lifespan(create_app()):
                dispose.assert_not_awaited()
                if fail:
                    raise RuntimeError("Shutdown after failure")
        except RuntimeError:
            assert fail
        dispose.assert_awaited_once()


async def test_password_work_runs_outside_event_loop() -> None:
    loop_thread = get_ident()

    def hash_password(password: str) -> str:
        assert get_ident() != loop_thread
        assert password == "password-for-test"
        return "hashed-password"

    def verify_password(password: str, hashed: str) -> tuple[bool, str | None]:
        assert get_ident() != loop_thread
        assert (password, hashed) == ("password-for-test", "hashed-password")
        return True, "upgraded-hash"

    with (
        patch.object(security.password_hash, "hash", side_effect=hash_password),
        patch.object(
            security.password_hash, "verify_and_update", side_effect=verify_password
        ),
    ):
        hashed = await security.get_password_hash("password-for-test")
        assert hashed == "hashed-password"
        assert await security.verify_password("password-for-test", hashed) == (
            True,
            "upgraded-hash",
        )


async def test_template_rendering_runs_outside_event_loop() -> None:
    loop_thread = get_ident()
    original_render = utils.render_email_template

    def render(*, template_name: str, context: dict[str, Any]) -> str:
        assert get_ident() != loop_thread
        return original_render(template_name=template_name, context=context)

    with patch("app.utils.render_email_template", side_effect=render):
        email = await utils.generate_test_email("recipient@example.com")
    assert "recipient@example.com" in email.html_content
    assert settings.PROJECT_NAME in email.subject


@pytest.mark.parametrize(
    ("start_tls", "use_tls", "port"),
    [(False, False, 1025), (True, False, 587), (False, True, 465)],
)
async def test_async_email_transport(
    monkeypatch: pytest.MonkeyPatch, start_tls: bool, use_tls: bool, port: int
) -> None:
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(settings, "SMTP_PORT", port)
    monkeypatch.setattr(settings, "SMTP_TLS", start_tls)
    monkeypatch.setattr(settings, "SMTP_SSL", use_tls)
    monkeypatch.setattr(settings, "SMTP_USER", "smtp-user")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "smtp-password")
    monkeypatch.setattr(settings, "EMAILS_FROM_NAME", "Test App")
    monkeypatch.setattr(settings, "EMAILS_FROM_EMAIL", "sender@example.com")

    with patch("app.utils.aiosmtplib.send", new_callable=AsyncMock) as send:
        await utils.send_email(
            email_to="recipient@example.com",
            subject="Test message",
            html_content="<p>Hello</p>",
        )
    send.assert_awaited_once()
    message = send.call_args.args[0]
    assert message["To"] == "recipient@example.com"
    assert message["From"] == "Test App <sender@example.com>"
    assert message["Subject"] == "Test message"
    assert message.get_content_type() == "text/html"
    assert message.get_content().strip() == "<p>Hello</p>"
    assert send.call_args.kwargs == {
        "hostname": "smtp.example.com",
        "port": port,
        "username": "smtp-user",
        "password": "smtp-password",
        "use_tls": use_tls,
        "start_tls": start_tls,
        "timeout": 30,
    }
