import React, { useMemo } from 'react';
import { Info, RotateCcw, Check } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useHotspotsQuery } from '../services/queries/useHotspotsQuery';
import type { HotspotType } from '../types/hotspot';
import { HOTSPOT_COLORS, HOTSPOT_LABELS } from '../types/hotspot';
import type { FacilityType } from '../types/facility';
import { FACILITY_LABELS } from '../types/facility';

interface HotspotTypeItem {
  type: HotspotType;
  label: string;
  color: string;
}

interface FacilityTypeItem {
  type: FacilityType;
  label: string;
  icon: string;
}

export default function Legend(): React.JSX.Element {
  const activeHotspotTypes = useMapStore((s) => s.activeHotspotTypes);
  const toggleHotspotType = useMapStore((s) => s.toggleHotspotType);
  const selectedDate = useMapStore((s) => s.selectedDate);
  const activeFacilityTypes = useMapStore((s) => s.activeFacilityTypes);
  const toggleFacilityType = useMapStore((s) => s.toggleFacilityType);
  const minimumConfidence = useMapStore((s) => s.minimumConfidence);
  const setMinimumConfidence = useMapStore((s) => s.setMinimumConfidence);
  const resetFilters = useMapStore((s) => s.resetFilters);

  const { data: hotspots } = useHotspotsQuery(selectedDate, minimumConfidence);

  // Category counts from real FIRMS data
  const counts = useMemo(() => {
    const map: Record<HotspotType, number> = {
      industrial_fire: 0,
      gas_flare: 0,
      agricultural: 0,
      wildfire: 0,
      unknown: 0,
    };
    if (hotspots) {
      for (const h of hotspots) {
        const effectiveType = (h.mlType || h.type) as HotspotType;
        if (map[effectiveType] !== undefined) map[effectiveType]++;
        else map.unknown++;
      }
    }
    return map;
  }, [hotspots]);

  const hotspotTypes: HotspotTypeItem[] = [
    { type: 'industrial_fire', label: HOTSPOT_LABELS.industrial_fire, color: HOTSPOT_COLORS.industrial_fire },
    { type: 'gas_flare', label: HOTSPOT_LABELS.gas_flare, color: HOTSPOT_COLORS.gas_flare },
    { type: 'agricultural', label: HOTSPOT_LABELS.agricultural, color: HOTSPOT_COLORS.agricultural },
    { type: 'wildfire', label: HOTSPOT_LABELS.wildfire, color: HOTSPOT_COLORS.wildfire },
    { type: 'unknown', label: HOTSPOT_LABELS.unknown, color: HOTSPOT_COLORS.unknown },
  ];

  const facilityTypes: FacilityTypeItem[] = [
    { type: 'refinery', label: FACILITY_LABELS.refinery, icon: '⚗️' },
    { type: 'power_plant', label: FACILITY_LABELS.power_plant, icon: '⚡' },
    { type: 'steel_plant', label: FACILITY_LABELS.steel_plant, icon: '🏭' },
    { type: 'cement_plant', label: FACILITY_LABELS.cement_plant, icon: '🏗️' },
    { type: 'lng_terminal', label: FACILITY_LABELS.lng_terminal, icon: '💧' },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-[#0D121F] overflow-hidden select-none border-r border-[#1e293b]">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1e293b] shrink-0 bg-[#090D16]">
        <span className="text-[11px] font-bold tracking-widest text-[#E8EDF5] uppercase flex items-center gap-1.5">
          LEGEND & FILTERS
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Reset Filters"
            onClick={resetFilters}
            className="text-[#6B7280] hover:text-[#2D7DD2] transition-colors p-1 rounded cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <span className="text-[9px] font-mono font-bold text-[#10B981] bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.3)] px-1.5 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            LIVE
          </span>
        </div>
      </div>

      {/* Panel Body — Scrollable */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs">
        {/* Section 1: Hotspot Type */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              HOTSPOT TYPE <span className="text-[8px] text-[#2D7DD2] lowercase">(Observation Type)</span>
            </span>
          </div>
          <div className="space-y-1.5">
            {hotspotTypes.map((item) => {
              const isActive = activeHotspotTypes.includes(item.type);
              const count = counts[item.type] || 0;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => toggleHotspotType(item.type)}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer hover:bg-[#162032]"
                  style={{
                    backgroundColor: isActive ? 'rgba(30, 45, 69, 0.5)' : 'transparent',
                    borderColor: isActive ? '#1e293b' : 'transparent',
                    opacity: isActive ? 1 : 0.4,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-[#E8EDF5] font-medium">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8B9BB4]">{count}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                        isActive
                          ? 'bg-[#2D7DD2] border-[#2D7DD2] shadow-sm shadow-[#2D7DD2]/40 ring-1 ring-[#2D7DD2]/30'
                          : 'bg-[#111827] border-[#374151] hover:border-[#6B7280]'
                      }`}
                    >
                      {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Heat Intensity */}
        <div className="pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              HEAT INTENSITY
            </span>
          </div>
          <div className="space-y-1">
            <div
              className="w-full h-2 rounded-full"
              style={{
                background: 'linear-gradient(to right, #3B82F6, #F59E0B, #F97316, #DC2626)',
              }}
            />
            <div className="flex justify-between text-[9px] text-[#6B7280] font-mono">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Section 3: Confidence */}
        <div className="pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
              CONFIDENCE <Info className="w-3 h-3 text-[#6B7280]" />
            </span>
            <span className="font-mono text-[10px] font-bold text-[#2D7DD2] bg-[#162033] px-1.5 py-0.5 rounded">
              ≥ {minimumConfidence}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minimumConfidence}
            onChange={(e) => setMinimumConfidence(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#2D7DD2]"
            style={{ height: 4, background: '#1e293b', borderRadius: 4 }}
          />
        </div>

        {/* Section 4: Facility Type */}
        <div className="pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              FACILITY TYPE
            </span>
          </div>
          <div className="space-y-1.5">
            {facilityTypes.map((item) => {
              const isActive = activeFacilityTypes.includes(item.type);
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => toggleFacilityType(item.type)}
                  className="flex items-center justify-between w-full px-2.5 py-1 text-left text-[11px] text-[#9CA3AF] rounded hover:bg-[#162032] transition-colors cursor-pointer"
                  style={{ opacity: isActive ? 1 : 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{item.icon}</span>
                    <span className={isActive ? 'text-[#E8EDF5] font-medium' : 'text-[#6B7280]'}>
                      {item.label}
                    </span>
                  </div>
                  <div
                    className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-[#2D7DD2] border-[#2D7DD2] shadow-sm shadow-[#2D7DD2]/40 ring-1 ring-[#2D7DD2]/30'
                        : 'bg-[#111827] border-[#374151] hover:border-[#6B7280]'
                    }`}
                  >
                    {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
