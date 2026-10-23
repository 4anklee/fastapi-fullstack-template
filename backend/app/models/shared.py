from sqlmodel import Field, SQLModel


# Generic message
class Message(SQLModel):
    message: str


class PaginationParams(SQLModel):
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1, le=100)
