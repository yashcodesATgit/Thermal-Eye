# ThermalWatch — Project Context

## 1. Project Overview
ThermalWatch is a specialized geospatial thermal intelligence platform engineered to monitor, visualize, and classify thermal anomalies (industrial fires, gas flares, agricultural burns, wildfires, and unknown heat sources) across critical regional assets and industrial corridors.

The platform combines high-resolution geographic basemaps with thermal anomaly observations, facility proximity metrics, historical tracking, and interactive operational dashboards.

**Important Note**: Through Phase 3C, the frontend application is **fully built and frozen**. All thermal anomaly observations, facility records, and system alerts are currently backed by deterministic **DEMO/MOCK data services**. No live backend server or live satellite feed is connected yet.

---

## 2. Current Project Status
- **Phases Completed**: Phase 0 (Setup), Phase 1 (UI Shell), Phase 1B (Audit), Phase 2 (MapLibre + Thunderforest), Phase 3 (Intelligence Layer & Filtering), Phase 3B (Visual Alignment), Phase 3C (Full Frontend Audit & Optimization), Phase 3D (Context Documentation).
- **Frontend Status**: **FROZEN**. Visual layout, map layers, user interactions, routing, client state management, and type definitions are locked and validated.
- **Backend Status**: **NOT IMPLEMENTED YET**. Phase 4 will establish the FastAPI backend foundation.

---

## 3. Product Goal
The ultimate goal of ThermalWatch is to provide near-real-time satellite-driven thermal monitoring and predictive intelligence for industrial assets, environmental safety teams, and emergency responders.

The system will ingest thermal observation telemetry (e.g., NASA FIRMS MODIS/VIIRS), process and classify heat sources via machine learning (XGBoost/SHAP), compute severity/confidence scores, evaluate proximity to industrial facilities (refineries, power plants, LNG terminals), and dispatch actionable alerts through a mission-control web interface.

---

## 4. Core Concept
ThermalWatch operates on three distinct conceptual layers:

1. **GEOGRAPHIC BASEMAP (Thunderforest)**: Provides cartographic context (cities, roads, coastlines, terrain, transportation networks). Thunderforest provides background geographic rendering; it does *not* detect fires or provide thermal data.
2. **THERMAL OBSERVATIONS (Future Satellite / FIRMS Pipeline)**: Ingests raw thermal coordinates, brightness measurements (Kelvin), detection confidence, and acquisition timestamps.
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

## 5. Current Technology Stack

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
| Utilities | date-fns, axios | `4.1.0`, `1.7.9` | Date formatting & HTTP client (ready for Phase 4) |

---

## 6. Frontend Architecture
The application is structured around a **full-bleed map surface with floating UI overlays**.

- The `MapLibre` map component dominates the entire viewport (`100vw` × `100vh`).
- Navigation bar (`Navbar`) stays fixed at the top (`height: 56px`, `zIndex: 30`).
- Floating overlay panels float over the map with fixed pixel positioning and high z-index values (`zIndex: 20`):
  - **Legend**: Top-left (`top: 16px`, `left: 16px`, width: `168px`, max-height: `calc(100vh - 230px)`).
  - **MapControls**: Bottom-left corner (`bottom: 16px`, `left: 16px`).
  - **Basemap Selector Dropdown**: Top-right corner (`top: 16px`, `right: 16px`).
  - **Alert Feed Button & Popover**: Top-right corner (`top: 16px`, `right: 176px`).
  - **Timeline**: Bottom-center attached flush to screen bottom (`bottom: 0px`, `left: 50%`, `transform: translateX(-50%)`, height: `52px`).
  - **RightPanel**: Floating right intelligence drawer (`top: 8px`, `right: 8px`, `bottom: 8px`, width: `340px`). Closed by default upon initial app startup.

---

