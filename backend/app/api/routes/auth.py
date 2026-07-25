import logging

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
logger = logging.getLogger(__name__)


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db_session: AsyncSession = Depends(get_db_session),
) -> LoginResponse:
    client_host = request.client.host if request.client else "unknown"
    logger.info("Login attempt started: user_id=%s client=%s", payload.user_id, client_host)

    try:
        user = await get_user_by_identifier(db_session, payload.user_id)
    except Exception:
        logger.exception("Login user lookup failed: user_id=%s client=%s", payload.user_id, client_host)
        raise

    if not user:
        logger.warning("Login failed: user not found user_id=%s client=%s", payload.user_id, client_host)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーIDまたはパスワードが正しくありません。",
        )

    logger.info(
        "Login user loaded: user_id=%s db_user_pk=%s hash_prefix=%s",
        payload.user_id,
        user.id,
        user.hashed_password[:20],
    )

    try:
        password_is_valid = verify_password(payload.password, user.hashed_password)
    except Exception:
        logger.exception(
            "Login password verification errored: user_id=%s db_user_pk=%s hash_prefix=%s",
            payload.user_id,
            user.id,
            user.hashed_password[:20],
        )
        raise

    if not password_is_valid:
        logger.warning("Login failed: password mismatch user_id=%s db_user_pk=%s", payload.user_id, user.id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーIDまたはパスワードが正しくありません。",
        )

    request.session.clear()
    request.session[SESSION_USER_KEY] = user.id
    logger.info("Login succeeded: user_id=%s db_user_pk=%s session_key=%s", payload.user_id, user.id, SESSION_USER_KEY)
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
