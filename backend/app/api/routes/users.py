import uuid

from fastapi import APIRouter, Depends

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.models import (
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.services.user import (
    create_user,
    delete_current_user,
    delete_user,
    get_user_by_id,
    list_users,
    register_user,
    update_current_user,
    update_current_user_password,
    update_user,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
async def list(session: SessionDep, skip: int = 0, limit: int = 100) -> UsersPublic:
    """
    Retrieve users.
    """
    return await list_users(session=session, skip=skip, limit=limit)


@router.post("/", dependencies=[Depends(get_current_active_superuser)])
async def create(*, session: SessionDep, user_in: UserCreate) -> User:
    """
    Create new user.
    """
    return await create_user(session=session, user_in=user_in)


@router.patch("/me")
async def update_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> User:
    """
    Update own user.
    """
    return await update_current_user(
        session=session, user_in=user_in, current_user=current_user
    )


@router.patch("/me/password")
async def update_me_password(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Message:
    """
    Update own password.
    """
    return await update_current_user_password(
        session=session, body=body, current_user=current_user
    )


@router.get("/me")
def read_me(current_user: CurrentUser) -> User:
    """
    Get current user.
    """
    return current_user


@router.delete("/me")
async def delete_me(session: SessionDep, current_user: CurrentUser) -> Message:
    """
    Delete own user.
    """
    return await delete_current_user(session=session, current_user=current_user)


@router.post("/signup")
async def register(session: SessionDep, user_in: UserRegister) -> User:
    """
    Create new user without the need to be logged in.
    """
    return await register_user(session=session, user_in=user_in)


@router.get("/{user_id}")
async def read(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> User:
    """
    Get a specific user by id.
    """
    return await get_user_by_id(
        session=session, user_id=user_id, current_user=current_user
    )


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
async def update(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> User:
    """
    Update a user.
    """
    return await update_user(session=session, user_id=user_id, user_in=user_in)


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
async def delete(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    return await delete_user(
        session=session, current_user=current_user, user_id=user_id
    )
