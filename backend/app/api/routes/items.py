import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, PaginationDep, SessionDep
from app.models import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate, Message
from app.services.item import (
    create_item,
    delete_item,
    get_item,
    list_items,
    update_item,
)

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/")
async def list(
    session: SessionDep, current_user: CurrentUser, pagination: PaginationDep
) -> ItemsPublic:
    """
    Retrieve items.
    """
    return await list_items(
        session=session,
        current_user=current_user,
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.get("/{id}", response_model=ItemPublic)
async def read(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Item:
    """
    Get item by ID.
    """
    return await get_item(session=session, current_user=current_user, item_id=id)


@router.post("/", response_model=ItemPublic)
async def create(
    *, session: SessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Item:
    """
    Create new item.
    """
    return await create_item(
        session=session, current_user=current_user, item_in=item_in
    )


@router.put("/{id}", response_model=ItemPublic)
async def update(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ItemUpdate,
) -> Item:
    """
    Update an item.
    """
    return await update_item(
        session=session, current_user=current_user, item_id=id, item_in=item_in
    )


@router.delete("/{id}")
async def delete(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an item.
    """
    return await delete_item(session=session, current_user=current_user, item_id=id)
