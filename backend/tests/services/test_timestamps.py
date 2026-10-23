from datetime import UTC, datetime, timedelta, timezone

import pytest
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Item
from tests.utils.user import create_random_user

pytestmark = pytest.mark.anyio


async def test_timestamps_round_trip_as_utc(db: AsyncSession) -> None:
    user = await create_random_user(db)
    timestamp = datetime(2026, 1, 2, 3, 4, tzinfo=timezone(timedelta(hours=5)))
    user.created_at = timestamp
    item = Item(title="UTC timestamp", owner_id=user.id, created_at=timestamp)
    db.add(user)
    db.add(item)
    await db.commit()

    # PostgreSQL returns a non-UTC offset; SQLModel must normalize both models.
    connection = await db.connection()
    await connection.execute(text("SET LOCAL TIME ZONE 'America/Denver'"))
    await db.refresh(user)
    await db.refresh(item)
    for record in (user, item):
        assert record.created_at == timestamp.astimezone(UTC)
        assert record.created_at.utcoffset() == timedelta(0)
    await db.rollback()


async def test_legacy_null_timestamps_remain_readable(db: AsyncSession) -> None:
    user = await create_random_user(db)
    item = Item(title="Legacy timestamp", owner_id=user.id)
    db.add(item)
    await db.commit()
    # The original migration left pre-existing records with null created_at.
    connection = await db.connection()
    await connection.execute(
        text('UPDATE "user" SET created_at = NULL WHERE id = :id'), {"id": user.id}
    )
    await connection.execute(
        text("UPDATE item SET created_at = NULL WHERE id = :id"), {"id": item.id}
    )
    await db.commit()
    await db.refresh(user)
    await db.refresh(item)
    assert user.created_at is None
    assert item.created_at is None
