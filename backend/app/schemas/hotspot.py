"""
Hotspot Pydantic schemas.
Serialization matches the frontend Hotspot TypeScript interface exactly,
including camelCase field names (facilityId, not facility_id).
"""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


HotspotType = Literal[
    "industrial_fire", "gas_flare", "agricultural", "wildfire", "unknown"
]
Severity = Literal["low", "medium", "high", "critical"]
HotspotStatus = Literal["active", "resolved", "monitoring"]


class HotspotResponse(BaseModel):
    """API response schema matching the frontend Hotspot interface."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    latitude: float
    longitude: float
    type: HotspotType
    brightness: float
    confidence: float
    severity: Severity
    timestamp: datetime
    facility_id: Optional[str] = Field(None, alias="facilityId", serialization_alias="facilityId")
    status: HotspotStatus


class ActivityByType(BaseModel):
    industrial_fire: int = Field(0, alias="industrialFire", serialization_alias="industrialFire")
    gas_flare: int = Field(0, alias="gasFlare", serialization_alias="gasFlare")
    agricultural: int = 0
    wildfire: int = 0
    unknown: int = 0
    
    model_config = ConfigDict(populate_by_name=True)


class ActivityDayResponse(BaseModel):
    date: str  # YYYY-MM-DD
    total: int
    by_type: ActivityByType = Field(..., alias="byType", serialization_alias="byType")
    
    model_config = ConfigDict(populate_by_name=True)


class ActivityResponse(BaseModel):
    days: list[ActivityDayResponse]
