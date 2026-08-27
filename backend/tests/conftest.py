"""
Pytest configuration for ThermalWatch backend tests.
"""
import os
import pytest
from app.core.config import settings

os.environ["TESTING"] = "true"


@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """Ensure firms_map_key is set for tests if empty."""
    if not settings.firms_map_key:
        monkeypatch.setattr(settings, "firms_map_key", "test_mock_key")
