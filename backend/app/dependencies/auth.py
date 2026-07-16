from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user import get_user_by_id
from app.db import get_db_session
from app.models.user import User

SESSION_USER_KEY = "user_id"


async def get_current_user(
    request: Request,
    db_session: AsyncSession = Depends(get_db_session),
) -> User:
    user_id = request.session.get(SESSION_USER_KEY)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ログインが必要です。",
        )

    user = await get_user_by_id(db_session, int(user_id))
    if not user:
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ログイン状態を確認できませんでした。",
        )
    return user
