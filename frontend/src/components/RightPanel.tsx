import React, { useMemo, useState } from 'react';
import { X, Flame, Building2, History } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useHotspotsQuery } from '../services/queries/useHotspotsQuery';
import { useFacilitiesQuery } from '../services/queries/useFacilitiesQuery';
import { HOTSPOT_LABELS, HOTSPOT_COLORS } from '../types/hotspot';
import type { Severity, HotspotType } from '../types/hotspot';
import { FACILITY_LABELS } from '../types/facility';
import type { FacilityType } from '../types/facility';
import type { Hotspot } from '../types/hotspot';
import type { Facility } from '../types/facility';
import { getDistance } from '../utils/geo';

function getDotColor(item: Hotspot): string {
  if (item.type && item.type !== 'unknown' && HOTSPOT_COLORS[item.type as HotspotType]) {
    return HOTSPOT_COLORS[item.type as HotspotType];
  }
  const severityColors: Record<Severity, string> = {
    low: '#10B981',      // Easy / Green
    medium: '#F59E0B',   // Medium / Yellow
    high: '#F97316',     // High / Orange
    critical: '#FF5500', // Critical / Red-Orange
  };
  return severityColors[item.severity] || '#F59E0B';
}

function SeverityBadge({ severity, compact = false }: { severity: Severity; compact?: boolean }) {
  const config: Record<
    Severity,
    { bg: string; text: string; border: string; animate: string; label: string }
  > = {
    low: {
      bg: 'rgba(16, 185, 129, 0.22)',
      text: '#34D399',
      border: 'rgba(16, 185, 129, 0.5)',
      animate: '',
      label: 'EASY',
    },
    medium: {
      bg: 'rgba(245, 158, 11, 0.22)',
      text: '#FBBF24',
      border: 'rgba(245, 158, 11, 0.5)',
      animate: '',
      label: 'MEDIUM',
    },
    high: {
      bg: 'rgba(249, 115, 22, 0.25)',
      text: '#FB923C',
      border: 'rgba(249, 115, 22, 0.6)',
      animate: '',
      label: 'HIGH',
    },
    critical: {
      bg: 'rgba(249, 115, 22, 0.35)',
      text: '#FF7700',
      border: '#FF6B00',
      animate: 'animate-pop-in-out',
      label: 'CRITICAL',
    },
  };

  const s = config[severity] || config.low;

  return (
    <span
      className={`font-mono font-bold uppercase rounded border shrink-0 transition-all ${s.animate} ${
        compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-2.5 py-0.5 tracking-wider'
      }`}
      style={{
        backgroundColor: s.bg,
        color: s.text,
        borderColor: s.border,
      }}
    >
      {s.label}
    </span>
  );
}

function formatDetected(ts: string): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

