import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.db.session import async_session_factory
from sqlalchemy import text

async def get_hotspot():
    async with async_session_factory() as session:
        # Near 22.3894°N, 73.1151°E
        result = await session.execute(text("SELECT id, latitude, longitude, type, brightness, confidence, ml_type, ml_confidence, source FROM hotspots WHERE latitude >= 22.38 AND latitude <= 22.40 AND longitude >= 73.11 AND longitude <= 73.12 ORDER BY timestamp DESC LIMIT 5"))
        rows = result.fetchall()
        if not rows:
            print("NO ROWS FOUND")
        for row in rows:
            print(dict(row._mapping))

asyncio.run(get_hotspot())