## 7. Folder Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── AlertFeed.tsx          # Floating alert notification button & popover list
│   │   ├── IncidentTable.tsx       # Searchable, filterable, sortable incident table
│   │   ├── Legend.tsx              # Map legend (types, facilities, heatmap, min confidence)
│   │   ├── Map.tsx                 # Core MapLibre GL map, sources, layers, basemap selector
│   │   ├── MapControls.tsx         # Zoom (+/-) and locate map control buttons
│   │   ├── Navbar.tsx              # Top navigation header & date selector popover
│   │   ├── RightPanel.tsx          # Intelligence drawer (hotspot & facility telemetry)
│   │   └── Timeline.tsx            # Bottom date timeline node track (-6D to TODAY)
│   ├── config/
│   │   └── mapStyles.ts            # Centralized Thunderforest basemap configuration
│   ├── data/
│   │   ├── mock_alerts.json        # Demo alert feed records
│   │   ├── mock_facilities.json    # Demo industrial facility records (Gujarat)
│   │   └── mock_hotspots.json      # Demo thermal anomaly records (Gujarat)
│   ├── lib/
│   │   └── queryClient.ts          # TanStack Query client configuration
│   ├── pages/
│   │   ├── AnalyticsPage.tsx       # Placeholder page: Analytics (COMING IN NEXT PHASE)
│   │   ├── FacilitiesPage.tsx      # Placeholder page: Facilities (COMING IN NEXT PHASE)
│   │   ├── IncidentsPage.tsx       # Incidents log page with search, filters, CSV export
│   │   ├── MapPage.tsx             # Main Live Map layout view
│   │   └── ReportsPage.tsx         # Placeholder page: Reports (COMING IN NEXT PHASE)
│   ├── services/
│   │   ├── alertService.ts         # Async alert data service
│   │   ├── facilityService.ts      # Async facility data service
│   │   ├── hotspotService.ts       # Async hotspot data service
│   │   └── queries/
│   │       ├── useAlertsQuery.ts     # TanStack Query hook for alerts
│   │       ├── useFacilitiesQuery.ts # TanStack Query hook for facilities
│   │       └── useHotspotsQuery.ts   # TanStack Query hook for hotspots
│   ├── store/
│   │   └── mapStore.ts             # Global Zustand client UI state
│   ├── styles/
│   │   └── globals.css             # Tailwind base & dark scrollbar styling
│   ├── types/
│   │   ├── alert.ts                # Alert interfaces & severity types
│   │   ├── facility.ts             # Facility interfaces & labels
│   │   ├── hotspot.ts              # Hotspot interfaces, labels, color mappings
│   │   ├── incident.ts             # Derived Incident interface
│   │   └── map.ts                  # Map viewport constants & specs
│   └── utils/
│       ├── exportCsv.ts            # CSV export utility for incidents
│       ├── geo.ts                  # Haversine distance formula calculation
│       ├── geojson.ts              # GeoJSON conversion & client-side filtering
│       └── incidents.ts            # Conversion from hotspots to derived incidents
│   ├── App.tsx                     # Main App component with React Router routes
│   └── main.tsx                    # Application entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 8. Routing
Client-side routing is handled by `react-router-dom`:

- `/` → `MapPage` (Main Live Map view with floating overlays).
- `/incidents` → `IncidentsPage` (Detailed incident table with filtering, search, sorting, and CSV export).
- `/facilities` → `FacilitiesPage` (Structured ThermalWatch placeholder page).
- `/analytics` → `AnalyticsPage` (Structured ThermalWatch placeholder page).
- `/reports` → `ReportsPage` (Structured ThermalWatch placeholder page).

All 5 routes are active, fully styled, and highlight their respective tab in the `Navbar`.

---

## 9. UI Architecture
The UI follows a strict **Mission Control / Dark Geospatial Intelligence** aesthetic.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              NAVBAR                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ [LEGEND]                                    [ALERT] [BASEMAP SELECTOR]  │
│                                                                         │
│                               FULL-BLEED                                │
│                             GEOGRAPHIC MAP                              │
│                                                                         │
│                                                                         │
│ [MAP CONTROLS]                                           [RIGHT PANEL]  │
│                                                                         │
│                      ┌─────── TIMELINE ───────┐                         │
│                      └────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Top Navbar**: Height 56px, background `#0D1117`, border-bottom `#1E293B`.
- **Background**: Application body background is `#080C14`.
- **Panels**: Solid `#111827` dark charcoal, border `#1E293B`, border-radius `8px` - `12px`, shadow `0 8px 32px rgba(0,0,0,0.8)`. No backdrop blur or semi-transparent background bleed.

