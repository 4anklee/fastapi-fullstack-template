from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import SessionDep
from app.models import User
from app.services.user import create_private_user

router = APIRouter(tags=["private"], prefix="/private")


class PrivateUserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    is_verified: bool = False


@router.post("/users/")
async def create(user_in: PrivateUserCreate, session: SessionDep) -> User:
    """
    Create a new user.
    """
    return await create_private_user(
        session=session,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
    )
