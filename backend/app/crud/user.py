from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.security import hash_password


async def get_user_by_id(db_session: AsyncSession, user_pk: int) -> User | None:
    result = await db_session.execute(select(User).where(User.id == user_pk))
    return result.scalar_one_or_none()


async def get_user_by_identifier(
    db_session: AsyncSession, user_id: str
) -> User | None:
    result = await db_session.execute(select(User).where(User.user_id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db_session: AsyncSession,
    *,
    user_id: str,
    display_name: str,
    password: str,
) -> User:
    user = User(
        user_id=user_id,
        display_name=display_name,
        hashed_password=hash_password(password),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


async def ensure_demo_user(
    db_session: AsyncSession,
    *,
    user_id: str,
    display_name: str,
    password: str,
) -> User:
    user = await get_user_by_identifier(db_session, user_id)
    if user:
        return user
    return await create_user(
        db_session,
        user_id=user_id,
        display_name=display_name,
        password=password,
    )
