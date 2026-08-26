import React, { useMemo } from 'react';
import { X, Flame, Building2, ExternalLink } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { useHotspotsQuery } from '../services/queries/useHotspotsQuery';
import { useFacilitiesQuery } from '../services/queries/useFacilitiesQuery';
import { HOTSPOT_LABELS, HOTSPOT_COLORS } from '../types/hotspot';
import type { Severity } from '../types/hotspot';
import { FACILITY_LABELS } from '../types/facility';
import type { Hotspot } from '../types/hotspot';
import type { Facility } from '../types/facility';
import { getDistance } from '../utils/geo';

const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  bottom: 8,
  width: 340,
  zIndex: 20,
  backgroundColor: '#111827',
  border: '1px solid #1e293b',
  borderRadius: 12,
  boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(30, 45, 69, 0.5)',
  border: '1px solid #374151',
  borderRadius: 8,
  padding: '10px 12px',
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, { bg: string; color: string }> = {
    critical: { bg: '#DC2626', color: '#fff' },
    high: { bg: '#DC2626', color: '#fff' },
    medium: { bg: '#F97316', color: '#fff' },
    low: { bg: '#CA8A04', color: '#fff' },
  };
  const s = colors[severity] || colors.low;
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 4,
        letterSpacing: '0.05em',
        flexShrink: 0,
      }}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

function formatDetected(ts: string): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#6B7280',
  display: 'block',
  marginBottom: 6,
};

