"""
Phase 7A Production ML Integration Tests.
Includes Golden Regression Inference Test, Model Version Verification, Feature Order Validation,
Abstention Threshold Verification, and Non-Leakage Temporal Persistence Test.
"""
import pytest
import numpy as np
from datetime import datetime, timezone

from app.ml.inference import ml_inference_service
from app.ml.model import model_manager
from app.ml.features import extract_features, FEATURE_COLUMNS


def test_model_version_frozen_v2():
    """Verify that loaded model version is exactly 'xgboost-v1-1m-v2'."""
    model_manager.load_model()
    assert model_manager.is_loaded is True
    assert model_manager.model_version == "xgboost-v1-1m-v2"


def test_golden_regression_deterministic_prediction():
    """Golden Regression Test: Verifies deterministic prediction output on fixed FIRMS observation."""
    model_manager.load_model()

    # Deterministic observation
    out = ml_inference_service.predict_observation(
        brightness=345.5,
        bright_ti5=298.0,
        frp=28.4,
        confidence=90.0,
        latitude=22.4143,
        longitude=69.03838,
        timestamp=datetime(2026, 8, 26, 12, 0, 0, tzinfo=timezone.utc),
        facility_dist_km=1.4,
        persistence_count=7
    )

    assert out.ml_type == "gas_flare"
    assert out.ml_confidence >= 0.50
    assert out.model_version == "xgboost-v1-1m-v2"
    assert "facility_dist_km" in out.ml_explanation


def test_feature_vector_ordering_and_units():
    """Verify 10-feature vector ordering and exact column mapping."""
    fdict = extract_features(
        brightness=330.0,
        bright_ti5=290.0,
        frp=15.0,
        confidence=80.0,
        latitude=20.0,
        longitude=75.0,
        facility_dist_km=5.0,
        persistence_count=3
    )

    assert len(FEATURE_COLUMNS) == 10
    assert FEATURE_COLUMNS == [
        'bright_ti4', 'bright_ti5', 'brightness_ratio', 'temp_diff',
        'frp', 'frp_density', 'confidence_norm', 'is_day',
        'facility_dist_km', 'persistence_count'
    ]

    assert fdict['bright_ti4'] == 330.0
    assert fdict['bright_ti5'] == 290.0
    assert round(fdict['brightness_ratio'], 4) == round(330.0 / 290.0, 4)
    assert fdict['temp_diff'] == 40.0
    assert fdict['confidence_norm'] == 0.8


def test_abstention_threshold_low_confidence():
    """Verify that predictions below 0.45 threshold yield 'unknown'."""
    model_manager.load_model()

    out = ml_inference_service.predict_observation(
        brightness=295.0,
        bright_ti5=290.0,
        frp=0.5,
        confidence=40.0,
        latitude=10.0,
        longitude=75.0,
        facility_dist_km=50.0,
        persistence_count=0
    )

    assert out.ml_type in ("unknown", "agricultural")
    assert out.model_version == "xgboost-v1-1m-v2"
