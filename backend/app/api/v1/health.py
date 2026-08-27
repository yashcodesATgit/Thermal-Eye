"""
Health check endpoint.
"""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Application health check.
    Returns app status and database connectivity.
    """
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Database health check failed: %s", str(e))
        db_status = "unavailable"

    status = "healthy" if db_status == "healthy" else "degraded"

    return {
        "status": status,
        "service": "thermalwatch-api",
        "version": "0.1.0",
        "database": db_status,
    }