---

## 10. Map Architecture
Rendered using `react-map-gl/maplibre` and `MapLibre GL`.

- **Initial Viewport**: Center `[71.5, 22.5]` (Gujarat, India), Zoom level `7.2`.
- **Sources & Layers**:
  - `thunderforest-basemap`: Raster tile source loading map tiles dynamically.
  - `hotspots-heat`: Heatmap layer rendering density gradients.
  - `hotspots-points`: Circle point layer rendering individual hotspot dots.
  - `hotspot-points-glow`: Subtle radial glow behind hotspot dots.
  - `facilities-points`: Blue circle point layer for industrial facilities.
  - `selected-hotspot`: Highlight glow & ring layer for active selected hotspot.
  - `selected-facility`: Highlight glow & ring layer for active selected facility.

---

## 11. Thunderforest Usage
- **Role**: Geographic basemap provider (raster tiles).
- **Environment Variable**: `VITE_THUNDERFOREST_API_KEY`.
- **Tile Pattern**: `https://api.thunderforest.com/{styleId}/{z}/{x}/{y}.png?apikey={API_KEY}`
- **Configured Styles** (`src/config/mapStyles.ts`):
  1. `cycle`: "Cycle Map" (Cycling & detailed geographic context) - **Default**
  2. `atlas`: "Atlas" (Clean & minimal)
  3. `transport`: "Transport" (Roads & transportation)
  4. `transport-dark`: "Transport Dark" (Dark transportation map)
  5. `landscape`: "Landscape" (Terrain & natural features)
- **Style Switching**: Changing basemap updates `mapStyle` in Zustand, which updates MapLibre's raster tile source while preserving center, zoom, bearing, pitch, heatmap, hotspots, facilities, selection, and filter states.

---

## 12. Thermal Visualization
Thermal anomalies are visualized via two complementary layers:

1. **Thermal Heatmap Layer** (`hotspot-heatmap`):
   - Represents thermal concentration and density.
   - `heatmap-weight`: Interpolated based on `heatWeight` property (`0.7 * normalizedBrightness + 0.3 * confidence`).
   - `heatmap-intensity`: Interpolated by zoom (`zoom 4: 0.6` → `zoom 14: 5.5`).
   - `heatmap-radius`: Interpolated by zoom (`zoom 4: 16px` → `zoom 14: 38px`).
   - `heatmap-color` spectrum:
     - `0.04`: `rgba(255,235,59,0.25)` (Transparent yellow fringe)
     - `0.18`: `#FFC107` (Bright Amber / Yellow)
     - `0.38`: `#FF9800` (Warm Orange)
     - `0.58`: `#F4511E` (Red-Orange)
     - `0.78`: `#E53935` (Vibrant Red)
     - `1.00`: `#B71C1C` (Deep Dark Red Core)
2. **Individual Hotspot Point Layer** (`hotspot-points`):
   - Represents distinct satellite detection locations.
   - Styled by category color with black stroke.

---

## 13. Hotspot Architecture
- **Categories & Colors**:
  - `industrial_fire`: Red (`#FF4444`)
  - `gas_flare`: Orange (`#FF8C00`)
  - `agricultural`: Yellow (`#F5C518`)
  - `wildfire`: Green (`#3DB86B`)
  - `unknown`: Muted Gray (`#4A5568`)
