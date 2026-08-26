import { create } from 'zustand';
import type { HotspotType } from '../types/hotspot';
import type { MapStyleId } from '../config/mapStyles';

interface MapStoreState {
  // Selection
  selectedHotspotId: string | null;
  selectedFacilityId: string | null;

  // Filters
  activeHotspotTypes: HotspotType[];
  minimumConfidence: number;

  // Timeline
  selectedDate: string; // ISO date string YYYY-MM-DD

  // Toggles
  showHeatmap: boolean;
  showFacilities: boolean;
  rightPanelOpen: boolean;

  // Map style
  mapStyle: MapStyleId;

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

export const useMapStore = create<MapStoreState>((set) => ({
  selectedHotspotId: null,
  selectedFacilityId: null,
  activeHotspotTypes: [
    'industrial_fire',
    'gas_flare',
    'agricultural',
    'wildfire',
    'unknown',
  ],
  minimumConfidence: 0,
  selectedDate: '2026-08-26',
  showHeatmap: true,
  showFacilities: true,
  rightPanelOpen: false,
  mapStyle: 'cycle',

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

  setHotspotTypes: (types) => set({ activeHotspotTypes: types }),

  toggleHotspotType: (type) =>
    set((state) => {
      const current = state.activeHotspotTypes;
      if (current.includes(type)) {
        return { activeHotspotTypes: current.filter((t) => t !== type) };
      }
      return { activeHotspotTypes: [...current, type] };
    }),

  setMinimumConfidence: (confidence) =>
    set({ minimumConfidence: confidence }),

  setShowHeatmap: (show) => set({ showHeatmap: show }),
  setShowFacilities: (show) => set({ showFacilities: show }),

  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  setMapStyle: (style) => set({ mapStyle: style }),
}));
