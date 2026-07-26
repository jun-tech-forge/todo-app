from functools import lru_cache
from urllib.parse import quote_plus

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Todo API"
    api_prefix: str = "/api"
    database_url: str | None = Field(default=None, validation_alias=AliasChoices("DATABASE_URL"))
    postgres_user: str = Field(default="portfoliouser", validation_alias=AliasChoices("POSTGRES_USER", "DB_USERNAME"))
    postgres_password: str = Field(default="", validation_alias=AliasChoices("POSTGRES_PASSWORD", "DB_PASSWORD"))
    postgres_host: str = Field(default="db", validation_alias=AliasChoices("POSTGRES_HOST", "DB_HOST"))
    postgres_port: int = Field(default=5432, validation_alias=AliasChoices("POSTGRES_PORT", "DB_PORT"))
    postgres_db: str = Field(default="app", validation_alias=AliasChoices("POSTGRES_DB", "DB_NAME"))
    cors_origins: str = Field(default="http://localhost:3000")
    session_secret: str = "change-me-in-production"
    session_cookie_name: str = "todo_session"
    disable_secure_cookies: bool = Field(
        default=True,
        validation_alias=AliasChoices("DISABLE_SECURE_COOKIES"),
    )
    demo_user_id: str = "demo"
    demo_user_name: str = "Demo User"
    demo_user_password: str = ""
    log_sql: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        user = quote_plus(self.postgres_user)
        password = quote_plus(self.postgres_password)
        return (
            f"postgresql+asyncpg://{user}:{password}@"
            f"{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