- **TypeScript Interface** (`src/types/hotspot.ts`):
  ```typescript
  export type HotspotType = 'industrial_fire' | 'gas_flare' | 'agricultural' | 'wildfire' | 'unknown';
  export type Severity = 'critical' | 'high' | 'medium' | 'low';

  export interface Hotspot {
    id: string;
    latitude: number;
    longitude: number;
    type: HotspotType;
    brightness: number; // Kelvin (e.g. 240 - 360)
    confidence: number; // 0 - 100%
    severity: Severity;
    timestamp: string;  // ISO string
    facilityId: string | null;
    status: 'active' | 'monitoring' | 'resolved';
  }
  ```

---

## 14. Facility Architecture
- **Facility Categories**: `refinery`, `power_plant`, `steel_plant`, `cement_plant`, `lng_terminal`.
- **TypeScript Interface** (`src/types/facility.ts`):
  ```typescript
  export type FacilityType = 'refinery' | 'power_plant' | 'steel_plant' | 'cement_plant' | 'lng_terminal';

  export interface Facility {
    id: string;
    name: string;
    type: FacilityType;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }
  ```
- Facilities are rendered on the map as blue point markers (`#2D7DD2`). Selecting a facility displays its metadata and nearby associated detections in `RightPanel`.

---

## 15. Alert Architecture
- **TypeScript Interface** (`src/types/alert.ts`):
  ```typescript
  export type AlertSeverity = 'critical' | 'warning' | 'info';

  export interface Alert {
    id: string;
    title: string;
    message: string;
    severity: AlertSeverity;
    timestamp: string;
    hotspotId?: string;
    facilityId?: string;
    acknowledged: boolean;
  }
  ```
- **Alert Interaction**: Selecting an alert item in the top-right `AlertFeed` popover opens `RightPanel` for the target hotspot/facility and triggers map `flyTo`.
- **Status**: Currently populated with mock alert records (`mock_alerts.json`). Phase 7+ will connect this service to a real-time backend alert pipeline.

---

## 16. Incident Architecture
- **Overview**: Incidents are derived objects constructed from thermal hotspots and correlated facility data (`src/utils/incidents.ts`).
- **TypeScript Interface** (`src/types/incident.ts`):
  ```typescript
  export interface Incident {
    id: string;
    hotspotId: string;
    facilityId: string | null;
    facilityName: string | null;
    type: HotspotType;
    severity: Severity;
    brightness: number;
    confidence: number;
    latitude: number;
    longitude: number;
    timestamp: string;
    status: 'active' | 'monitoring' | 'resolved';
  }
  ```
- Rendered in the `/incidents` page inside `IncidentTable`. Features live text search, category filtering, severity filtering, column sorting, CSV export, and map navigation.

---

## 17. TanStack Query Architecture
TanStack Query manages all server-like data fetching and caching.

- **Query Keys**:
  - `['hotspots']` → `useHotspotsQuery()` → `fetchHotspots()`
  - `['facilities']` → `useFacilitiesQuery()` → `fetchFacilities()`
  - `['alerts']` → `useAlertsQuery()` → `fetchAlerts()`
- **Query Client Defaults** (`src/lib/queryClient.ts`):
  - `staleTime`: 5 minutes (`5 * 60 * 1000`)
  - `gcTime`: 10 minutes (`10 * 60 * 1000`)
  - `refetchOnWindowFocus`: `false`
  - `refetchOnMount`: `false`

When replacing mock data with FastAPI endpoints in Phase 4+, **only the service functions (`fetchHotspots`, etc.) need to be updated to call `axios`**. All components and query hooks remain unchanged.

---

## 18. Zustand Architecture
Zustand manages client-side UI and interaction state (`src/store/mapStore.ts`).

- **State Schema**:
  ```typescript
  interface MapStoreState {
    selectedHotspotId: string | null;
    selectedFacilityId: string | null;
    activeHotspotTypes: HotspotType[];
    minimumConfidence: number;
    selectedDate: string; // ISO YYYY-MM-DD
    showHeatmap: boolean;
    showFacilities: boolean;
    rightPanelOpen: boolean; // default: false
    mapStyle: MapStyleId;    // default: 'cycle'
    // Actions
    selectHotspot: (id: string | null) => void;
    selectFacility: (id: string | null) => void;
    setSelectedDate: (date: string) => void;
    setHotspotTypes: (types: HotspotType[]) => void;
    toggleHotspotType: (type: HotspotType) => void;
    setMinimumConfidence: (confidence: number) => void;
    setShowHeatmap: (show: boolean) => void;
    setShowFacilities: (show: boolean) => void;
    setRightPanelOpen: (open: boolean) => void;
    setMapStyle: (style: MapStyleId) => void;
  }
  ```

