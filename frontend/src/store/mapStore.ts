import { create } from 'zustand';
import type { HotspotType } from '../types/hotspot';
import type { FacilityType } from '../types/facility';
import type { MapStyleId } from '../config/mapStyles';

const getTodayString = () => new Date().toISOString().slice(0, 10);

interface MapStoreState {
  // Selection
  selectedHotspotId: string | null;
  selectedFacilityId: string | null;

  // Filters
  activeHotspotTypes: HotspotType[];
  activeFacilityTypes: FacilityType[];
  minimumConfidence: number;

  // Timeline
  selectedDate: string; // ISO date string YYYY-MM-DD
  isDateInitialized: boolean;

  // Toggles
  showHeatmap: boolean;
  showFacilities: boolean;
  showRiskZones: boolean;
  rightPanelOpen: boolean;

  // Map style
  mapStyle: MapStyleId;

  // Actions
  selectHotspot: (id: string | null) => void;
  selectFacility: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  fetchAndSetLatestDate: () => Promise<void>;
  setHotspotTypes: (types: HotspotType[]) => void;
  toggleHotspotType: (type: HotspotType) => void;
  setFacilityTypes: (types: FacilityType[]) => void;
  toggleFacilityType: (type: FacilityType) => void;
  setMinimumConfidence: (confidence: number) => void;
  setShowHeatmap: (show: boolean) => void;
  setShowFacilities: (show: boolean) => void;
  setShowRiskZones: (show: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setMapStyle: (style: MapStyleId) => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapStoreState>((set, get) => ({
  selectedHotspotId: null,
  selectedFacilityId: null,
  activeHotspotTypes: [
    'industrial_fire',
    'gas_flare',
    'agricultural',
    'wildfire',
    'unknown',
  ],
  activeFacilityTypes: [
    'refinery',
    'power_plant',
    'steel_plant',
    'cement_plant',
    'lng_terminal',
  ],
  minimumConfidence: 0,
  selectedDate: getTodayString(),
  isDateInitialized: false,
  showHeatmap: true,
  showFacilities: true,
  showRiskZones: true,
  rightPanelOpen: false,
  mapStyle: 'bright',

  selectHotspot: (id) =>
    set({
      selectedHotspotId: id,
      selectedFacilityId: null,
      rightPanelOpen: id !== null,
    }),

  selectFacility: (id) =>
    set({
      selectedFacilityId: id,
      selectedHotspotId: null,
      rightPanelOpen: id !== null,
    }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchAndSetLatestDate: async () => {
    const state = get();
    if (state.isDateInitialized) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/hotspots/latest-date`);
      const data = await response.json();
      if (data && data.date) {
        set({ selectedDate: data.date, isDateInitialized: true });
      }
    } catch (e) {
      console.error('Failed to fetch latest date:', e);
      set({ isDateInitialized: true }); // Prevent infinite retries
    }
  },

  setHotspotTypes: (types) => set({ activeHotspotTypes: types }),

  toggleHotspotType: (type) =>
    set((state) => {
      const current = state.activeHotspotTypes;
      if (current.includes(type)) {
        return { activeHotspotTypes: current.filter((t) => t !== type) };
      }
      return { activeHotspotTypes: [...current, type] };
    }),

  setFacilityTypes: (types) => set({ activeFacilityTypes: types }),

  toggleFacilityType: (type) =>
    set((state) => {
      const current = state.activeFacilityTypes;
      if (current.includes(type)) {
        return { activeFacilityTypes: current.filter((t) => t !== type) };
      }
      return { activeFacilityTypes: [...current, type] };
    }),

  setMinimumConfidence: (confidence) =>
    set({ minimumConfidence: confidence }),

  setShowHeatmap: (show) => set({ showHeatmap: show }),
  setShowFacilities: (show) => set({ showFacilities: show }),
  setShowRiskZones: (show) => set({ showRiskZones: show }),

  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  setMapStyle: (style) => set({ mapStyle: style }),

  resetFilters: () =>
    set({
      activeHotspotTypes: [
        'industrial_fire',
        'gas_flare',
        'agricultural',
        'wildfire',
        'unknown',
      ],
      activeFacilityTypes: [
        'refinery',
        'power_plant',
        'steel_plant',
        'cement_plant',
        'lng_terminal',
      ],
      minimumConfidence: 0,
      showFacilities: true,
      showHeatmap: true,
      showRiskZones: true,
    }),
}));
