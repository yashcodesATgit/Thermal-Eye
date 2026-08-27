# ThermalWatch — Project Context

## 1. Project Overview
ThermalWatch is an AI-enabled geospatial system for **detecting, classifying, and monitoring industrial fires and persistent thermal sources** using NASA FIRMS satellite data, industrial infrastructure databases, and (future) land-cover/satellite imagery context.

The platform ingests near-real-time thermal anomaly observations from NASA FIRMS VIIRS/MODIS instruments, stores them in a PostGIS-enabled database, and visualizes them as interactive map overlays alongside known industrial facilities.

- **Current Status**:
- **Frontend**: Integrated with real FastAPI backend via `axios` and `TanStack Query`.
- **Backend**: FastAPI running on port 8000, connected to Supabase PostgreSQL + PostGIS.
- **Thermal Data**: **REAL NASA FIRMS VIIRS satellite data ingested via `POST /api/v1/ingestion/firms`**. All real observations stored as `type = unknown` until Phase 6 ML classification.
- **ML Classification**: **NOT YET IMPLEMENTED**. Deferred to Phase 6.

---

## 2. Current Project Status
- **Phases Completed**:
  - Phase 0 (Setup)
  - Phase 1 (UI Shell)
  - Phase 1B (Audit)
  - Phase 2 (MapLibre + Thunderforest)
  - Phase 3 (Intelligence Layer & Filtering)
  - Phase 3B (Visual Alignment)
  - Phase 3C (Full Frontend Audit & Optimization)
  - Phase 3D (Context Documentation)
  - **Phase 4 (Backend Foundation + Supabase/PostGIS Integration)**
  - **Phase 4B (Backend Foundation Audit & Frontend Integration Audit)**
  - **Phase 5 (NASA FIRMS Real Satellite Data Integration)**
  - **Phase 5E (Problem-Statement Alignment & Data Sync)**
  - **Phase 5F (Final FIRMS Data + Classification Semantics + Timeline Audit)** ← COMPLETED
- **Frontend Status**: Integrated with real FastAPI backend via TanStack Query.
- **Backend Status**: FastAPI server with Router-Schema-Service-Repository architecture, PostGIS geospatial queries, Supabase integration, and live India-wide multi-source NASA FIRMS satellite ingestion.
- **ML Status**: **NOT IMPLEMENTED**. All real FIRMS observations are stored as `type = unknown`.
- **FIRMS Data**: Real NASA FIRMS NRT observations (VIIRS_SNPP_NRT, VIIRS_NOAA20_NRT, VIIRS_NOAA21_NRT).
- **Classification**: Real FIRMS observations remain `type = unknown` until Phase 6 ML. Demo data isolated.
- **Temporal Model**: Selected date + 7-day historical window ending on selected date.
- **Geographic Scope**: India-wide (`state = ALL`, `city = ALL` by default).
- **Facilities**: Separate static industrial infrastructure context.
- **Scientific Limitation**: FIRMS detects thermal anomalies, not automatically verified fires.
- **Next Phase**: **Phase 6 (ML Classification)**.

---

## 3. Product Goal
ThermalWatch exists to **detect and classify industrial fires and persistent thermal sources, while distinguishing them from other thermal anomalies** (wildfires, agricultural burning, gas flares, mining activity).

The system ingests near-real-time thermal anomaly observations from NASA FIRMS VIIRS/MODIS instruments, evaluates proximity to known industrial infrastructure, and (in Phase 6) will classify thermal anomalies via machine learning.

### Product Hierarchy
```
Industrial thermal activity (primary focus)
    ├── Industrial Fire
    ├── Gas Flare
    └── Mining / Persistent Thermal Source
        vs.
Non-industrial / natural thermal activity
    ├── Wildfire
    ├── Agricultural Burning
    └── Unknown
```

---

## 4. Core Concept
ThermalWatch operates on three distinct conceptual layers:

1. **GEOGRAPHIC BASEMAP (Thunderforest)**: Provides cartographic context (cities, roads, coastlines, terrain, transportation networks). Thunderforest provides background geographic rendering; it does *not* detect fires or provide thermal data.
2. **THERMAL OBSERVATIONS (Supabase PostGIS / Future Satellite FIRMS Pipeline)**: Stores and ingests raw thermal coordinates `POINT(longitude latitude)`, brightness measurements (Kelvin), detection confidence, and acquisition timestamps.
3. **THERMALWATCH INTELLIGENCE LAYER**: Merges cartographic basemaps with thermal telemetry, classifies heat signatures, computes risk metrics, correlates anomalies with nearby industrial facilities, and renders a multi-layer interactive intelligence map.

```
+-------------------------------------------------------------+
|                 Satellite / FIRMS Telemetry                 |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|              ML Classification & Risk Engine                |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|           ThermalWatch Geospatial Intelligence Layer        |
|             (Heatmap / Point Markers / Facilities)          |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|            MapLibre GL Interactive Renderer                 |
|       (Floating Overlays: Legend, Controls, Panels)         |
+-------------------------------------------------------------+
                              ^
                              |
+-------------------------------------------------------------+
|               Thunderforest Geographic Basemap              |
+-------------------------------------------------------------+
```

---

## 5. Technology Stack

### Frontend
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Core Framework | React | `18.3.1` | Component UI structure |
| Build Tool | Vite | `5.4.11` | Dev server & production bundler |
| Type System | TypeScript | `5.7.2` | Compile-time strict type checking |
| Styling | Tailwind CSS | `3.4.16` | Utility-first CSS styling |
| Map Renderer | MapLibre GL | `4.7.1` | WebGL map rendering engine |
| React Map Wrapper | react-map-gl/maplibre | `7.1.9` | Declarative React components for MapLibre |
| Basemap Tiles | Thunderforest API | Raster | Cartographic map tiles (Cycle Map, Atlas, etc.) |
| Server/Query State | TanStack React Query | `5.62.0` | Data fetching, caching, and query state |
| Client State | Zustand | `^5.0.15` | Global UI client state management |
| Router | React Router DOM | `6.28.0` | Single Page Application routing |
| Icons | Lucide React | `0.469.0` | UI icon library |
| HTTP Client | Axios | `^1.7.9` | Asynchronous API requests to FastAPI backend |

### Backend (Phase 4/4B)
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Web Framework | FastAPI | `0.115.6` | Asynchronous REST API framework |
| Server | Uvicorn | `0.34.0` | ASGI web server |
| ORM | SQLAlchemy (asyncio) | `2.0.36` | Asynchronous database ORM |
| Database Driver | asyncpg | `0.30.0` | High-performance PostgreSQL async driver |
| GIS Extension | GeoAlchemy2 | `0.15.2` | Spatial PostGIS types & functions for SQLAlchemy |
| Data Validation | Pydantic | `2.13.4` | Data schemas & camelCase serialization |
| Configuration | Pydantic Settings | `2.7.0` | Environment settings management |
| Database Cloud | Supabase PostgreSQL | PostGIS 3.x | Cloud database & spatial storage |
| Migration Tool | Alembic | `1.14.1` | Database migration framework |
| Test Suite | pytest | `8.3.4` | Asynchronous API unit & integration testing |

---

## 6. Architecture & Data Flow

```
+-------------------------------------------------------------+
|                      React Frontend                         |
|                 (TanStack Query / Axios)                    |
+-------------------------------------------------------------+
                              ^
                              | REST API / JSON (camelCase serialized)
                              v
+-------------------------------------------------------------+
|                       FastAPI Server                        |
|           (/api/v1 - Routers / Services / Repos)            |
+-------------------------------------------------------------+
                              ^
                              | SQLAlchemy Async Session
                              v
+-------------------------------------------------------------+
|               Supabase PostgreSQL + PostGIS                 |
|            (Hotspots, Facilities, Alerts Tables)            |
+-------------------------------------------------------------+
```

### Clean Control Flow Scoping:
```
Route (FastAPI Endpoint)
 ↓
Pydantic Schema (Validation & Serialization)
 ↓
Service (Business Logic & Derived Incidents Join)
 ↓
Repository (Database Queries & PostGIS ST_DWithin)
 ↓
Database (Supabase PostgreSQL / PostGIS)
```