**Strict Rule**: Server datasets (`hotspots`, `facilities`, `alerts`) are **NEVER** stored or duplicated inside Zustand.

---

## 19. Data Flow

### Current Architecture (Phase 3D):
```
+------------------------+
|   Mock Data JSONs      |
+------------------------+
            |
            v
+------------------------+
|   Service Functions    | (fetchHotspots / fetchFacilities / fetchAlerts)
+------------------------+
            |
            v
+------------------------+
|   TanStack Query       | (Server data cache)
+------------------------+
            |
            +---------------------------+
            |                           |
            v                           v
+------------------------+  +------------------------+
|  Pure Filter Utils     |  |   Zustand UI Store     |
| (filterHotspots, etc.) |  | (Selection/Date/Style) |
+------------------------+  +------------------------+
            |                           |
            +─────────────┬─────────────+
                          |
                          v
            +------------------------+
            |  GeoJSON & MapLibre    |
            |  Interactive Renderer  |
            +------------------------+
```

---

## 20. Current Mock Data
- **Location**: `src/data/`
  - `mock_hotspots.json`: 40 thermal anomaly records located in Gujarat (Jamnagar, Ahmedabad, Vadodara, Surat, Dahej, Kutch, Bhavnagar). Includes brightness (245K–350K), confidence (48%–95%), type, and timestamp.
  - `mock_facilities.json`: 10 major industrial facility records across Gujarat (Reliance Jamnagar Refinery, Adani Mundra Power Plant, AM/NS Hazira Steel Plant, Gujarat Cement Works, Petronet Dahej LNG Terminal, etc.).
  - `mock_alerts.json`: 6 alert notification items with critical/warning/info severities linked to specific hotspots or facilities.

---

## 21. Type System
- TypeScript strict mode (`"strict": true`) is enforced across the entire codebase.
- No `any`, `@ts-ignore`, or `@ts-nocheck` exist.
- Primary type modules:
  - `src/types/hotspot.ts`
  - `src/types/facility.ts`
  - `src/types/alert.ts`
  - `src/types/incident.ts`
  - `src/types/map.ts`
  - `src/config/mapStyles.ts`

---

## 22. State Management Rules
1. **Server Data** belongs exclusively to **TanStack Query**.
2. **UI Client State** (selections, toggles, active date, filter parameters, active basemap) belongs exclusively to **Zustand**.
3. **No Duplication**: Never copy arrays from TanStack Query into Zustand stores.
4. **Pure Filtering**: Filtering functions (`filterHotspots`) must remain pure and return newly derived arrays without mutating input parameters.

---

## 23. Geographic / GeoJSON Rules
1. **Coordinate Format**: All GeoJSON geometries **MUST** use standard `[longitude, latitude]` array ordering.
2. **Map Center & Bounding**: Default map center uses `[longitude, latitude]` format: `[71.5, 22.5]`.
3. **No Heavy DOM Markers**: All map elements (hotspots, heatmap, facilities, selected highlights) must be rendered via MapLibre GL WebGL sources and layers.

---

## 24. Environment Variables
- `VITE_THUNDERFOREST_API_KEY`: Stored in `.env` at project root (`frontend/.env`).
- Accessed in code via `import.meta.env.VITE_THUNDERFOREST_API_KEY`.
- Never hardcoded in source code or committed to git.

---

