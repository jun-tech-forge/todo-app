from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.todos import router as todos_router
from app.core.config import settings
from app.crud.user import ensure_demo_user
from app.db import SessionLocal, engine, init_db
from app.models import Todo, User


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    async with SessionLocal() as session:
        await ensure_demo_user(
            session,
            user_id=settings.demo_user_id,
            display_name=settings.demo_user_name,
            password=settings.demo_user_password,
        )
    yield
    await engine.dispose()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie=settings.session_cookie_name,
    same_site="lax",
    https_only=not settings.disable_secure_cookies,
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(todos_router, prefix=settings.api_prefix)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/healthcheck")
async def healthcheck_legacy() -> None:
    return None