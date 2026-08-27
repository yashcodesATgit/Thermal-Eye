import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.database_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT * FROM facilities;"))
        for row in res:
            print(dict(row._mapping))
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