## 25. Current User Interactions
- **Map Selection**: Clicking a hotspot point or facility point opens `RightPanel` with detailed telemetry and highlights the feature on map.
- **Basemap Selection**: Changing basemap from top-right dropdown instantly switches cartographic tile layer without resetting map position or overlays.
- **Date Timeline**: Clicking a node on the bottom timeline filters visible map hotspots to detections recorded on or before that date.
- **Navbar Date Selector**: Clicking the navbar date button opens a popover to select global monitoring dates.
- **Alert Feed**: Clicking the bell button in the top-right opens alert notifications. Clicking an alert flies the map to the target location and opens `RightPanel`.
- **Incidents Page**: Full text search, filter by hotspot type, filter by severity, click-to-sort columns, CSV export, and click row to view on map.

---

## 26. Current Routes
- `/` (Live Map)
- `/incidents` (Incident Management Log)
- `/facilities` (Facilities Placeholder)
- `/analytics` (Analytics Placeholder)
- `/reports` (Reports Placeholder)

---

## 27. Current UI Design Rules
- Dark mission-control aesthetic (`#080C14` background, `#111827` panels, `#1E293B` borders).
- Blue accent (`#2D7DD2`) for active selections and UI focus.
- Thermal color coding:
  - Industrial Fire / Critical / High Heat: Red (`#FF4444` / `#DC2626`)
  - Gas Flare / High Heat: Orange (`#FF8C00` / `#F97316`)
  - Agricultural / Medium Heat: Yellow (`#F5C518` / `#FFC107`)
  - Wildfire: Green (`#3DB86B`)
  - Unknown: Muted Gray (`#4A5568`)
- Compact floating overlay design over a dominant full-bleed map surface.

---

## 28. Responsive Design
- Validated across standard viewports: `1366×768`, `1440×900`, `1920×1080`, `1024px`, `768px`.
- No horizontal scrollbars.
- Floating overlay panels adjust max-height and internal scrolling to maintain clearance across viewports.

---

## 29. Performance Rules
- **WebGL Rendering**: Hotspots, facilities, and heatmaps render on the GPU via MapLibre GL.
- **Memoization**: GeoJSON conversions and filtered arrays are wrapped in React `useMemo` hooks.
- **Query Caching**: TanStack Query prevents unnecessary refetching with a 5-minute stale time.
- **Zero Overhead**: Backdrop blur effects are omitted in favor of solid dark panel fills for maximum frame rates.

---

## 30. Error Handling
- **Missing API Key**: If `VITE_THUNDERFOREST_API_KEY` is missing, `Map.tsx` displays an inline dark error banner with environment setup instructions.
- **Empty States**: Both `RightPanel` and `IncidentTable` provide fallback messages when no feature is selected or search query yields zero results.

---

## 31. Current Validation Status
- **TypeScript**: `npx tsc --noEmit` → **PASS** (0 errors)
- **Production Build**: `npm run build` → **PASS** (✓ 1691 modules transformed)
- **Runtime**: **PASS** (Zero console errors)
- **Frontend Freeze**: **APPROVED**

---

## 32. What Is NOT Implemented Yet
- FastAPI backend server
- PostgreSQL / PostGIS spatial database
- NASA FIRMS MODIS/VIIRS live satellite ingestion pipeline
- Real-time satellite observation feeds
- Machine Learning classification models (XGBoost / SHAP)
- Celery / Redis background worker tasks
- Real-time WebSocket or Server-Sent Event alert push mechanisms
- User authentication and authorization system

---

## 33. Planned Backend Architecture (Phase 4+)
```
+-------------------------------------------------------------+
|                      React Frontend                         |
|                 (TanStack Query / Axios)                    |
+-------------------------------------------------------------+
                              ^
                              | REST API (JSON / GeoJSON)
                              v
+-------------------------------------------------------------+
|                       FastAPI Server                        |
|             (Endpoints / Routers / Pydantic)                |
+-------------------------------------------------------------+
                              ^
                              | SQLAlchemy / GeoAlchemy2
                              v
+-------------------------------------------------------------+
|               PostgreSQL + PostGIS Database                 |
|               (Hotspots, Facilities, Alerts)                |
+-------------------------------------------------------------+
```

