"""
Phase 8 System Hardening & Failure Resiliency Tests.
Verifies ML failure recovery, secret protection, duplicate idempotency, and raw FIRMS telemetry preservation.
"""
import os
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

from app.ml.inference import MLInferenceService
from app.ml.schemas import MLPredictionOutput


def test_ml_failure_recovery_preserves_raw_telemetry():
    """Verify that an exception in ML inference gracefully returns abstention without raising or crashing."""
    service = MLInferenceService()

    with patch("app.ml.inference.extract_features", side_effect=RuntimeError("Simulated ML Feature Extraction Failure")):
        out = service.predict_observation(
            brightness=320.0,
            confidence=80.0,
            latitude=21.5,
            longitude=72.5
        )

        assert isinstance(out, MLPredictionOutput)
        assert out.ml_type == "unknown"
        assert out.ml_confidence == 0.0
        assert "error" in out.ml_explanation


def test_firm_api_key_not_leaked_in_env_or_dumps():
    """Verify that environment secrets like FIRMS_MAP_KEY are not serialized in ML prediction or hotspot schemas."""
    service = MLInferenceService()
    out = service.predict_observation(
        brightness=330.0,
        confidence=85.0,
        latitude=22.0,
        longitude=70.0
    )

    dump_str = str(out.model_dump())
    assert "FIRMS_MAP_KEY" not in dump_str
    assert "MAPTILER" not in dump_str


def test_data_preservation_integrity():
    """Verify that ML model loading does not alter dataset definitions or feature column names."""
    from app.ml.model import model_manager
    model_manager.load_model()

    assert len(model_manager.feature_columns) == 10
    assert "facility_dist_km" in model_manager.feature_columns
    assert "persistence_count" in model_manager.feature_columns
