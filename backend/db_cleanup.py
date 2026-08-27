import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    engine = create_async_engine(settings.database_url, echo=True)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE facilities ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'unknown';"))
            logger.info("Added source column")
        except Exception as e:
            logger.error(f"Error adding column: {e}")
            
        demo_ids = [f"FAC-{str(i).zfill(3)}" for i in range(1, 16)]
        in_clause = ", ".join(f"'{fid}'" for fid in demo_ids)
        
        await conn.execute(text(f"UPDATE hotspots SET facility_id = NULL WHERE facility_id IN ({in_clause});"))
        logger.info("Unlinked hotspots")
        
        await conn.execute(text(f"UPDATE alerts SET facility_id = NULL WHERE facility_id IN ({in_clause});"))
        logger.info("Unlinked alerts")
        
        await conn.execute(text(f"DELETE FROM facilities WHERE id IN ({in_clause});"))
        logger.info("Deleted demo facilities")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
