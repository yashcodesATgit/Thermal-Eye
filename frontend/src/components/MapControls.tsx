import React from 'react';
import { Plus, Minus, Navigation } from 'lucide-react';
import type { MapRef } from 'react-map-gl/maplibre';
import { GUJARAT_VIEWPORT } from '../types/map';

interface MapControlsProps {
  mapRef: React.RefObject<MapRef>;
}

export default function MapControls({ mapRef }: MapControlsProps): React.JSX.Element {
  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) map.zoomOut({ duration: 300 });
  };

  const handleReset = () => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [GUJARAT_VIEWPORT.longitude, GUJARAT_VIEWPORT.latitude],
        zoom: GUJARAT_VIEWPORT.zoom,
        duration: 1200,
      });
    }
  };

  return (
    <div
      className="absolute left-4 z-20 flex flex-col overflow-hidden"
      style={{
        bottom: 16,
        backgroundColor: '#111827',
        border: '1px solid #1e293b',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
      }}
    >
      <button
        type="button"
        title="Zoom In"
        aria-label="Zoom In"
        onClick={handleZoomIn}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: '#E8EDF5',
          borderBottom: '1px solid #1e293b',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
      </button>
      <button
        type="button"
        title="Zoom Out"
        aria-label="Zoom Out"
        onClick={handleZoomOut}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: '#E8EDF5',
          borderBottom: '1px solid #1e293b',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        }}
      >
        <Minus style={{ width: 16, height: 16 }} />
      </button>
      <button
        type="button"
        title="Reset Location"
        aria-label="Reset Location"
        onClick={handleReset}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: '#E8EDF5',
          border: 'none',
        }}
      >
        <Navigation style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
