from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user import get_user_by_identifier, get_user_by_id
from app.db import get_db_session
from app.dependencies.auth import SESSION_USER_KEY, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, SessionUserResponse
from app.schemas.common import MessageResponse
from app.schemas.user import UserSummary
from app.security import verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db_session: AsyncSession = Depends(get_db_session),
) -> LoginResponse:
    user = await get_user_by_identifier(db_session, payload.user_id)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーIDまたはパスワードが正しくありません。",
        )

    request.session.clear()
    request.session[SESSION_USER_KEY] = user.id
    return LoginResponse(message="ログインしました。", user=UserSummary.model_validate(user))


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request) -> MessageResponse:
    request.session.clear()
    return MessageResponse(message="ログアウトしました。")


@router.get("/me", response_model=SessionUserResponse)
async def me(
    request: Request,
    db_session: AsyncSession = Depends(get_db_session),
) -> SessionUserResponse:
    user_id = request.session.get(SESSION_USER_KEY)
    if not user_id:
        return SessionUserResponse(authenticated=False, user=None)

    user = await get_user_by_id(db_session, int(user_id))
    if not user:
        request.session.clear()
        return SessionUserResponse(authenticated=False, user=None)

    return SessionUserResponse(authenticated=True, user=UserSummary.model_validate(user))


@router.get("/protected", response_model=UserSummary)
async def protected(current_user: User = Depends(get_current_user)) -> UserSummary:
    return UserSummary.model_validate(current_user)