---

## 7. Database & PostGIS Schema

### Entities:
1. **`hotspots`**:
   - `id`: `String` (PK)
   - `latitude`: `Float`
   - `longitude`: `Float`
   - `type`: `String` (`industrial_fire`, `gas_flare`, `agricultural`, `wildfire`, `unknown`)
   - `brightness`: `Float` (Kelvin)
   - `confidence`: `Float` (0–100%)
   - `severity`: `String` (`low`, `medium`, `high`, `critical`)
   - `timestamp`: `DateTime(tz=True)`
   - `facility_id`: `String` (FK -> `facilities.id`, nullable)
   - `status`: `String` (`active`, `resolved`, `monitoring`)
   - `city`, `district`, `state`, `country` (India-wide structural support)
   - `geometry`: `Geometry("POINT", srid=4326)` — Spatial order: `POINT(longitude latitude)`
   - **Indexes**: `type`, `severity`, `state`, `timestamp`, `facility_id`, GIST on `geometry`.

2. **`facilities`**:
   - `id`: `String` (PK)
   - `name`: `String`
   - `type`: `String` (`refinery`, `power_plant`, `steel_plant`, `cement_plant`, `lng_terminal`)
   - `latitude`: `Float`
   - `longitude`: `Float`
   - `city`, `district`, `state`, `country`
   - `geometry`: `Geometry("POINT", srid=4326)` — Spatial order: `POINT(longitude latitude)`
   - **Indexes**: `type`, `state`, `city`, GIST on `geometry`.

3. **`alerts`**:
   - `id`: `String` (PK)
   - `hotspot_id`: `String` (FK -> `hotspots.id`, nullable)
   - `facility_id`: `String` (FK -> `facilities.id`, nullable)
   - `severity`: `String` (`info`, `warning`, `critical`)
   - `title`: `String`
   - `message`: `String`
   - `timestamp`: `DateTime(tz=True)`
   - `acknowledged`: `Boolean`
   - **Indexes**: `severity`, `timestamp`, `hotspot_id`, `facility_id`.

4. **`incidents`**:
   - **Derived server-side** via outer join between `hotspots` and `facilities`. No separate database table needed.

---

## 8. API Contract & Endpoints (`/api/v1`)

| Endpoint | Method | Params | Description |
|---|---|---|---|
| `/api/v1/health` | GET | None | System & DB health status |
| `/api/v1/hotspots` | GET | `page`, `page_size`, `type`, `min_confidence`, `severity`, `state`, `city`, `start_date`, `end_date`, `near_lat`, `near_lng`, `radius_km` | List hotspots with optional PostGIS spatial radius filter |
| `/api/v1/hotspots/{id}` | GET | `hotspot_id` | Get single hotspot |
| `/api/v1/facilities` | GET | `page`, `page_size`, `type`, `state`, `city` | List facilities |
| `/api/v1/facilities/{id}` | GET | `facility_id` | Get single facility |
| `/api/v1/alerts` | GET | `page`, `page_size`, `severity`, `acknowledged` | List alerts |
| `/api/v1/alerts/{id}` | GET | `alert_id` | Get single alert |
| `/api/v1/incidents` | GET | `page`, `page_size`, `type`, `severity`, `min_confidence`, `state`, `start_date`, `end_date` | List derived incidents |
| `/api/v1/incidents/{id}` | GET | `incident_id` | Get single derived incident |

---

## 9. Current Validation Status
- **Backend pytest Suite**: `pytest tests/ -v` → **PASS** (15 test cases passing including PostGIS ST_DWithin spatial radius search).
- **TypeScript**: `npx tsc --noEmit` → **PASS** (0 errors).
- **Frontend Build**: `npm run build` → **PASS** (✓ 1739 modules transformed).
- **Runtime Stack**: Both FastAPI (`uvicorn`) and Vite (`npm run dev`) operational and integrated.

---

