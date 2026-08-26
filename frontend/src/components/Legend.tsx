import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const activeHotspotTypes = useMapStore((s) => s.activeHotspotTypes);
  const toggleHotspotType = useMapStore((s) => s.toggleHotspotType);
  const showHeatmap = useMapStore((s) => s.showHeatmap);
  const setShowHeatmap = useMapStore((s) => s.setShowHeatmap);
  const minimumConfidence = useMapStore((s) => s.minimumConfidence);
  const setMinimumConfidence = useMapStore((s) => s.setMinimumConfidence);
  const showFacilities = useMapStore((s) => s.showFacilities);
  const setShowFacilities = useMapStore((s) => s.setShowFacilities);

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
    <div
      className="absolute left-4 top-4 z-20 rounded-lg overflow-hidden flex flex-col"
      style={{
        width: 168,
        maxHeight: 'calc(100vh - 230px)',
        backgroundColor: '#111827',
        border: '1px solid #1e293b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <span className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
          LEGEND
        </span>
        <button
          type="button"
          aria-label={isCollapsed ? 'Expand Legend' : 'Collapse Legend'}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#6B7280] hover:text-[#E8EDF5] transition-colors p-0.5 rounded"
          style={{ backgroundColor: 'transparent' }}
        >
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {/* Hotspot Type */}
          <div>
            <span className="block text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              Hotspot Type
            </span>
            <div className="space-y-1.5">
              {hotspotTypes.map((item) => {
                const isActive = activeHotspotTypes.includes(item.type);
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleHotspotType(item.type)}
                    className="flex items-center gap-2 w-full text-left transition-opacity"
                    style={{
                      backgroundColor: 'transparent',
                      opacity: isActive ? 1 : 0.35,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[12px] text-[#D1D5DB] font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Facilities */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Facilities
              </span>
              <button
                type="button"
                onClick={() => setShowFacilities(!showFacilities)}
                className="transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: showFacilities ? '#2D7DD2' : '#6B7280',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 4,
                  border: `1px solid ${showFacilities ? '#2D7DD2' : '#374151'}`,
                }}
              >
                {showFacilities ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="space-y-1.5">
              {facilityTypes.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2"
                  style={{ opacity: showFacilities ? 1 : 0.35 }}
                >
                  <span className="text-[12px] leading-none w-4 text-center">{item.icon}</span>
                  <span className="text-[12px] text-[#D1D5DB] font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Heat Intensity */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Heat Intensity
              </span>
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                style={{
                  backgroundColor: 'transparent',
                  color: showHeatmap ? '#2D7DD2' : '#6B7280',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 4,
                  border: `1px solid ${showHeatmap ? '#2D7DD2' : '#374151'}`,
                }}
              >
                {showHeatmap ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-stretch gap-2.5">
              <div
                className="w-3 rounded shrink-0"
                style={{
                  height: 60,
                  background: 'linear-gradient(to bottom, #DC2626, #F97316, #FBBF24)',
                }}
              />
              <div className="flex flex-col justify-between py-0.5">
                <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626' }}>High</span>
                <span style={{ fontSize: 11, color: '#F97316' }}>Medium</span>
                <span style={{ fontSize: 11, color: '#FBBF24' }}>Low</span>
              </div>
            </div>
          </div>

          {/* Min Confidence */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10 }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Min Confidence
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#E8EDF5' }}>
                {minimumConfidence}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minimumConfidence}
              onChange={(e) => setMinimumConfidence(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#2D7DD2', height: 4, background: '#1E2D45', borderRadius: 4 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
