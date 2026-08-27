"""
Alert repository — database access layer for alert queries.
"""
import logging
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.alert import Alert

logger = logging.getLogger(__name__)


class AlertRepository:
    """Repository for alert database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, alert_id: str) -> Optional[Alert]:
        """Get a single alert by ID."""
        result = await self.db.execute(
            select(Alert).where(Alert.id == alert_id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 100,
        severity: Optional[str] = None,
        acknowledged: Optional[bool] = None,
    ) -> tuple[list[Alert], int]:
        """
        List alerts with optional filters and pagination.
        Returns (items, total_count).
        """
        query = select(Alert)
        count_query = select(func.count()).select_from(Alert)

        if severity is not None:
            query = query.where(Alert.severity == severity)
            count_query = count_query.where(Alert.severity == severity)
        if acknowledged is not None:
            query = query.where(Alert.acknowledged == acknowledged)
            count_query = count_query.where(Alert.acknowledged == acknowledged)

        # Order by timestamp descending (most recent first)
        query = query.order_by(Alert.timestamp.desc())

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        return items, total
