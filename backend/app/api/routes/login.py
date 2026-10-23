from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import Message, NewPassword, Token, User, UserPublic
from app.services.auth import (
    create_login_token,
    get_password_recovery_email,
    recover_password,
    reset_password,
)

router = APIRouter(tags=["login"])


@router.post("/login/access-token")
async def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    return await create_login_token(
        session=session, email=form_data.username, password=form_data.password
    )


@router.post("/login/test-token", response_model=UserPublic)
async def test_token(current_user: CurrentUser) -> User:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}")
async def recover(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    return await recover_password(session=session, email=email)


@router.post("/reset-password/")
async def reset(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    return await reset_password(session=session, body=body)


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
)
async def recover_password_html_content(
    email: str, session: SessionDep
) -> HTMLResponse:
    """
    HTML Content for Password Recovery
    """
    email_data = await get_password_recovery_email(session=session, email=email)

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )
