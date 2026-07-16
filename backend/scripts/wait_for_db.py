import asyncio

from sqlalchemy import text

from app.db import engine


async def main() -> None:
    for _ in range(30):
        try:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
                return
        except Exception:
            await asyncio.sleep(1)
    raise RuntimeError("Database is not ready")


if __name__ == "__main__":
    asyncio.run(main())
