"""
Production ML Model Training Script.
Trains a tuned multi-class XGBoost Classifier on synthetic/engineered NASA FIRMS telemetry
and serializes the model weights to backend/app/ml/models/xgboost_v1.joblib.
"""
import os
import json
import random
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from xgboost import XGBClassifier

ML_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(ML_DIR, "models")
MODEL_FILE = os.path.join(MODELS_DIR, "xgboost_v1.joblib")

CLASS_NAMES = ["industrial_fire", "gas_flare", "agricultural", "wildfire", "unknown"]
CLASS_MAP = {name: i for i, name in enumerate(CLASS_NAMES)}
REV_CLASS_MAP = {i: name for i, name in enumerate(CLASS_NAMES)}


def train_production_model(num_samples: int = 100000):
    """Generates training data, fits XGBoost model, and saves joblib artifact."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"Generating {num_samples} training samples for Phase 6 production ML model...")

    np.random.seed(42)
    random.seed(42)

    ti4 = np.random.uniform(295.0, 368.0, num_samples)
    ti5 = np.random.uniform(280.0, 318.0, num_samples)
    frp = np.random.uniform(0.5, 45.0, num_samples)
    confidence = np.random.randint(40, 100, num_samples)
    is_day = np.random.choice([0.0, 1.0], size=num_samples)
    facility_dist_km = np.random.exponential(scale=22.0, size=num_samples)
    persistence_count = np.random.poisson(lam=2.8, size=num_samples)

    brightness_ratio = ti4 / (ti5 + 1e-5)
    temp_diff = ti4 - ti5
    frp_density = frp / (ti4 + 1e-5)
    confidence_norm = confidence / 100.0

    X = np.column_stack([
        ti4, ti5, brightness_ratio, temp_diff,
        frp, frp_density, confidence_norm, is_day,
        facility_dist_km, persistence_count
    ])

    y = []
    for i in range(num_samples):
        # Domain feature rules
        if ti4[i] > 342.0 and frp[i] > 16.0 and facility_dist_km[i] < 6.0:
            base = 1  # gas_flare
        elif ti4[i] > 326.0 and facility_dist_km[i] < 10.0:
            base = 0  # industrial_fire
        elif ti4[i] < 316.0 and frp[i] < 7.0 and facility_dist_km[i] > 12.0:
            base = 2  # agricultural
        else:
            base = 3  # wildfire

        # Environmental satellite noise (15%)
        if random.random() < 0.15:
            base = random.choice([0, 1, 2, 3, 4])
        y.append(base)

    y = np.array(y)

    print("Fitting XGBoost Classifier (n_estimators=150, max_depth=6)...")
    model = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="mlogloss",
        n_jobs=-1
    )
    model.fit(X, y)

    artifact = {
        "model": model,
        "class_names": CLASS_NAMES,
        "feature_columns": [
            "bright_ti4", "bright_ti5", "brightness_ratio", "temp_diff",
            "frp", "frp_density", "confidence_norm", "is_day",
            "facility_dist_km", "persistence_count"
        ],
        "model_version": "xgboost-v1"
    }

    joblib.dump(artifact, MODEL_FILE)
    print(f"Successfully trained and saved model to: {MODEL_FILE}")


if __name__ == "__main__":
    train_production_model()
