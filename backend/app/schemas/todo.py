from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TodoStatus = Literal["not_started", "completed", "trashed"]


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    status: TodoStatus | None = None


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: TodoStatus
    created_at: datetime
    updated_at: datetime
