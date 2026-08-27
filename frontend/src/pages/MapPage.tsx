import React, { useRef } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import Navbar from '../components/Navbar';
import Map from '../components/Map';
import MapControls from '../components/MapControls';
import Legend from '../components/Legend';
import RightPanel from '../components/RightPanel';
import BottomAnalytics from '../components/BottomAnalytics';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';

import { ChatAssistant } from '../components/ChatAssistant';

export default function MapPage(): React.JSX.Element {
  const mapRef = useRef<MapRef>(null!);
  const fetchAndSetLatestDate = useMapStore((s) => s.fetchAndSetLatestDate);
  const selectedHotspotId = useMapStore((s) => s.selectedHotspotId);

  useEffect(() => {
    fetchAndSetLatestDate();
  }, [fetchAndSetLatestDate]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080C14] text-[#E8EDF5] select-none">
      {/* 1. NAVBAR (Fixed Height ~48px) */}
      <Navbar />

      {/* 2. THREE-COLUMN DASHBOARD LAYOUT */}
      <main className="flex-1 min-h-0 flex w-full overflow-hidden">
        {/* LEFT COLUMN: Legend & Filters (FULL HEIGHT) */}
        <div className="hidden md:block w-[260px] lg:w-[280px] shrink-0 h-full overflow-hidden border-r border-[#1e293b] bg-[#0D121F]">
          <Legend />
        </div>

        {/* CENTER COLUMN: Split Vertically (Alert banner + Map on top, Past Activity below) */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-[#080C14]">
          {/* SYSTEM ALERT NOTIFICATION BAR (Contained to Map Width Only) */}
          <div className="bg-[rgba(220,38,38,0.12)] border-b border-[rgba(220,38,38,0.3)] px-4 py-1 flex items-center justify-between text-xs shrink-0 h-7">
            <div className="flex items-center gap-2 text-[11px] truncate">
              <span className="flex items-center gap-1 font-bold text-[#FF4444]">
                <AlertCircle className="w-3.5 h-3.5" />
                Active Alerts
              </span>
              <span className="text-[#6B7280]">|</span>
              <span className="text-[#E8EDF5] truncate">
                Near-real-time thermal anomaly monitoring — India
              </span>
              <span className="text-[#6B7280] font-mono text-[9px]">NRT</span>
            </div>
            <a
              href="/incidents"
              className="text-[10px] font-semibold text-[#2D7DD2] hover:underline flex items-center gap-0.5 shrink-0"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Top: Map Area (flex-1) */}
          <div className="flex-1 min-h-0 w-full relative overflow-hidden bg-[#080C14]">
            <Map mapRef={mapRef} />
            <MapControls mapRef={mapRef} />
            {/* Compact Floating AI Intelligence Assistant in Right Bottom Corner of Map Area */}
            <ChatAssistant
              selectedHotspotId={selectedHotspotId}
              positionClass="absolute bottom-3 right-3 z-30"
            />
          </div>

          {/* Bottom: Past Activity Dashboard (Center-Only Width, aligned with Map) */}
          <div className="h-[160px] lg:h-[175px] shrink-0 w-full border-t border-[#1e293b] overflow-hidden bg-[#080C14]">
            <BottomAnalytics />
          </div>
        </div>

        {/* RIGHT COLUMN: Intelligence Panel (FULL HEIGHT) */}
        <div className="hidden lg:block w-[320px] lg:w-[340px] shrink-0 h-full overflow-hidden border-l border-[#1e293b] bg-[#0D121F]">
          <RightPanel />
        </div>
      </main>
    </div>
  );
}
