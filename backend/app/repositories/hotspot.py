"""
Hotspot repository — database access layer for hotspot queries.
"""
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy import cast, func, select
from geoalchemy2 import Geography

from app.db.models.hotspot import Hotspot

logger = logging.getLogger(__name__)


class HotspotRepository:
    """Repository for hotspot database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, hotspot_id: str) -> Optional[Hotspot]:
        """Get a single hotspot by ID."""
        result = await self.db.execute(
            select(Hotspot).where(Hotspot.id == hotspot_id)
        )
        return result.scalar_one_or_none()

    async def get_latest_date(self) -> Optional[datetime]:
        """Get the most recent real hotspot timestamp."""
        result = await self.db.execute(
            select(func.max(Hotspot.timestamp)).where(Hotspot.source != "DEMO")
        )
        return result.scalar()

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 100,
        type: Optional[str] = None,
        min_confidence: Optional[float] = None,
        severity: Optional[str] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        country: Optional[str] = None,
        source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        near_lat: Optional[float] = None,
        near_lng: Optional[float] = None,
        radius_km: Optional[float] = None,
    ) -> tuple[list[Hotspot], int]:
        """
        List hotspots with optional filters, PostGIS spatial radius search, and pagination.
        Isolates DEMO data by default unless source='DEMO' is explicitly requested.
        Returns (items, total_count).
        """
        query = select(Hotspot)
        count_query = select(func.count()).select_from(Hotspot)

        # Apply filters
        if source is not None:
            query = query.where(Hotspot.source == source)
            count_query = count_query.where(Hotspot.source == source)
        else:
            query = query.where(Hotspot.source != "DEMO")
            count_query = count_query.where(Hotspot.source != "DEMO")

        if type is not None:
            query = query.where(Hotspot.type == type)
            count_query = count_query.where(Hotspot.type == type)
        if min_confidence is not None:
            query = query.where(Hotspot.confidence >= min_confidence)
            count_query = count_query.where(Hotspot.confidence >= min_confidence)
        if severity is not None:
            query = query.where(Hotspot.severity == severity)
            count_query = count_query.where(Hotspot.severity == severity)
        if state is not None:
            query = query.where(Hotspot.state == state)
            count_query = count_query.where(Hotspot.state == state)
        if city is not None:
            query = query.where(Hotspot.city == city)
            count_query = count_query.where(Hotspot.city == city)
        if country is not None:
            query = query.where(Hotspot.country == country)
            count_query = count_query.where(Hotspot.country == country)
        if start_date is not None:
            query = query.where(Hotspot.timestamp >= start_date)
            count_query = count_query.where(Hotspot.timestamp >= start_date)
        if end_date is not None:
            query = query.where(Hotspot.timestamp <= end_date)
            count_query = count_query.where(Hotspot.timestamp <= end_date)
        if near_lat is not None and near_lng is not None and radius_km is not None:
            point_geom = func.ST_SetSRID(func.ST_MakePoint(near_lng, near_lat), 4326)
            spatial_cond = func.ST_DWithin(
                cast(Hotspot.geometry, Geography),
                cast(point_geom, Geography),
                radius_km * 1000.0,
            )
            query = query.where(spatial_cond)
            count_query = count_query.where(spatial_cond)

        # Order by timestamp descending (most recent first)
        query = query.order_by(Hotspot.timestamp.desc())

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Execute
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        return items, total

    async def get_activity(
        self,
        *,
        min_confidence: Optional[float] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        country: Optional[str] = None,
        source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> list[dict]:
        """Aggregate hotspot counts by day and type, excluding DEMO records by default."""
        # Use PostgreSQL date_trunc or cast to DATE to group by day
        date_trunc_day = func.date_trunc('day', Hotspot.timestamp)
        query = select(
            date_trunc_day.label("day"),
            Hotspot.type,
            func.count().label("count"),
        ).group_by(date_trunc_day, Hotspot.type)

        if source is not None:
            query = query.where(Hotspot.source == source)
        else:
            query = query.where(Hotspot.source != "DEMO")

        if min_confidence is not None:
            query = query.where(Hotspot.confidence >= min_confidence)
        if state is not None:
            query = query.where(Hotspot.state == state)
        if city is not None:
            query = query.where(Hotspot.city == city)
        if country is not None:
            query = query.where(Hotspot.country == country)
        if start_date is not None:
            query = query.where(Hotspot.timestamp >= start_date)
        if end_date is not None:
            query = query.where(Hotspot.timestamp <= end_date)

        query = query.order_by(date_trunc_day.asc())

        result = await self.db.execute(query)
        rows = result.all()

        return [{"day": r.day, "type": r.type, "count": r.count} for r in rows]
