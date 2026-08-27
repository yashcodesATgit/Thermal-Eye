# ThermalWatch — Project Context

## 1. Project Overview
ThermalWatch is an AI-enabled geospatial intelligence platform for **detecting, classifying, analyzing, and monitoring industrial fires and persistent thermal sources** across India using NASA FIRMS satellite data, machine learning (XGBoost), industrial facility databases, and Google Gemini AI intelligence.

The platform ingests near-real-time thermal anomaly observations from NASA FIRMS VIIRS/MODIS instruments, stores them in a PostGIS-enabled PostgreSQL database, classifies thermal events via machine learning, and visualizes them as interactive map overlays alongside known industrial facilities.

- **Current Status**:
  - **Frontend**: React 18, Vite, TypeScript, MapLibre GL JS, TanStack Query, Zustand, Lucide React (served via Nginx Alpine on port 5173).
  - **Backend**: FastAPI (Python 3.12 / 3.14), SQLAlchemy Async, asyncpg, GeoAlchemy2, Uvicorn (port 8000), connected to Supabase PostgreSQL + PostGIS.
  - **Machine Learning**: **COMPLETED & INTEGRATED**. Production model `xgboost-v1-1m-v2` (`xgboost_v1_1m_v2.joblib`) with 10 features, local SHAP feature explanations, confidence abstention threshold ($<0.45 \to \text{unknown}$), and $93.70\%$ offline synthetic engineering benchmark accuracy.
  - **AI Intelligence**: **COMPLETED & INTEGRATED**. Google Gemini 3.6 Flash provider with read-only backend tools (`get_hotspots`, `get_hotspot_details`, `get_alerts`, `get_facilities`, `get_analytics_summary`, `get_historical_trends`), prompt injection protection, guest 5-hotspot exploration UI gate, and structured UI map actions (`focus_hotspot`, `apply_filter`).
  - **Redis Infrastructure**: **COMPLETED & INTEGRATED**. Connection pooling (`redis.asyncio`), atomic API rate limiting, user/guest AI quota enforcement, canonical response caching for analytics (300s TTL), and distributed locking (`thermalwatch:lock:firms_sync` with 600s TTL).
  - **Docker Containerization**: **COMPLETED**. Multi-stage `frontend/Dockerfile` (Node 20 build -> Nginx 1.25 Alpine runtime), production `backend/Dockerfile` (Python 3.12, uvicorn, non-root user `thermalwatch`, XGBoost OpenMP support), `docker-compose.yml` orchestrating `frontend`, `backend`, and `redis` on `thermalwatch-network`, `.dockerignore`, `.env.example`, and full secret safety audit.
  - **Validation & Test Suite**: **63/63 PASS** on pytest backend suite across 16 test files, **0 TypeScript errors** (`npx tsc --noEmit`), Vite production build PASS (`npm run build`), $18.286\text{ ms}$ average single observation ML inference latency.

---

## 2. Current Project Status & Completed Phases
- **Phases Completed**:
  - Phase 0: Initial Setup & Environment Configuration
  - Phase 1 & 1B: UI Shell & Visual Audit
  - Phase 2: MapLibre GL JS & Thunderforest Basemap Integration
  - Phase 3, 3B, 3C, 3D: Intelligence Layer, Filtering & Documentation
  - Phase 4 & 4B: Backend Foundation & Supabase PostGIS Integration
  - Phase 5, 5D, 5E, 5F: NASA FIRMS Real Satellite Data Multi-Source Ingestion
  - **Phase 6: Machine Learning Classification Pipeline (`xgboost-v1-1m-v2`)**
  - **Phase 7: AI Intelligence Assistant & Read-Only Tool Architecture (Gemini 3.6 Flash)**
  - **Phase 8: Redis Infrastructure (Rate Limiting, AI Quotas, Analytics Cache, FIRMS Lock)**
  - **Phase 9: Docker Containerization & Docker Compose Deployment**
  - **Phase 10: Final ML + AI Deep Empirical Validation & Red-Teaming** ← COMPLETED

---

## 3. Product Goal & Taxonomy
ThermalWatch exists to **detect and classify industrial fires and persistent thermal sources, while distinguishing them from natural and agricultural thermal anomalies** (wildfires, agricultural burning, gas flares, mining activity).

