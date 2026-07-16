from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


async def list_todos(db_session: AsyncSession, owner_id: int) -> list[Todo]:
    result = await db_session.execute(
        select(Todo).where(Todo.owner_id == owner_id).order_by(Todo.created_at.desc(), Todo.id.desc())
    )
    return list(result.scalars().all())


async def create_todo(db_session: AsyncSession, owner_id: int, payload: TodoCreate) -> Todo:
    todo = Todo(
        owner_id=owner_id,
        title=payload.title,
        description=payload.description,
    )
    db_session.add(todo)
    await db_session.commit()
    await db_session.refresh(todo)
    return todo


async def get_todo(db_session: AsyncSession, todo_id: int, owner_id: int) -> Todo | None:
    result = await db_session.execute(
        select(Todo).where(Todo.id == todo_id, Todo.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def update_todo(
    db_session: AsyncSession,
    todo_id: int,
    owner_id: int,
    payload: TodoUpdate,
) -> Todo | None:
    todo = await get_todo(db_session, todo_id, owner_id)
    if not todo:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        setattr(todo, field_name, value)

    await db_session.commit()
    await db_session.refresh(todo)
    return todo


async def delete_todo(db_session: AsyncSession, todo_id: int, owner_id: int) -> bool:
    todo = await get_todo(db_session, todo_id, owner_id)
    if not todo:
        return False
    await db_session.delete(todo)
    await db_session.commit()
    return True


async def delete_trashed_todos(db_session: AsyncSession, owner_id: int) -> int:
    result = await db_session.execute(
        delete(Todo).where(Todo.owner_id == owner_id, Todo.status == "trashed")
    )
    await db_session.commit()
    return result.rowcount or 0
