"""
Pytest configuration for ThermalEye backend tests.
"""
import os
import pytest
from app.core.config import settings

from app.core.redis import redis_manager

os.environ["TESTING"] = "true"


@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """Ensure firms_map_key is set for tests if empty."""
    if not settings.firms_map_key:
        monkeypatch.setattr(settings, "firms_map_key", "test_mock_key")


@pytest.fixture(autouse=True)
async def cleanup_redis_client_autouse():
    """Reset redis_manager client before and after each test to prevent closed loop errors."""
    await redis_manager.close()
    yield
    await redis_manager.close()