export default function RightPanel(): React.JSX.Element | null {
  const selectedHotspotId = useMapStore((s) => s.selectedHotspotId);
  const selectedFacilityId = useMapStore((s) => s.selectedFacilityId);
  const rightPanelOpen = useMapStore((s) => s.rightPanelOpen);
  const selectHotspot = useMapStore((s) => s.selectHotspot);
  const selectFacility = useMapStore((s) => s.selectFacility);
  const setRightPanelOpen = useMapStore((s) => s.setRightPanelOpen);

  const { data: hotspots } = useHotspotsQuery();
  const { data: facilities } = useFacilitiesQuery();

  const selectedHotspot = useMemo<Hotspot | null>(() => {
    if (!selectedHotspotId || !hotspots) return null;
    return hotspots.find((h) => h.id === selectedHotspotId) ?? null;
  }, [selectedHotspotId, hotspots]);

  const selectedFacility = useMemo<Facility | null>(() => {
    if (!selectedFacilityId || !facilities) return null;
    return facilities.find((f) => f.id === selectedFacilityId) ?? null;
  }, [selectedFacilityId, facilities]);

  const relatedFacility = useMemo<Facility | null>(() => {
    if (!selectedHotspot?.facilityId || !facilities) return null;
    return facilities.find((f) => f.id === selectedHotspot.facilityId) ?? null;
  }, [selectedHotspot, facilities]);

  const facilityDistance = useMemo<number | null>(() => {
    if (!selectedHotspot || !relatedFacility) return null;
    return getDistance(selectedHotspot.latitude, selectedHotspot.longitude, relatedFacility.latitude, relatedFacility.longitude);
  }, [selectedHotspot, relatedFacility]);

  const detectionHistory = useMemo(() => {
    if (!selectedHotspot || !hotspots) return [];
    return hotspots
      .filter(
        (h) =>
          h.id !== selectedHotspot.id &&
          (h.facilityId === selectedHotspot.facilityId ||
            getDistance(h.latitude, h.longitude, selectedHotspot.latitude, selectedHotspot.longitude) < 15),
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [selectedHotspot, hotspots]);

  const handleClose = () => {
    selectHotspot(null);
    selectFacility(null);
    setRightPanelOpen(false);
  };

  if (!rightPanelOpen) return null;

  const CloseBtn = () => (
    <button
      type="button"
      aria-label="Close panel"
      onClick={handleClose}
      style={{ backgroundColor: 'transparent', color: '#6B7280', padding: 4, borderRadius: 6 }}
    >
      <X style={{ width: 15, height: 15 }} />
    </button>
  );

  // ─── EMPTY ───────────────────────────────────────────────────────────────────
  if (!selectedHotspot && !selectedFacility) {
    return (
      <aside style={PANEL_STYLE}>
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid #1e293b', flexShrink: 0 }}
        >
          <span style={SECTION_LABEL}>INTELLIGENCE PANEL</span>
          <CloseBtn />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
          <Flame style={{ width: 32, height: 32, color: '#374151' }} />
          <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 1.6 }}>
            Select a hotspot or facility on the map to view intelligence data.
          </p>
        </div>
      </aside>
    );
  }

  // ─── FACILITY ─────────────────────────────────────────────────────────────────
  if (selectedFacility) {
    const nearbyHotspots = hotspots
      ? hotspots.filter(
          (h) =>
            h.facilityId === selectedFacility.id ||
            getDistance(h.latitude, h.longitude, selectedFacility.latitude, selectedFacility.longitude) < 10,
        )
      : [];

    return (
      <aside style={PANEL_STYLE}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ ...SECTION_LABEL, marginBottom: 0 }}>SELECTED FACILITY</span>
            <CloseBtn />
          </div>
          <div className="flex items-start gap-2.5">
            <Building2 style={{ width: 18, height: 18, color: '#2D7DD2', marginTop: 2, flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E8EDF5', lineHeight: 1.3, margin: 0 }}>
                {selectedFacility.name}
              </h2>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
                {selectedFacility.city}, {selectedFacility.state}
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#6B7280', marginTop: 2 }}>
                {selectedFacility.latitude.toFixed(4)}°N, {selectedFacility.longitude.toFixed(4)}°E
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
          <div className="grid grid-cols-2 gap-2">
            <div style={CARD_STYLE}>
              <span style={SECTION_LABEL}>TYPE</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF5' }}>
                {FACILITY_LABELS[selectedFacility.type]}
              </span>
            </div>
            <div style={CARD_STYLE}>
              <span style={SECTION_LABEL}>NEARBY HOTSPOTS</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#E8EDF5' }}>{nearbyHotspots.length}</span>
            </div>
          </div>

          {nearbyHotspots.length > 0 && (
            <div>
              <span style={SECTION_LABEL}>ASSOCIATED DETECTIONS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {nearbyHotspots.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(30,45,69,0.4)',
                      border: '1px solid rgba(55,65,81,0.6)',
                      borderRadius: 8,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full"
                        style={{ width: 8, height: 8, backgroundColor: HOTSPOT_COLORS[h.type] || HOTSPOT_COLORS.unknown, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{HOTSPOT_LABELS[h.type]}</span>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#E8EDF5' }}>
                      {h.brightness} K
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ─── HOTSPOT ──────────────────────────────────────────────────────────────────
  if (!selectedHotspot) return null;

  const hotspotColor = HOTSPOT_COLORS[selectedHotspot.type] || HOTSPOT_COLORS.unknown;
  const hotspotLabel = HOTSPOT_LABELS[selectedHotspot.type] || 'Unknown';

  const lastDetected = new Date(selectedHotspot.timestamp);
  const firstDetected = new Date(lastDetected.getTime() - 97 * 60 * 1000);

  return (
    <aside style={PANEL_STYLE}>
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ ...SECTION_LABEL, marginBottom: 0 }}>SELECTED HOTSPOT</span>
          <CloseBtn />
        </div>

        {/* Type + severity row */}
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="rounded-full"
            style={{ width: 12, height: 12, backgroundColor: hotspotColor, flexShrink: 0 }}
          />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E8EDF5', flex: 1, margin: 0, lineHeight: 1.3 }}>
            {hotspotLabel}
          </h2>
          <SeverityBadge severity={selectedHotspot.severity} />
        </div>

        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 3 }}>
          {relatedFacility
            ? `Near ${relatedFacility.city}, ${relatedFacility.state}`
            : `${selectedHotspot.latitude.toFixed(4)}°N, ${selectedHotspot.longitude.toFixed(4)}°E`}
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#6B7280' }}>
          {selectedHotspot.latitude.toFixed(4)}°N, {selectedHotspot.longitude.toFixed(4)}°E
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 p-4" style={{ paddingBottom: 0 }}>
          {[
            { label: 'Confidence', value: `${selectedHotspot.confidence}%` },
            { label: 'Brightness', value: `${selectedHotspot.brightness} K` },
            {
              label: 'Distance',
              value: facilityDistance !== null ? `${facilityDistance.toFixed(1)} km` : 'N/A',
            },
          ].map((m) => (
            <div key={m.label} style={CARD_STYLE}>
              <span style={{ ...SECTION_LABEL, marginBottom: 4 }}>{m.label}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#E8EDF5' }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Related Facility */}
        {relatedFacility && (
          <div className="px-4 pt-4">
            <span style={SECTION_LABEL}>Related Facility</span>
            <div
              className="flex items-center justify-between"
              style={{
                ...CARD_STYLE,
                padding: '10px 12px',
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF5', margin: 0 }}>
                  {relatedFacility.name}
                </p>
                <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                  {relatedFacility.city}, {relatedFacility.state}
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1"
                style={{ backgroundColor: 'transparent', color: '#2D7DD2', fontSize: 11, fontWeight: 500 }}
              >
                <span>View Facility</span>
                <ExternalLink style={{ width: 10, height: 10 }} />
              </button>
            </div>
          </div>
        )}

        {/* First / Last Detected */}
        <div className="grid grid-cols-2 gap-4 px-4 pt-4">
          <div>
            <span style={SECTION_LABEL}>First Detected</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#E8EDF5' }}>
              {formatDetected(firstDetected.toISOString())}
            </span>
          </div>
          <div>
            <span style={SECTION_LABEL}>Last Detected</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#E8EDF5' }}>
              {formatDetected(lastDetected.toISOString())}
            </span>
          </div>
        </div>

        {/* Heat Intensity Trend */}
        <div className="px-4 pt-4">
          <span style={SECTION_LABEL}>Heat Intensity Trend</span>
          <div
            style={{
              backgroundColor: '#0D1117',
              border: '1px solid #1e293b',
              borderRadius: 8,
              overflow: 'hidden',
              height: 88,
            }}
          >
            <svg width="100%" height="88" viewBox="0 0 300 88" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid line */}
              <line x1="0" y1="44" x2="300" y2="44" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 4" />
              {/* Fill */}
              <polygon points="0,70 50,65 100,58 150,48 200,36 250,22 300,8 300,88 0,88" fill="url(#trend-fill)" />
              {/* Line */}
              <polyline
                fill="none"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinejoin="round"
                points="0,70 50,65 100,58 150,48 200,36 250,22 300,8"
              />
              {/* End dot */}
              <circle cx="300" cy="8" r="4" fill="#DC2626" stroke="#E8EDF5" strokeWidth="1.5" />
              {/* X labels */}
              {['-6D', '-5D', '-4D', '-3D', '-2D', '-1D', 'Today'].map((label, i) => (
                <text
                  key={label}
                  x={i * 50}
                  y={85}
                  textAnchor={i === 0 ? 'start' : i === 6 ? 'end' : 'middle'}
                  style={{ fontSize: 8, fill: '#4B5563', fontFamily: 'monospace' }}
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Detection History */}
        {detectionHistory.length > 0 && (
          <div className="px-4 pt-4 pb-4">
            <span style={SECTION_LABEL}>
              Detection History{' '}
              <span style={{ color: '#4B5563', textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>
                (Last 6 Days)
              </span>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {detectionHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(30,45,69,0.3)',
                    border: '1px solid rgba(55,65,81,0.4)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF' }}>
                    {formatDetected(item.timestamp)}
                  </span>
                  <SeverityBadge severity={item.severity} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