## 10. Rules for Future AI Coding Agents
1. **Read `context.md`** thoroughly before making modifications to the codebase.
2. **Maintain architectural boundary**: Route -> Schema -> Service -> Repository -> Database.
3. **DO NOT redesign the frozen frontend UI**.
4. **Preserve MapLibre GL + Thunderforest basemap architecture**.
5. **Preserve TanStack Query and Zustand boundaries**.
6. **Maintain strict TypeScript discipline** (`npx tsc --noEmit`).
7. **Never expose secrets or DB credentials**. Always use environment variables (`.env`).
8. **Keep database India-wide capable** (do not hardcode Gujarat-specific constraints into schema).
9. **FIRMS ingestion is idempotent** — calling `POST /api/v1/ingestion/firms` multiple times with the same data is safe; duplicates are skipped via `ON CONFLICT (id) DO NOTHING`.
10. **FIRMS_MAP_KEY is backend-only** — never expose it to the frontend or commit it to git.

---

## 11. Phase 5 — NASA FIRMS Integration

### Architecture
```
NASA FIRMS API (VIIRS_SNPP_NRT / MODIS_NRT)
    ↓
POST /api/v1/ingestion/firms
    ↓
FIRMSIngestionService
    ├── FIRMSClient.fetch_csv()       → raw CSV text
    ├── parse_firms_csv()              → List[Dict] (normalized)
    └── _upsert_batch()               → PostgreSQL ON CONFLICT DO NOTHING
    ↓
hotspots table (Supabase PostGIS)
    ↓
GET /api/v1/hotspots  (existing endpoint, unchanged)
    ↓
TanStack Query → React frontend (unchanged)
```

### Key Files
| File | Purpose |
|------|---------|
| `backend/app/integrations/firms/client.py` | Async HTTP client for NASA FIRMS CSV API |
| `backend/app/integrations/firms/schemas.py` | Pydantic schemas for VIIRS/MODIS CSV columns |
| `backend/app/integrations/firms/normalizer.py` | CSV → Hotspot dict normalizer |
| `backend/app/integrations/firms/service.py` | Ingest orchestrator with batch upsert |
| `backend/app/api/v1/ingestion.py` | `POST /api/v1/ingestion/firms` endpoint |
| `backend/tests/test_firms_normalizer.py` | 26 unit tests (pure Python, no DB) |

### ID Strategy
IDs are stable SHA-256 fingerprints of `(source, lat, lon, acq_date, acq_time)`:
```python
f"FIRMS-{sha256(key).hexdigest()[:16]}"
```
This makes re-ingestion idempotent — no duplicate rows ever created.

### Confidence Mapping
- **VIIRS**: `l` → 30%, `n` → 65%, `h` → 90%
- **MODIS**: Direct integer 0–100 (capped at 100)

### Severity Scoring
Composite score from brightness (K) and confidence (%):
```
score = brightness × 0.7 + confidence × 3.0
critical: score ≥ 493  |  high: ≥ 434  |  medium: ≥ 356  |  low: below
```

### Ingestion Endpoints
```
POST /api/v1/ingestion/firms
  Single-source ingestion (Phase 5 baseline)
  Query params:
    source    = VIIRS_SNPP_NRT (default) | VIIRS_NOAA20_NRT | VIIRS_NOAA21_NRT | MODIS_NRT
    bbox      = 68.0,6.0,98.0,38.0  (India default)
    days      = 1–10 (defaults to FIRMS_INGESTION_DAYS setting)
  Response:
    { "source": "...", "fetched": N, "inserted": N, "skipped": N, "errors": 0 }

POST /api/v1/ingestion/firms/all
  Multi-source ingestion with failure isolation (Phase 5D)
  Query params:
    bbox      = 68.0,6.0,98.0,38.0  (India default)
    days      = 1–10 (defaults to FIRMS_INGESTION_DAYS setting)
    sources   = comma-separated list (defaults to FIRMS_SOURCES setting)
  Response:
    {
      "sources_attempted": 3,
      "sources_succeeded": 3,
      "sources_failed":    0,
      "total_fetched":     845,
      "total_inserted":    819,
      "total_skipped":     26,
      "bbox":              "68.0,6.0,98.0,38.0",
      "days":              5,
      "per_source":        [...],
      "errors":            []
    }
```

