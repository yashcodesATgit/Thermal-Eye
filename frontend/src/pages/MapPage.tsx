import React, { useRef } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import Navbar from '../components/Navbar';
import Map from '../components/Map';
import MapControls from '../components/MapControls';
import Legend from '../components/Legend';
import RightPanel from '../components/RightPanel';
import Timeline from '../components/Timeline';
import AlertFeed from '../components/AlertFeed';

export default function MapPage(): React.JSX.Element {
  const mapRef = useRef<MapRef>(null!);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080C14] text-[#E8EDF5]">
      <Navbar />

      {/* Map area fills remaining space */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* Full-bleed map */}
        <Map mapRef={mapRef} />

        {/* Overlays */}
        <Legend />
        <MapControls mapRef={mapRef} />
        <AlertFeed />
        <RightPanel />
        <Timeline />
      </main>
    </div>
  );
}
