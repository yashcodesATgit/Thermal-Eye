"""
Unit and integration tests for ThermalEye Phase 6 ML classification pipeline.
"""
import pytest
from app.ml.features import extract_features, features_to_vector
from app.ml.model import model_manager
from app.ml.inference import ml_inference_service
from app.schemas.hotspot import HotspotResponse


def test_feature_extraction():
    fdict = extract_features(
        brightness=345.0,
        bright_ti5=300.0,
        frp=25.0,
        confidence=90.0,
        latitude=22.3,
        longitude=70.8,
        facility_dist_km=4.5,
        persistence_count=3
    )
    assert fdict["bright_ti4"] == 345.0
    assert fdict["bright_ti5"] == 300.0
    assert fdict["temp_diff"] == 45.0
    assert fdict["facility_dist_km"] == 4.5
    assert fdict["persistence_count"] == 3


def test_model_manager_loading():
    assert model_manager.load_model() is True
    assert model_manager.is_loaded is True
    assert model_manager.model_version == "xgboost-v1-1m-v2"


def test_ml_inference_service():
    # Test Gas Flare / Industrial high temperature prediction
    pred = ml_inference_service.predict_observation(
        brightness=350.0,
        bright_ti5=305.0,
        frp=30.0,
        confidence=95.0,
        latitude=22.307,
        longitude=70.802,
        facility_dist_km=1.5
    )
    assert pred.ml_type in ("industrial_fire", "gas_flare", "wildfire", "agricultural", "unknown")
    assert pred.ml_confidence >= 0.0
    assert pred.model_version == "xgboost-v1-1m-v2"
    assert isinstance(pred.ml_explanation, dict)


def test_hotspot_schema_ml_fields():
    data = {
        "id": "test-123",
        "latitude": 22.3,
        "longitude": 70.8,
        "type": "unknown",
        "brightness": 340.0,
        "confidence": 90.0,
        "severity": "high",
        "timestamp": "2026-08-26T12:00:00Z",
        "facilityId": None,
        "status": "active",
        "mlType": "industrial_fire",
        "mlConfidence": 0.88,
        "modelVersion": "xgboost-v1",
        "mlExplanation": '{"bright_ti4": 0.35, "facility_dist_km": 0.30}'
    }
    schema = HotspotResponse.model_validate(data)
    assert schema.type == "unknown"
    assert schema.ml_type == "industrial_fire"
    assert schema.ml_confidence == 0.88
    assert schema.model_version == "xgboost-v1"
