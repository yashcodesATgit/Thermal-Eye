# ThermalEye
**AI-Powered Geospatial Thermal Intelligence**

ThermalEye is a full-stack platform for detecting, classifying, analyzing, and monitoring industrial thermal anomalies across India using satellite data, machine learning (XGBoost), and AI intelligence (Google Gemini).

---

## 🏗️ Stack Overview

- **Frontend**: React 18, Vite, TypeScript, MapLibre GL JS (served via Nginx on port 5173)
- **Backend**: FastAPI, Python 3.14 / 3.12, SQLAlchemy Async, Uvicorn (port 8000)
- **Database**: Supabase PostgreSQL + PostGIS (remote hosted single source of truth)
- **Infrastructure**: Redis 7 (rate limiting, AI quotas, analytics cache, FIRMS distributed lock)
- **Machine Learning**: Frozen XGBoost v1 1M v2 model (`xgboost_v1_1m_v2.joblib`)
- **AI Intelligence**: Google Gemini provider with read-only database tools

---

## 🚀 Running ThermalEye Locally (Non-Docker Development)

### 1. Prerequisites
- Python 3.11+ / 3.14
- Node.js 18+
- Redis Server (`redis-server` running on `localhost:6379`)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Configure DATABASE_URL, OPENROUTER_API_KEY, FIRMS_MAP_KEY
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Running ThermalEye with Docker Compose

### 1. Configure Environment
Create a root `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Fill in your `DATABASE_URL`, `OPENROUTER_API_KEY`, and `FIRMS_MAP_KEY`.

### 2. Build & Launch Containers
```bash
docker compose build
docker compose up -d
```

### 3. Service Endpoints
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🧪 Testing & Verification

### Backend Pytest Suite
```bash
cd backend
source venv/bin/activate
pytest tests/
```

### Frontend TypeScript & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```