---

## 34. Planned Satellite / FIRMS Integration (Phase 5)
- Automated ingestion pipeline consuming NASA FIRMS thermal anomaly telemetry.
- Ingestion worker parsing satellite observations (latitude, longitude, brightness, FRP, acquisition date/time, satellite source).
- Spatial indexing in PostGIS for proximity matching with industrial facilities.

---

## 35. Planned ML Pipeline (Phase 6)
- Machine Learning classifier (XGBoost) trained on historical thermal patterns, brightness profiles, land-use data, and facility proximity.
- Output: Anomaly classification (`industrial_fire`, `gas_flare`, `agricultural`, `wildfire`, `unknown`), confidence probability, and feature importance explanations (SHAP values).

---

## 36. Planned Real-Time Alert Pipeline (Phase 7+)
- Background evaluator evaluating newly ingested satellite detections.
- Automated alert generation when high-confidence or critical thermal anomalies are detected within specified threshold distances of high-risk industrial facilities.

---

## 37. Future Phase Roadmap
- **PHASE 4**: Backend Foundation (FastAPI, PostgreSQL/PostGIS, Pydantic schemas, CORS configuration, API routes mirroring frontend types).
- **PHASE 5**: Real Satellite Data Ingestion (NASA FIRMS integration, PostGIS spatial queries).
- **PHASE 6**: ML Anomaly Classification (XGBoost classifier, confidence/severity scoring).
- **PHASE 7**: Frontend ↔ Backend Integration (Connect React service layer to FastAPI endpoints).
- **PHASE 8**: Automated Processing & Ingestion (Celery / Redis background workers & cron schedules).
- **PHASE 9**: Testing, Security, and Production Deployment.

---

## 38. Rules for Future AI Coding Agents
1. **Read `context.md`** thoroughly before making modifications to the codebase.
2. **Inspect the actual codebase** (`src/`) to understand existing component signatures, state management, and utility functions before proposing changes.
3. **DO NOT redesign the frozen frontend UI** unless explicitly requested by the user.
4. **Preserve MapLibre GL + Thunderforest basemap architecture**. Do not replace MapLibre or introduce unauthorized map tile providers.
5. **Preserve TanStack Query and Zustand boundaries**. Do not store server datasets in Zustand or introduce duplicate state.
6. **Maintain strict TypeScript discipline**. Never use `any`, `@ts-ignore`, or `@ts-nocheck`.
7. **Do not hardcode secrets or API keys**. Always use environment variables (`import.meta.env`).
8. **Keep mock services decoupled**. When implementing Phase 4+, update only `src/services/` to fetch from FastAPI without altering UI components.
9. **Never state that mock data is live satellite data**.
10. **Always validate changes** with `npx tsc --noEmit` and `npm run build` before concluding tasks.

---

## 39. How to Continue the Project
1. Read `context.md`.
2. Inspect `package.json` and `src/services/` to review existing frontend data contracts.
3. Begin **Phase 4 — Backend Foundation** by creating the backend directory structure, FastAPI application, and PostgreSQL/PostGIS database schemas.
4. Ensure FastAPI endpoint schemas strictly match the frontend TypeScript interfaces defined in `src/types/`.
5. Run validation (`npx tsc --noEmit` and `npm run build`) whenever making frontend service adjustments.

---

## 40. Frontend Freeze Status

```
============================================================
CURRENT PROJECT STATUS
============================================================

FRONTEND:
FROZEN

PHASE:
3D / Documentation Checkpoint

MAP RENDERER:
MapLibre GL + Thunderforest API

THERMAL DATA:
Mock / Demo Services

BACKEND:
Not Implemented Yet (Planned Phase 4)

SATELLITE / FIRMS:
Not Connected Yet (Planned Phase 5)

ML PIPELINE:
Not Implemented Yet (Planned Phase 6)

DATABASE:
Not Implemented Yet (Planned Phase 4)

NEXT MAJOR PHASE:
Phase 4 — Backend Foundation

============================================================
```