---

## Phase 5D — Real India-Wide Data Coverage Enhancement

### Objective
Maximize real satellite coverage by enabling all three operational VIIRS NRT satellites and extending the temporal window to 5 days.

### Configuration
| Setting              | Default                                    | .env variable        |
|----------------------|--------------------------------------------|----------------------|
| Ingestion days       | 5                                          | `FIRMS_INGESTION_DAYS` |
| FIRMS sources        | VIIRS_SNPP_NRT,VIIRS_NOAA20_NRT,VIIRS_NOAA21_NRT | `FIRMS_SOURCES`  |
| India bbox           | 68.0,6.0,98.0,38.0                         | (hardcoded constant) |

### Enabled FIRMS Sources
All three operational VIIRS NRT satellites, verified against the live FIRMS API:

| Source           | Satellite   | Resolution | Status     |
|------------------|-------------|------------|------------|
| VIIRS_SNPP_NRT   | Suomi NPP   | ~375 m     | ✅ Enabled  |
| VIIRS_NOAA20_NRT | NOAA-20     | ~375 m     | ✅ Enabled  |
| VIIRS_NOAA21_NRT | NOAA-21     | ~375 m     | ✅ Enabled  |

### Multi-Source Architecture
```
NASA FIRMS (5-day window)
        │
   ┌────┴─────────────┐
   │         │        │
 SNPP    NOAA-20  NOAA-21
   │         │        │
   └────┬─────────────┘
        │  (failure isolation: one source failing does not block others)
        ↓
   normalizer
        ↓
   India boundary filter (is_inside_india)
        ↓
   SHA-256 deduplication (source-aware ID)
        ↓
   ON CONFLICT (id) DO NOTHING  (idempotent upsert)
        ↓
   Supabase / PostGIS
        ↓
   FastAPI GET /api/v1/hotspots (page_size up to 2000)
        ↓
   TanStack Query → MapLibre
```

### Deduplication Behavior
- **Same source + same observation** → same SHA-256 ID → one DB record (idempotent)
- **Different source + same location/time** → different SHA-256 ID → separate DB records (correct: two satellites can observe same fire)
- Fingerprint key: `"{source}|{lat:.4f}|{lon:.4f}|{acq_date}|{acq_time}"`

### Real Ingestion Coverage Metrics (Phase 5D)
Verified real ingestion run — August 2026, 5-day window, India bbox:

| Metric              | Value                                 |
|---------------------|---------------------------------------|
| Total fetched       | 845 (India-filtered from FIRMS API)   |
| Total inserted      | 819 (new observations)                |
| Total skipped       | 26 (already existed / deduped)        |
| VIIRS_SNPP_NRT      | 278 fetched, 252 inserted, 26 skipped |
| VIIRS_NOAA20_NRT    | 278 fetched, 278 inserted, 0 skipped  |
| VIIRS_NOAA21_NRT    | 289 fetched, 289 inserted, 0 skipped  |
| Latitude range      | 8.43°N – 36.83°N                      |
| Longitude range     | 68.58°E – 97.36°E                     |
| Total DB hotspots   | 899 (819 FIRMS real + 80 demo/seed)   |

### Geographic Distribution
Observations confirmed across multiple Indian states including:
- Gujarat (northwest)
- Tamil Nadu (south)
- Andhra Pradesh (east)
- Assam / Northeast region
- Ladakh / Himachal (north)
- Jharkhand / Chhattisgarh (central)

