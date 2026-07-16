from pydantic import BaseModel, Field

from app.schemas.user import UserSummary


class LoginRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    message: str
    user: UserSummary


class SessionUserResponse(BaseModel):
    authenticated: bool
    user: UserSummary | None = None
