"""
Hotspot database model.
Matches the frontend Hotspot TypeScript interface with additional
geographic fields for India-wide coverage.
"""
from sqlalchemy import Column, DateTime, Float, ForeignKey, Index, String
from geoalchemy2 import Geometry

from app.db.base import Base


class Hotspot(Base):
    """Thermal anomaly detection record."""

    __tablename__ = "hotspots"

    id = Column(String, primary_key=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # industrial_fire | gas_flare | agricultural | wildfire | unknown
    brightness = Column(Float, nullable=False)  # Kelvin
    confidence = Column(Float, nullable=False)  # 0-100
    severity = Column(String, nullable=False)  # low | medium | high | critical
    timestamp = Column(DateTime(timezone=True), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)
    status = Column(String, nullable=False, default="active")  # active | resolved | monitoring

    # Geographic fields for India-wide coverage
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True, default="India")

    # Source traceability: NULL = demo/seed data, "VIIRS_SNPP_NRT" / "MODIS_NRT" = FIRMS
    source = Column(String, nullable=True)

    # PostGIS geometry column: POINT(longitude latitude), SRID 4326 (WGS84)
    geometry = Column(Geometry("POINT", srid=4326), nullable=True)

    __table_args__ = (
        Index("ix_hotspots_type", "type"),
        Index("ix_hotspots_severity", "severity"),
        Index("ix_hotspots_state", "state"),
        Index("ix_hotspots_timestamp", "timestamp"),
        Index("ix_hotspots_facility_id", "facility_id"),
        Index("ix_hotspots_geometry", "geometry", postgresql_using="gist"),
    )
