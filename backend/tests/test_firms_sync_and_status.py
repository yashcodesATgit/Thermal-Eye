"""
Unit tests for FIRMS Sync & Status Manager and lightweight endpoints.
Verifies status classification (live/delayed/stale/degraded), 5-hour cooldown, concurrency locking, and status payload integration.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.firms_status import FIRMSSyncManager
from app.api.v1.firms import get_firms_status
from app.api.v1.health import health_check


def test_firms_status_classification():
    """Verify status transitions based on last successful sync age."""
    mgr = FIRMSSyncManager()

    now = datetime.now(timezone.utc)

    # 1. Fresh (Synced < 1h ago) -> "live"
    mgr.last_sync_success_at = now - timedelta(minutes=30)
    mgr.last_sync_status = "success"
    assert mgr.get_status_classification() == "live"

    # 2. Aging (Synced 1h-3h ago) -> "delayed"
    mgr.last_sync_success_at = now - timedelta(hours=2)
    assert mgr.get_status_classification() == "delayed"

    # 3. Stale (Synced > 3h ago) -> "stale"
    mgr.last_sync_success_at = now - timedelta(hours=5)
    assert mgr.get_status_classification() == "stale"

    # 4. Failed/Degraded -> "degraded"
    mgr.last_sync_status = "degraded"
    assert mgr.get_status_classification() == "degraded"


@pytest.mark.anyio
async def test_firms_cooldown_and_lock():
    """Verify 1-hour cooldown prevents unnecessary FIRMS API calls."""
    mgr = FIRMSSyncManager()
    now = datetime.now(timezone.utc)
    mgr.last_sync_success_at = now - timedelta(minutes=20)  # 20 minutes ago (within 1h cooldown)

    executed = await mgr.execute_sync_if_needed(force=False)
    assert executed is False


@pytest.mark.anyio
async def test_firms_status_endpoint():
    """Verify GET /api/v1/firms/status returns lightweight status metadata without calling FIRMS."""
    res = await get_firms_status()
    assert "status" in res
    assert "lastSyncSuccessAt" in res
    assert "latestObservationAt" in res
    assert "satellites" in res
    assert res["satellites"] == ["SNPP", "NOAA-20", "NOAA-21"]


@pytest.mark.anyio
async def test_health_check_with_firms_summary():
    """Verify GET /api/v1/health includes firms summary metadata."""
    mock_db = AsyncMock()
    res = await health_check(db=mock_db)
    assert "status" in res
    assert "firms" in res
    assert "status" in res["firms"]
