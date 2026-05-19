import uuid

from fastapi import HTTPException
from sqlmodel import col, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import (
    Item,
    ItemCreate,
    ItemPublic,
    ItemsPublic,
    ItemUpdate,
    Message,
    User,
)


async def create_item_record(
    *, session: AsyncSession, item_in: ItemCreate, owner_id: uuid.UUID
) -> Item:
    item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


async def list_items(
    *, session: AsyncSession, current_user: User, skip: int = 0, limit: int = 100
) -> ItemsPublic:
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Item)
        item_statement = (
            select(Item).order_by(col(Item.created_at).desc()).offset(skip).limit(limit)
        )
    else:
        count_statement = (
            select(func.count())
            .select_from(Item)
            .where(Item.owner_id == current_user.id)
        )
        item_statement = (
            select(Item)
            .where(Item.owner_id == current_user.id)
            .order_by(col(Item.created_at).desc())
            .offset(skip)
            .limit(limit)
        )

    count = (await session.exec(count_statement)).one()
    items = (await session.exec(item_statement)).all()
    items_public = [ItemPublic.model_validate(item) for item in items]
    return ItemsPublic(data=items_public, count=count)


async def get_item(
    *, session: AsyncSession, current_user: User, item_id: uuid.UUID
) -> Item:
    item = await session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    ensure_item_access(item=item, current_user=current_user)
    return item


async def create_item(
    *, session: AsyncSession, current_user: User, item_in: ItemCreate
) -> Item:
    return await create_item_record(
        session=session, item_in=item_in, owner_id=current_user.id
    )


async def update_item(
    *,
    session: AsyncSession,
    current_user: User,
    item_id: uuid.UUID,
    item_in: ItemUpdate,
) -> Item:
    item = await get_item(session=session, current_user=current_user, item_id=item_id)
    update_dict = item_in.model_dump(exclude_unset=True)
    item.sqlmodel_update(update_dict)
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


async def delete_item(
    *, session: AsyncSession, current_user: User, item_id: uuid.UUID
) -> Message:
    item = await get_item(session=session, current_user=current_user, item_id=item_id)
    await session.delete(item)
    await session.commit()
    return Message(message="Item deleted successfully")


def ensure_item_access(*, item: Item, current_user: User) -> None:
    if not current_user.is_superuser and item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