### Classification Taxonomy
```
Industrial Thermal Activity (Primary Focus)
    ├── Industrial Fire
    ├── Gas Flare
    └── Mining / Persistent Thermal Source
        vs.
Non-Industrial / Natural Thermal Activity
    ├── Wildfire
    ├── Agricultural Burning
    └── Unknown (Abstained when ml_confidence < 0.45)
```

---

## 4. Technology Stack

### Frontend
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Core Framework | React | `18.3.1` | Declarative UI component structure |
| Build Tool | Vite | `5.4.11` | Fast dev server & production bundler |
| Type System | TypeScript | `5.7.2` | Compile-time strict type checking |
| Styling | Tailwind CSS | `3.4.16` | Utility-first CSS styling |
| Map Renderer | MapLibre GL | `4.7.1` | WebGL geospatial map rendering engine |
| React Map Wrapper | react-map-gl/maplibre | `7.1.9` | Declarative React wrapper for MapLibre |
| Server/Query State | TanStack React Query | `5.62.0` | Asynchronous state management & caching |
| Client State | Zustand | `^5.0.15` | Global UI client state management |
| Web Server (Docker)| Nginx Alpine | `1.25` | Production static asset web server |

### Backend & Infrastructure
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Web Framework | FastAPI | `0.115.6` | High-performance async REST API framework |
| ASGI Server | Uvicorn | `0.34.0` | Production ASGI web server |
| ORM | SQLAlchemy (asyncio) | `2.0.36` | Asynchronous ORM database client |
| Database Driver | asyncpg | `0.30.0` | PostgreSQL async driver |
| GIS Extension | GeoAlchemy2 | `0.15.2` | Spatial PostGIS types & queries |
| ML Model | XGBoost | `2.1.3` | Production gradient boosted decision trees |
| Model Serializer | Joblib | `1.4.2` | Model artifact persistence (`xgboost_v1_1m_v2.joblib`) |
| Infrastructure | Redis | `7.4` / `8.1` | Rate limiting, AI quotas, cache, distributed locks |
| Redis Client | redis-py (asyncio) | `^5.0.0` | Centralized async Redis connection pool |
| AI Provider | Google Gemini | `3.6-flash` | LLM Intelligence Assistant with read-only tools |
| Database Cloud | Supabase PostgreSQL | PostGIS 3.x | Authoritative persistent database |

---

## 5. Architecture & Data Flow

```
                           Docker Compose (thermalwatch-network)
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │                               │                               │
             ▼                               ▼                               ▼
       React Frontend                FastAPI Backend                 Redis Container
      (Nginx:alpine 5173)           (Python 3.12 / 8000)            (Redis:7-alpine 6379)
             │                               │                               │
             │                      ┌────────┴────────┐                      │
             │                      ▼                 ▼                      │
             │              Supabase Postgres     Gemini API                 │
             │             + PostGIS Database    (Backend Only)              │
             │                                                               │
             └────────────────── HTTP REST API Calls ────────────────────────┘
```

### Request Lifecycle & Control Flow
```
User Request
 ↓
FastAPI Backend (/api/v1)
 ↓
Redis Rate Limit & AI Quota Check (thermalwatch:ratelimit & thermalwatch:quota)
 ├── Exceeded → HTTP 429 Too Many Requests
 └── Allowed
       ↓
     Route Handler & Pydantic Schema Validation
       ↓
     Analytics Cache Check (thermalwatch:cache:analytics)
       ├── Hit  → Return Cached JSON Payload
       └── Miss → Service & Repository (PostGIS Queries)
                     ↓
                   XGBoost Inference (xgboost-v1-1m-v2) & SHAP Explanations
                     ↓
                   Set Redis Cache (300s TTL) & Return Response
```

---

## 6. Machine Learning Pipeline (`xgboost-v1-1m-v2`)

### Feature Architecture (10 Normalized Input Features)
1. `bright_ti4`: VIIRS I4 / TI4 Brightness Temperature (Kelvin)
2. `bright_ti5`: VIIRS I5 / TI5 Brightness Temperature (Kelvin)
3. `brightness_ratio`: `bright_ti4 / max(bright_ti5, 1.0)`
4. `temp_diff`: `bright_ti4 - bright_ti5`
5. `frp`: Fire Radiative Power (MW)
6. `frp_density`: `frp / (confidence + 1.0)`
7. `confidence_norm`: Normalized confidence level ($0.0$ to $1.0$)
8. `is_day`: Day/Night flag ($1.0$ for day, $0.0$ for night)
9. `facility_dist_km`: Distance to nearest industrial facility (km)
10. `persistence_count`: Multi-day spatial observation recurrence count