export default function RightPanel(): React.JSX.Element | null {
  const selectedHotspotId = useMapStore((s) => s.selectedHotspotId);
  const selectedFacilityId = useMapStore((s) => s.selectedFacilityId);
  const selectHotspot = useMapStore((s) => s.selectHotspot);
  const selectFacility = useMapStore((s) => s.selectFacility);

  const [activeTab, setActiveTab] = useState<'overview' | 'explanation' | 'historical'>('overview');

  const minimumConfidence = useMapStore((s) => s.minimumConfidence);
  const selectedDate = useMapStore((s) => s.selectedDate);

  const { data: hotspots } = useHotspotsQuery(selectedDate, minimumConfidence);
  const { data: facilities } = useFacilitiesQuery();

  // Find most critical hotspot dynamically from NASA FIRMS dataset for default state
  const mostCriticalHotspot = useMemo<Hotspot | null>(() => {
    if (!hotspots || hotspots.length === 0) return null;
    const severityRank: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return (
      [...hotspots].sort((a, b) => {
        const rankA = severityRank[a.severity] || 0;
        const rankB = severityRank[b.severity] || 0;
        if (rankB !== rankA) return rankB - rankA;
        if (b.brightness !== a.brightness) return b.brightness - a.brightness;
        return b.confidence - a.confidence;
      })[0] || null
    );
  }, [hotspots]);

  // Selected or default active hotspot
  const activeHotspot = useMemo<Hotspot | null>(() => {
    if (selectedHotspotId && hotspots) {
      return hotspots.find((h) => h.id === selectedHotspotId) ?? null;
    }
    if (!selectedFacilityId) {
      return mostCriticalHotspot;
    }
    return null;
  }, [selectedHotspotId, selectedFacilityId, hotspots, mostCriticalHotspot]);

  const isUserSelected = selectedHotspotId !== null || selectedFacilityId !== null;

  const selectedFacility = useMemo<Facility | null>(() => {
    if (!selectedFacilityId || !facilities) return null;
    return facilities.find((f) => f.id === selectedFacilityId) ?? null;
  }, [selectedFacilityId, facilities]);

  const relatedFacility = useMemo<Facility | null>(() => {
    if (!activeHotspot?.facilityId || !facilities) return null;
    return facilities.find((f) => f.id === activeHotspot.facilityId) ?? null;
  }, [activeHotspot, facilities]);

  const facilityDistance = useMemo<number | null>(() => {
    if (!activeHotspot || !relatedFacility) return null;
    return getDistance(
      activeHotspot.latitude,
      activeHotspot.longitude,
      relatedFacility.latitude,
      relatedFacility.longitude,
    );
  }, [activeHotspot, relatedFacility]);

  // Detection History showing 5-7 compact readable chronological records
  const detectionHistory = useMemo<Hotspot[]>(() => {
    if (!activeHotspot || !hotspots) return [];
    return hotspots
      .filter(
        (h: Hotspot) =>
          h.id !== activeHotspot.id &&
          (h.facilityId === activeHotspot.facilityId ||
            getDistance(h.latitude, h.longitude, activeHotspot.latitude, activeHotspot.longitude) < 25),
      )
      .sort((a: Hotspot, b: Hotspot) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7);
  }, [activeHotspot, hotspots]);

  const handleClose = () => {
    selectHotspot(null);
    selectFacility(null);
  };

  const CloseBtn = () =>
    isUserSelected ? (
      <button
        type="button"
        aria-label="Deselect item"
        onClick={handleClose}
        className="text-[#6B7280] hover:text-[#E8EDF5] p-1 rounded transition-colors cursor-pointer hover:bg-[#1E2D45]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    ) : null;

  // ─── LOADING / NO DATA FALLBACK STATE ──────────────────────────────────────
  if (!activeHotspot && !selectedFacility) {
    return (
      <aside className="w-full h-full flex flex-col bg-[#0D121F] overflow-hidden select-none border-l border-[#1e293b]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] shrink-0 bg-[#090D16]">
          <span className="text-[11px] font-bold tracking-widest text-[#E8EDF5] uppercase">
            INTELLIGENCE PANEL
          </span>
          <span className="text-[9px] font-mono text-[#6B7280] bg-[#162033] px-1.5 py-0.5 rounded">
            SYNCING
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#162033] border border-[#1e293b] flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-[#2D7DD2] animate-pulse" />
          </div>
          <h3 className="text-xs font-bold text-[#E8EDF5] mb-1">Loading FIRMS Telemetry</h3>
          <p className="text-[11px] text-[#6B7280] leading-relaxed max-w-[220px]">
            Fetching latest thermal anomalies and satellite telemetry...
          </p>
        </div>
      </aside>
    );
  }

  // ─── SELECTED FACILITY STATE ───────────────────────────────────────────────
  if (selectedFacility) {
    const nearbyHotspots = hotspots
      ? hotspots.filter(
          (h) =>
            h.facilityId === selectedFacility.id ||
            getDistance(h.latitude, h.longitude, selectedFacility.latitude, selectedFacility.longitude) < 10,
        )
      : [];

    return (
      <aside className="w-full h-full flex flex-col bg-[#0D121F] overflow-hidden select-none border-l border-[#1e293b]">
        <div className="px-4 py-3 border-b border-[#1e293b] shrink-0 bg-[#090D16]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              SELECTED FACILITY
            </span>
            <CloseBtn />
          </div>
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-[#2D7DD2] mt-0.5 shrink-0" />
            <div>
              <h2 className="text-[14px] font-bold text-[#E8EDF5] leading-snug">
                {selectedFacility.name}
              </h2>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {selectedFacility.city}, {selectedFacility.state}
              </p>
              <p className="font-mono text-[9px] text-[#6B7280] mt-1">
                {selectedFacility.latitude.toFixed(4)}°N, {selectedFacility.longitude.toFixed(4)}°E
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#162032] p-3 rounded-lg border border-[#1e293b]">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">TYPE</span>
              <span className="text-xs font-semibold text-[#E8EDF5]">
                {FACILITY_LABELS[selectedFacility.type as FacilityType] || 'Industrial'}
              </span>
            </div>
            <div className="bg-[#162032] p-3 rounded-lg border border-[#1e293b]">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">NEARBY HOTSPOTS</span>
              <span className="text-xl font-bold text-[#E8EDF5]">{nearbyHotspots.length}</span>
            </div>
          </div>

          {nearbyHotspots.length > 0 && (
            <div className="pt-3 border-t border-[#1e293b]">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">ASSOCIATED DETECTIONS</span>
              <div className="space-y-2">
                {nearbyHotspots.slice(0, 6).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => selectHotspot(h.id)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-[#162032] border border-[#1e293b] rounded-lg hover:bg-[#1E2D45] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: getDotColor(h) }}
                      />
                      <span className="text-[11px] text-[#9CA3AF]">{HOTSPOT_LABELS[h.type as HotspotType]}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-[#E8EDF5]">
                      {h.brightness} K
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ─── ACTIVE HOTSPOT STATE (USER SELECTED OR DYNAMIC MOST CRITICAL) ────────
  if (!activeHotspot) return null;

  const hotspotLabel = HOTSPOT_LABELS[activeHotspot.type as HotspotType] || 'Unknown';

  return (
    <aside className="w-full h-full flex flex-col bg-[#0D121F] overflow-hidden select-none border-l border-[#1e293b]">
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-[#1e293b] shrink-0 bg-[#090D16]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
            {isUserSelected ? (
              'SELECTED HOTSPOT'
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-ping" />
                MOST CRITICAL ANOMALY
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={activeHotspot.severity} />
            <CloseBtn />
          </div>
        </div>

        {/* Title + ML Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-[rgba(255,107,0,0.15)] border border-[rgba(255,107,0,0.3)]">
            <Flame className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#E8EDF5] leading-tight">
              {hotspotLabel} <span className="text-[9px] font-normal text-[#6B7280]">(Satellite Detection)</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold text-[#10B981] bg-[rgba(16,185,129,0.12)] px-1.5 py-0.2 rounded">
                FIRMS Conf: {activeHotspot.confidence}%
              </span>
              {!isUserSelected && (
                <span className="text-[8px] font-mono text-[#F59E0B] bg-[rgba(245,158,11,0.12)] px-1.5 py-0.2 rounded">
                  Auto-Selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Subtabs: Overview | Explanation | Historical */}
        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-[#1e293b] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#2D7DD2] font-bold border-b-2 border-[#2D7DD2]'
                : 'text-[#6B7280] hover:text-[#E8EDF5]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('explanation')}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === 'explanation'
                ? 'text-[#2D7DD2] font-bold border-b-2 border-[#2D7DD2]'
                : 'text-[#6B7280] hover:text-[#E8EDF5]'
            }`}
          >
            Explanation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historical')}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === 'historical'
                ? 'text-[#2D7DD2] font-bold border-b-2 border-[#2D7DD2]'
                : 'text-[#6B7280] hover:text-[#E8EDF5]'
            }`}
          >
            Historical ({detectionHistory.length})
          </button>
        </div>
      </div>

      {/* Panel Body — Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {activeTab === 'overview' && (
          <>
            {/* 1. Location & Distance */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                LOCATION & PROXIMITY
              </span>
              <div className="grid grid-cols-2 gap-2 bg-[#162032] p-3 rounded-lg border border-[#1e293b]">
                <div>
                  <span className="text-[9px] text-[#6B7280] block">STATE / REGION</span>
                  <p className="text-[11px] font-semibold text-[#E8EDF5] truncate mt-0.5">
                    {relatedFacility ? `${relatedFacility.city}, ${relatedFacility.state}` : 'India Bounding Box'}
                  </p>
                  <p className="text-[9px] font-mono text-[#6B7280] mt-0.5">
                    {activeHotspot.latitude.toFixed(4)}°N, {activeHotspot.longitude.toFixed(4)}°E
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-[#6B7280] block">NEAREST FACILITY</span>
                  <p className="text-[11px] font-semibold text-[#E8EDF5] truncate mt-0.5">
                    {facilityDistance !== null ? `${facilityDistance.toFixed(1)} km` : 'N/A'}
                  </p>
                  <p className="text-[9px] text-[#6B7280] truncate mt-0.5">
                    {relatedFacility ? relatedFacility.name : 'No facility within 10km'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. FRP, Brightness & FIRMS Confidence */}
            <div className="space-y-1.5 pt-3 border-t border-[#1e293b]">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                SATELLITE TELEMETRY
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#162032] p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase block">FRP</span>
                  <span className="text-xs font-bold text-[#FF6B00] block mt-0.5">N/A</span>
                  <span className="text-[8px] text-[#F97316] block mt-0.5">Not tracked</span>
                </div>
                <div className="bg-[#162032] p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase block">BRIGHTNESS</span>
                  <span className="text-xs font-bold text-[#E8EDF5] block mt-0.5">{activeHotspot.brightness} K</span>
                </div>
                <div className="bg-[#162032] p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase block">CONFIDENCE</span>
                  <span className="text-xs font-bold text-[#10B981] block mt-0.5">{activeHotspot.confidence}%</span>
                  <span className="text-[8px] text-[#10B981] block mt-0.5">High</span>
                </div>
              </div>
            </div>

            {/* 3. Observation Metadata */}
            <div className="pt-3 border-t border-[#1e293b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#E8EDF5]">OBSERVATION METADATA</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#162032] p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase block">SOURCE</span>
                  <span className="text-xs font-bold text-[#E8EDF5] block mt-0.5">NASA FIRMS NRT</span>
                </div>
                <div className="bg-[#162032] p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase block">SATELLITE</span>
                  <span className="text-xs font-bold text-[#E8EDF5] block mt-0.5">VIIRS</span>
                </div>
                <div className="bg-[#162032] p-2.5 rounded-lg border border-[#1e293b]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase block">STATUS</span>
                  <span className="text-xs font-bold text-[#E8EDF5] block mt-0.5">{(activeHotspot as any).status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* 6. Detection History Section */}
            <div className="pt-3 border-t border-[#1e293b] space-y-2">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block flex items-center gap-1">
                <History className="w-3 h-3 text-[#2D7DD2]" /> DETECTION HISTORY ({detectionHistory.length})
              </span>
              <div className="space-y-1.5">
                {detectionHistory.length === 0 ? (
                  <p className="text-[10px] text-[#6B7280]">No prior detections recorded nearby.</p>
                ) : (
                  detectionHistory.map((item: Hotspot) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectHotspot(item.id)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-[#162032] border border-[#1e293b] rounded-lg hover:bg-[#1E2D45] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getDotColor(item) }}
                        />
                        <span className="font-mono text-[10px] text-[#9CA3AF]">
                          {formatDetected(item.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-[#E8EDF5] font-semibold">{item.brightness} K</span>
                        <SeverityBadge severity={item.severity} compact />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'explanation' && (
          <div className="space-y-3">
            <div className="bg-[#162032] p-3.5 rounded-lg border border-[#1e293b]">
              <h4 className="text-xs font-bold text-[#E8EDF5] mb-1">Classification Explanation</h4>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                This observation represents a raw thermal anomaly detected by NASA FIRMS satellite instruments. Classification into industrial fire, wildfire, agricultural burning, or other categories requires Phase 6 ML analysis which has not yet been implemented.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'historical' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Recent Detection History ({detectionHistory.length})</span>
            <div className="space-y-2">
              {detectionHistory.map((item: Hotspot) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectHotspot(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#162032] border border-[#1e293b] rounded-lg hover:bg-[#1E2D45] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getDotColor(item) }}
                    />
                    <span className="font-mono text-[10px] text-[#9CA3AF]">
                      {formatDetected(item.timestamp)}
                    </span>
                  </div>
                  <SeverityBadge severity={item.severity} compact />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
