"""
Alert service — business logic layer.
"""
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.models.alert import Alert
from app.repositories.alert import AlertRepository


class AlertService:
    """Business logic for alert operations."""

    def __init__(self, db: AsyncSession):
        self.repo = AlertRepository(db)

    async def get_by_id(self, alert_id: str) -> Alert:
        """Get an alert by ID or raise NotFoundError."""
        alert = await self.repo.get_by_id(alert_id)
        if alert is None:
            raise NotFoundError("Alert", alert_id)
        return alert

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 100,
        severity: Optional[str] = None,
        acknowledged: Optional[bool] = None,
    ) -> tuple[list[Alert], int]:
        """List alerts with filters and pagination."""
        return await self.repo.list(
            page=page,
            page_size=page_size,
            severity=severity,
            acknowledged=acknowledged,
        )
