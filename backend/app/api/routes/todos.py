from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.todo import create_todo, delete_todo, delete_trashed_todos, list_todos, update_todo
from app.db import get_db_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[TodoResponse])
async def fetch_todos(
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> list[TodoResponse]:
    todos = await list_todos(db_session, current_user.id)
    return [TodoResponse.model_validate(todo) for todo in todos]


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def add_todo(
    payload: TodoCreate,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> TodoResponse:
    todo = await create_todo(db_session, current_user.id, payload)
    return TodoResponse.model_validate(todo)


@router.patch("/{todo_id}", response_model=TodoResponse)
async def patch_todo(
    todo_id: int,
    payload: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> TodoResponse:
    todo = await update_todo(db_session, todo_id, current_user.id, payload)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="対象の ToDo が見つかりません。")
    return TodoResponse.model_validate(todo)


@router.delete("/trash/all", response_model=MessageResponse)
async def empty_trash(
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    deleted_count = await delete_trashed_todos(db_session, current_user.id)
    return MessageResponse(message=f"{deleted_count} 件の ToDo を削除しました。")


@router.delete("/{todo_id}", response_model=MessageResponse)
async def remove_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    deleted = await delete_todo(db_session, todo_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="対象の ToDo が見つかりません。")
    return MessageResponse(message="ToDo を削除しました。")