### Abstention & Confidence Rules
- `max_probability < 0.45` $\to$ `ml_type = "unknown"` (Abstains on low-confidence predictions).
- `max_probability >= 0.45` $\to$ `ml_type` assigned to predicted class (`industrial_fire`, `gas_flare`, `agricultural`, `wildfire`).

### Benchmarks & Scientific Safeguards
- **Offline Synthetic Engineering Benchmark**: **93.70% Accuracy** ($0.9142$ Industrial Fire F1, $0.9080$ Macro F1) on dataset `thermalwatch-ml-1m-v2`.
- **Scientific Disclosure**: Real-world ground-truth accuracy was NOT established due to lack of ground-truth field audit data in India. Facility proximity is contextual evidence, not proof of causation.

---

## 7. Redis Infrastructure & Key Namespaces

| Purpose | Namespace Pattern | Expiration / Policy |
|---|---|---|
| Rate Limiting | `thermalwatch:ratelimit:user:{user_id}:{endpoint}` & `guest:{ip}:{endpoint}` | Window TTL (60s) |
| AI Quota | `thermalwatch:quota:ai:user:{user_id}` & `guest:{ip}` | Atomic INCR + 3600s TTL |
| Analytics Cache | `thermalwatch:cache:analytics:{canonical_params_hash}` | 300s TTL (Invalidated on FIRMS sync) |
| Distributed Lock | `thermalwatch:lock:firms_sync` | 600s TTL (Safe Lua release) |

---

## 8. AI Intelligence Assistant & Tools

The AI assistant operates via `POST /api/v1/chat` using Google Gemini 3.6 Flash and a set of read-only database tools:
- `get_hotspots`: Query live satellite hotspots with spatial/classification/severity filters.
- `get_hotspot_details`: Retrieve full telemetry, prediction, SHAP explanation, and facility proximity for a hotspot.
- `get_alerts`: Retrieve active and historical alerts.
- `get_facilities`: Query industrial facilities by state, type, or search term.
- `get_analytics_summary`: Aggregate top-level observations, industrial percentages, and anomalies.
- `get_historical_trends`: Time-series trend comparison across weekly/daily periods.

### Security Safeguards
- **Arbitrary SQL**: BLOCKED.
- **Database Writes**: BLOCKED.
- **Code Execution**: BLOCKED.
- **Prompt Injection**: Protected via system prompt and tool allowlisting.
- **Guest Gate**: Guests exploring $>5$ hotspots are prompted with a Login/Signup gate before triggering Gemini.

---

## 9. Verification & Audit Results

- **Backend Pytest Suite**: **63 / 63 PASS** across 16 test files (`pytest tests/`).
- **Frontend TypeScript**: **0 Errors** (`npx tsc --noEmit`).
- **Production Build**: **PASS** (`npm run build` in 7.04s).
- **ML Single Inference Latency**: $18.286\text{ ms}$ average.
- **Redis Cache Hit Latency**: $0.346\text{ ms}$.
- **Secret Safety Audit**: **PASS** (Zero backend keys exposed in compiled frontend JS bundle).

---

## 10. Rules for Future AI Coding Agents

1. **Preserve Database Source of Truth**: PostgreSQL/PostGIS on Supabase remains the authoritative database. Never use Redis as a persistent store for domain objects.
2. **Obey Architectural Boundaries**: Route $\to$ Schema $\to$ Service $\to$ Repository $\to$ Database.
3. **Respect Scientific Safeguards**: Never describe the $93.70\%$ synthetic benchmark as real-world accuracy. Never claim facility proximity proves causation.
4. **Preserve Redis Failover Behavior**: If Redis is down, cache misses bypass to PostgreSQL and rate limits use conservative fallbacks without application crashes.
5. **Keep Frontend Free of Secrets**: `GEMINI_API_KEY`, `FIRMS_MAP_KEY`, `DATABASE_URL`, and `REDIS_URL` must remain strictly backend-only.
6. **Maintain Docker Cleanliness**: Keep production Dockerfiles multi-stage and non-root.