### Known Limitations
1. **Neighboring-country boundary**: The `is_inside_india()` filter in `normalizer.py` uses polygon approximations (not full GIS shapefiles) to exclude observations from Pakistan, Nepal, Bangladesh, Sri Lanka, and Myanmar. Minor edge cases near borders may be included or excluded incorrectly.
2. **No systematic state assignment**: The `state` column is NULL for FIRMS records. State-level attribution would require reverse geocoding or PostGIS intersection with India shapefile (Phase 6+ enhancement).
3. **No type classification**: All FIRMS records are stored with `type = 'unknown'`. Classification belongs to Phase 6 ML pipeline.
4. **Temporal gaps**: FIRMS may have 0 observations on specific days (bad passes, cloud cover, low detection). The day distribution varies by real satellite coverage.
5. **Observation coverage ≠ area coverage**: The bbox covers all of India, but observations represent real thermal detections — not a uniform grid. Dense zones (e.g., industrial corridors, current fire seasons) will show higher density naturally.

---

## 12. Problem Statement Alignment (Phase 5E)

### Official Problem Statement
**Title**: AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data

**Core Requirement**: Develop an AI-enabled geospatial system that can automatically identify, classify, and monitor industrial fires and persistent thermal sources by integrating thermal anomaly data, land-cover information, industrial infrastructure databases, and satellite imagery.

### What ThermalWatch Currently Implements
| Requirement | Status | Details |
|---|---|---|
| NASA FIRMS thermal data | ✅ Implemented | 3 VIIRS NRT satellites, India-wide, 7-day ingestion |
| GIS storage & visualization | ✅ Implemented | PostGIS + MapLibre map overlays |
| Industrial infrastructure DB | ✅ Partial | Facility schema exists, demo data only (Gujarat) |
| ML classification | ❌ Not started | Deferred to Phase 6 |
| Persistence detection | ❌ Not started | Architecture supports it (coordinates + timestamps) |
| OSM land-use features | ❌ Not started | Basemap uses OSM tiles for cartography only |
| Satellite imagery integration | ❌ Not started | FIRMS ≠ general satellite imagery |

### What is Intentionally Deferred to Phase 6
1. **ML Classification Pipeline** — XGBoost/Random Forest model training
2. **SHAP Explainability** — Feature importance visualization per observation
3. **Industrial vs Non-Industrial Decision** — Primary classification objective
4. **Persistence Detection** — Multi-pass temporal clustering
5. **OSM Land-Use Features** — Industrial/forest/urban context as ML features
6. **Training Data Curation** — Labeled dataset for supervised learning

### Industrial vs Non-Industrial Classification
The future ML system will produce:
```
classification: "Industrial Fire"
classification_group: "Industrial"
```
or:
```
classification: "Wildfire"
classification_group: "Non-Industrial"
```

The primary decision boundary is **Industrial vs Non-Industrial**, not a generic five-class fire classifier.

### Persistent Thermal Sources
The project title explicitly includes "Persistent Thermal Sources". The concept:
```
multiple observations → spatial clustering → temporal recurrence → persistence score → persistent thermal source
```

The current 7-day FIRMS dataset contains sufficient information:
- Coordinates (latitude, longitude)
- Acquisition timestamps
- Brightness (Kelvin)
- Confidence (0-100)
- Source/Satellite identification

Persistence detection is deferred to Phase 6.

### OSM Alignment
**Current**: ThermalWatch uses OpenFreeMap/OpenStreetMap-derived basemap tiles for **cartographic visualization** only.

**Future**: The Phase 6/7 pipeline may use OSM-derived features as ML inputs:
- Industrial land-use polygons
- Facility boundaries
- Road/transportation networks
- Built-up area density

Using an OSM basemap for map rendering is NOT the same as using OSM geospatial data as ML features.

### Satellite Imagery
NASA FIRMS provides **thermal anomaly detections** (point observations with brightness/FRP/confidence). This is NOT the same as general satellite imagery (multispectral raster data).

Future enrichment may include satellite imagery context where technically feasible, but FIRMS alone does not satisfy the "satellite imagery" integration requirement.

### What NASA FIRMS Provides
- Latitude/longitude of thermal anomaly
- Brightness temperature (Kelvin)
- Confidence level (low/nominal/high or 0-100)
- Fire Radiative Power (FRP) in megawatts
- Acquisition date/time
- Satellite/instrument identification
- Scan/track geometry

