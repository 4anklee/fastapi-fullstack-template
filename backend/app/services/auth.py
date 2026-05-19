from datetime import timedelta

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core import security
from app.core.config import settings
from app.models import Message, NewPassword, Token, UserUpdate
from app.services import user as user_service
from app.utils import (
    EmailData,
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)


async def create_login_token(
    *, session: AsyncSession, email: str, password: str
) -> Token:
    user = await user_service.authenticate_user(
        session=session, email=email, password=password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )


async def recover_password(*, session: AsyncSession, email: str) -> Message:
    user = await user_service.get_user_by_email(session=session, email=email)

    # Always return the same response to prevent email enumeration attacks.
    if user:
        password_reset_token = generate_password_reset_token(email=email)
        email_data = generate_reset_password_email(
            email_to=user.email, email=email, token=password_reset_token
        )
        send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return Message(
        message="If that email is registered, we sent a password recovery link"
    )


async def reset_password(*, session: AsyncSession, body: NewPassword) -> Message:
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")

    user = await user_service.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    user_in_update = UserUpdate(password=body.new_password)
    await user_service.update_user_record(
        session=session,
        db_user=user,
        user_in=user_in_update,
    )
    return Message(message="Password updated successfully")


async def get_password_recovery_email(
    *, session: AsyncSession, email: str
) -> EmailData:
    user = await user_service.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )

    password_reset_token = generate_password_reset_token(email=email)
    return generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
