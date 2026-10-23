import uuid

from fastapi import HTTPException
from pydantic import MISSING, EmailStr
from sqlmodel import col, delete, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Item,
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import generate_new_account_email, send_email

DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


async def list_users(
    *, session: AsyncSession, skip: int = 0, limit: int = 100
) -> UsersPublic:
    count_statement = select(func.count()).select_from(User)
    count = (await session.exec(count_statement)).one()

    statement = (
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    )
    users = (await session.exec(statement)).all()

    users_public = [UserPublic.model_validate(user) for user in users]
    return UsersPublic(data=users_public, count=count)


async def create_user_record(*, session: AsyncSession, user_create: UserCreate) -> User:
    user = User.model_validate(
        user_create,
        update={"hashed_password": await get_password_hash(user_create.password)},
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def update_user_record(
    *, session: AsyncSession, db_user: User, user_in: UserUpdate
) -> User:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = await get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def get_user_by_email(
    *, session: AsyncSession, email: EmailStr | str
) -> User | None:
    statement = select(User).where(User.email == str(email))
    return (await session.exec(statement)).first()


async def authenticate_user(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    user = await get_user_by_email(session=session, email=email)
    if not user:
        # Keep timing similar whether or not the email exists.
        await verify_password(password, DUMMY_HASH)
        return None

    verified, updated_password_hash = await verify_password(
        password, user.hashed_password
    )
    if not verified:
        return None

    if updated_password_hash:
        user.hashed_password = updated_password_hash
        session.add(user)
        await session.commit()
        await session.refresh(user)
    return user


async def create_user(*, session: AsyncSession, user_in: UserCreate) -> User:
    user = await get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = await create_user_record(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = await generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        await send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user


async def create_private_user(
    *, session: AsyncSession, email: str, password: str, full_name: str
) -> User:
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=await get_password_hash(password),
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def update_current_user(
    *, session: AsyncSession, user_in: UserUpdateMe, current_user: User
) -> User:
    if user_in.email is not MISSING:
        existing_user = await get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user


async def update_current_user_password(
    *, session: AsyncSession, body: UpdatePassword, current_user: User
) -> Message:
    verified, _ = await verify_password(
        body.current_password, current_user.hashed_password
    )
    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )

    current_user.hashed_password = await get_password_hash(body.new_password)
    session.add(current_user)
    await session.commit()
    return Message(message="Password updated successfully")


async def delete_current_user(*, session: AsyncSession, current_user: User) -> Message:
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )

    await session.delete(current_user)
    await session.commit()
    return Message(message="User deleted successfully")


async def register_user(*, session: AsyncSession, user_in: UserRegister) -> User:
    user = await get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )

    user_create = UserCreate.model_validate(user_in)
    return await create_user_record(session=session, user_create=user_create)


async def get_user_by_id(
    *, session: AsyncSession, user_id: uuid.UUID, current_user: User
) -> User:
    user = await session.get(User, user_id)
    if user is not None and user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def update_user(
    *, session: AsyncSession, user_id: uuid.UUID, user_in: UserUpdate
) -> User:
    db_user = await session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )

    if user_in.email is not MISSING:
        existing_user = await get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    return await update_user_record(session=session, db_user=db_user, user_in=user_in)


async def delete_user(
    *, session: AsyncSession, current_user: User, user_id: uuid.UUID
) -> Message:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )

    statement = delete(Item).where(col(Item.owner_id) == user_id)
    await session.exec(statement)
    await session.delete(user)
    await session.commit()
    return Message(message="User deleted successfully")