### What NASA FIRMS Does NOT Provide
- Classification of fire type (industrial vs natural)
- Ground truth verification
- Land-use context
- Facility association
- Persistence/recurrence analysis
- Fire boundary polygons
- Cause determination

### Scientific Limitations
1. A FIRMS thermal anomaly is NOT automatically a "fire" — it is a thermal detection
2. Raw FIRMS `type` column (when present) indicates general categories, not industrial classification
3. Proximity to a facility does NOT prove the facility caused the anomaly
4. FIRMS confidence measures detection reliability, not fire severity
5. "Near Real-Time" means hours of latency, not instantaneous ground truth

---

## 13. Geographic Scope

ThermalWatch is **India-wide**.

- Gujarat is NOT the default region
- No state is selected by default
- Real FIRMS observations from Gujarat are valid India-wide data
- All API endpoints default to `state = null` (all India)
- Map viewport defaults to center of India (78.96°E, 22.5°N)
- FIRMS ingestion bbox: `68.0,6.0,98.0,38.0` (all India)

---

## 14. Facility Data Status

- **Current Source**: Currently, there are **0 verified operational facilities** in the database.
- **Removed Data**: The 15 demo/seed facilities (which were exclusively located in Gujarat) have been entirely removed from the operational database to prevent geographical bias.
- **India-Wide Coverage**: Incomplete. The facility layer waits for a legitimate data integration (e.g. from official industrial databases or OSM).
- **Supported Types**: Refinery, Power Plant, Steel Plant, Cement Plant, LNG Terminal.
- **Spatial Relationship**: Proximity to a facility does NOT prove causation. It is merely contextual geographic data.
- **Provenance**: A `source` field has been added to the Facility schema to track the origin of future industrial records.

---

## 15. Phase 6 ML Input Contract

### Raw FIRMS Features (available now)
| Feature | Source | Type |
|---|---|---|
| latitude | FIRMS CSV | float |
| longitude | FIRMS CSV | float |
| brightness | FIRMS CSV (bright_ti4) | float (Kelvin) |
| FRP | FIRMS CSV (frp) | float (MW) — not yet stored in schema |
| confidence | FIRMS CSV | float (0-100) |
| acquisition_time | FIRMS CSV (acq_date + acq_time) | datetime |
| satellite | FIRMS CSV | string |
| instrument | FIRMS CSV | string |
| source | Ingestion parameter | string |

### Spatial Features (to be computed in Phase 6)
| Feature | Source | Type |
|---|---|---|
| distance_to_nearest_facility | PostGIS ST_Distance | float (km) |
| nearest_facility_type | Facility table | categorical |
| industrial_facility_density | PostGIS count within radius | integer |
| land_use_context | OSM data (future) | categorical |

### Temporal Features (to be computed in Phase 6)
| Feature | Source | Type |
|---|---|---|
| repeated_detections | Spatial+temporal clustering | integer |
| temporal_persistence | Multi-day observation count | float (days) |
| observation_frequency | Detections per day at location | float |

### Target Classes
| Classification | Group |
|---|---|
| Industrial Fire | Industrial |
| Gas Flare | Industrial |
| Mining / Persistent Thermal Source | Industrial |
| Agricultural Burning | Non-Industrial |
| Wildfire | Non-Industrial |
| Unknown | Unclassified |

### Primary Decision
**Industrial vs Non-Industrial**

> [!IMPORTANT]
> This is a design contract only. The model is NOT trained in Phase 5E.

---

## 15. Training Data Requirement

NASA FIRMS does NOT provide the required target labels for industrial/non-industrial categories.

Phase 6 must determine legitimate sources of training labels:

- Verified industrial facility databases with known thermal emissions
- Known gas flare datasets (e.g., VIIRS Nightfire, World Bank Global Gas Flaring)
- Curated historical fire events with verified classifications
- Agricultural burning calendars and crop residue burning patterns
- Expert-labeled thermal anomaly datasets

Raw FIRMS `type` column values (0, 2, 3) provide coarse categorization but are NOT ground truth for the industrial vs non-industrial distinction.

Fabricated/synthetic labels must NOT be used for training.

