import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ReactMapGL, {
  Source,
  Layer,
  MapRef,
} from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ChevronDown, Layers, Check } from 'lucide-react';
import { useHotspotsQuery } from '../services/queries/useHotspotsQuery';
import { useFacilitiesQuery } from '../services/queries/useFacilitiesQuery';
import { useMapStore } from '../store/mapStore';
import {
  hotspotsToGeoJSON,
  facilitiesToGeoJSON,
  filterHotspots,
} from '../utils/geojson';
import { HOTSPOT_COLORS } from '../types/hotspot';
import { GUJARAT_VIEWPORT } from '../types/map';
import { MAP_STYLES, getThunderforestTileUrl } from '../config/mapStyles';
import type { GeoJSONFeatureCollection } from '../utils/geojson';

// Build dynamic Thunderforest map style spec for MapLibre (raster tiles)
function buildMapStyle(apiKey: string, styleId: string): StyleSpecification {
  const tileUrl = getThunderforestTileUrl(styleId, apiKey);

  return {
    version: 8,
    name: `Thunderforest ${styleId}`,
    sources: {
      'thunderforest-basemap': {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 22,
        attribution:
          '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'thunderforest-basemap-layer',
        type: 'raster',
        source: 'thunderforest-basemap',
      },
    ],
  };
}

// Empty GeoJSON for initial/fallback state
const EMPTY_GEOJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

interface MapComponentProps {
  mapRef: React.RefObject<MapRef>;
}

export default function Map({ mapRef }: MapComponentProps): React.JSX.Element {
  const apiKey = import.meta.env.VITE_THUNDERFOREST_API_KEY;

  // Zustand selectors
  const selectedHotspotId = useMapStore((s) => s.selectedHotspotId);
  const selectedFacilityId = useMapStore((s) => s.selectedFacilityId);
  const activeHotspotTypes = useMapStore((s) => s.activeHotspotTypes);
  const minimumConfidence = useMapStore((s) => s.minimumConfidence);
  const selectedDate = useMapStore((s) => s.selectedDate);
  const showHeatmap = useMapStore((s) => s.showHeatmap);
  const showFacilities = useMapStore((s) => s.showFacilities);
  const selectHotspot = useMapStore((s) => s.selectHotspot);
  const selectFacility = useMapStore((s) => s.selectFacility);
  const mapStyleId = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);

  // Basemap selector dropdown state
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    }
    if (isStyleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStyleDropdownOpen]);

  // TanStack Query data
  const { data: hotspots } = useHotspotsQuery();
  const { data: facilities } = useFacilitiesQuery();

  // Active map style configuration object
  const activeStyleOption = useMemo(() => {
    return MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];
  }, [mapStyleId]);

  // Dynamic MapLibre style spec memoized by apiKey & mapStyleId
  const mapStyleSpec = useMemo(() => {
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') return null;
    return buildMapStyle(apiKey, activeStyleOption.styleId);
  }, [apiKey, activeStyleOption.styleId]);

  // Filtered + converted GeoJSON (memoized)
  const filteredHotspots = useMemo(() => {
    if (!hotspots) return [];
    return filterHotspots(
      hotspots,
      activeHotspotTypes,
      minimumConfidence,
      selectedDate,
    );
  }, [hotspots, activeHotspotTypes, minimumConfidence, selectedDate]);

  const hotspotsGeoJSON = useMemo(
    () => (filteredHotspots.length > 0 ? hotspotsToGeoJSON(filteredHotspots) : EMPTY_GEOJSON),
    [filteredHotspots],
  );

  const facilitiesGeoJSON = useMemo(
    () => (facilities ? facilitiesToGeoJSON(facilities) : EMPTY_GEOJSON),
    [facilities],
  );

  // Selected hotspot GeoJSON for highlight
  const selectedHotspotGeoJSON = useMemo(() => {
    if (!selectedHotspotId || !filteredHotspots.length) return EMPTY_GEOJSON;
    const selected = filteredHotspots.filter((h) => h.id === selectedHotspotId);
    return selected.length > 0 ? hotspotsToGeoJSON(selected) : EMPTY_GEOJSON;
  }, [selectedHotspotId, filteredHotspots]);

  // Selected facility GeoJSON for highlight
  const selectedFacilityGeoJSON = useMemo(() => {
    if (!selectedFacilityId || !facilities) return EMPTY_GEOJSON;
    const selected = facilities.filter((f) => f.id === selectedFacilityId);
    return selected.length > 0 ? facilitiesToGeoJSON(selected) : EMPTY_GEOJSON;
  }, [selectedFacilityId, facilities]);

  // Click handlers
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (!features || features.length === 0) {
        selectHotspot(null);
        selectFacility(null);
        return;
      }

      const feature = features[0];
      if (
        feature.layer?.id === 'hotspot-points' ||
        feature.layer?.id === 'hotspot-points-selected'
      ) {
        const id = feature.properties?.id as string;
        if (id) selectHotspot(id);
      } else if (feature.layer?.id === 'facility-points') {
        const id = feature.properties?.id as string;
        if (id) selectFacility(id);
      }
    },
    [selectHotspot, selectFacility],
  );

  // Fly to selected feature
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedHotspotId && filteredHotspots.length) {
      const selected = filteredHotspots.find((h) => h.id === selectedHotspotId);
      if (selected) {
        map.flyTo({
          center: [selected.longitude, selected.latitude],
          zoom: Math.max(map.getZoom(), 11),
          duration: 1200,
        });
      }
    } else if (selectedFacilityId && facilities) {
      const selected = facilities.find((f) => f.id === selectedFacilityId);
      if (selected) {
        map.flyTo({
          center: [selected.longitude, selected.latitude],
          zoom: Math.max(map.getZoom(), 11),
          duration: 1200,
        });
      }
    }
  }, [selectedHotspotId, selectedFacilityId, filteredHotspots, facilities, mapRef]);

  // Cursor management
  const handleMouseEnter = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = 'pointer';
  }, [mapRef]);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = '';
  }, [mapRef]);

  // Missing API key error state
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return (
      <div className="relative w-full h-full bg-[#080C14] flex items-center justify-center">
        <div className="bg-[#0F1623] border border-[#FF4444]/40 rounded-lg p-6 max-w-md text-center">
          <p className="text-[#FF4444] font-bold text-lg mb-2">
            Missing Thunderforest API Key
          </p>
          <p className="text-[#7A8FA8] text-sm">
            Set <code className="text-[#E8EDF5] font-mono bg-[#162033] px-1.5 py-0.5 rounded">VITE_THUNDERFOREST_API_KEY</code> in
            your <code className="text-[#E8EDF5] font-mono bg-[#162033] px-1.5 py-0.5 rounded">.env</code> file
            and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ReactMapGL
        ref={mapRef}
        initialViewState={{
          longitude: GUJARAT_VIEWPORT.longitude,
          latitude: GUJARAT_VIEWPORT.latitude,
          zoom: GUJARAT_VIEWPORT.zoom,
        }}
        mapStyle={mapStyleSpec!}
        onClick={handleMapClick}
        interactiveLayerIds={['hotspot-points', 'facility-points']}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        attributionControl={true}
        reuseMaps
      >
        {/* ---- HEATMAP LAYER ---- */}
        {showHeatmap && (
          <Source
            id="hotspots-heat"
            type="geojson"
            data={hotspotsGeoJSON}
          >
            <Layer
              id="hotspot-heatmap"
              type="heatmap"
              paint={{
                'heatmap-weight': [
                  'interpolate',
                  ['linear'],
                  ['get', 'heatWeight'],
                  0, 0.1,
                  0.4, 0.6,
                  1.0, 1.8,
                ],
                'heatmap-intensity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  4, 0.6,
                  8, 1.6,
                  11, 3.2,
                  14, 5.5,
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  4, 16,
                  8, 24,
                  11, 32,
                  14, 38,
                ],
                'heatmap-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  4, 0.75,
                  9, 0.65,
                  14, 0.5,
                ],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0,0,0,0)',
                  0.04, 'rgba(255,235,59,0.25)', // Soft outer yellow fringe
                  0.18, '#FFC107',               // Bright Amber / Yellow
                  0.38, '#FF9800',               // Warm Orange
                  0.58, '#F4511E',               // Red-Orange
                  0.78, '#E53935',               // Vibrant Red
                  1.00, '#B71C1C',               // Deep Dark Red Core
                ],
              }}
            />
          </Source>
        )}

        {/* ---- HOTSPOT POINT LAYER ---- */}
        <Source
          id="hotspots-points"
          type="geojson"
          data={hotspotsGeoJSON}
        >
          <Layer
            id="hotspot-points-glow"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 6,
                10, 9,
                15, 14,
              ],
              'circle-color': [
                'match',
                ['get', 'type'],
                'industrial_fire', HOTSPOT_COLORS.industrial_fire,
                'gas_flare', HOTSPOT_COLORS.gas_flare,
                'agricultural', HOTSPOT_COLORS.agricultural,
                'wildfire', HOTSPOT_COLORS.wildfire,
                'unknown', HOTSPOT_COLORS.unknown,
                HOTSPOT_COLORS.unknown,
              ],
              'circle-opacity': 0.25,
              'circle-blur': 0.8,
            }}
          />
          <Layer
            id="hotspot-points"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 3.5,
                10, 5.5,
                15, 8,
              ],
              'circle-color': [
                'match',
                ['get', 'type'],
                'industrial_fire', HOTSPOT_COLORS.industrial_fire,
                'gas_flare', HOTSPOT_COLORS.gas_flare,
                'agricultural', HOTSPOT_COLORS.agricultural,
                'wildfire', HOTSPOT_COLORS.wildfire,
                'unknown', HOTSPOT_COLORS.unknown,
                HOTSPOT_COLORS.unknown,
              ],
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#080C14',
              'circle-opacity': 0.9,
            }}
          />
        </Source>

        {/* ---- FACILITY LAYER ---- */}
        {showFacilities && (
          <Source
            id="facilities-points"
            type="geojson"
            data={facilitiesGeoJSON}
          >
            <Layer
              id="facility-points"
              type="circle"
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  5, 4,
                  10, 6,
                  15, 9,
                ],
                'circle-color': '#2D7DD2',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#E8EDF5',
                'circle-opacity': 0.85,
              }}
            />
          </Source>
        )}

        {/* ---- SELECTED HOTSPOT HIGHLIGHT ---- */}
        <Source
          id="selected-hotspot"
          type="geojson"
          data={selectedHotspotGeoJSON}
        >
          <Layer
            id="hotspot-selected-glow"
            type="circle"
            paint={{
              'circle-radius': 18,
              'circle-color': '#FF4444',
              'circle-opacity': 0.2,
              'circle-blur': 0.6,
            }}
          />
          <Layer
            id="hotspot-points-selected"
            type="circle"
            paint={{
              'circle-radius': 8,
              'circle-color': '#FF4444',
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#E8EDF5',
              'circle-opacity': 1,
            }}
          />
        </Source>

        {/* ---- SELECTED FACILITY HIGHLIGHT ---- */}
        <Source
          id="selected-facility"
          type="geojson"
          data={selectedFacilityGeoJSON}
        >
          <Layer
            id="facility-selected-glow"
            type="circle"
            paint={{
              'circle-radius': 18,
              'circle-color': '#2D7DD2',
              'circle-opacity': 0.25,
              'circle-blur': 0.5,
            }}
          />
          <Layer
            id="facility-selected-point"
            type="circle"
            paint={{
              'circle-radius': 7,
              'circle-color': '#2D7DD2',
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#E8EDF5',
              'circle-opacity': 1,
            }}
          />
        </Source>
      </ReactMapGL>

      {/* Dynamic Thunderforest Basemap Selector Dropdown */}
      <div className="absolute top-4 right-4 z-20" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl transition-all cursor-pointer"
            style={{
              backgroundColor: '#111827',
              border: isStyleDropdownOpen ? '1px solid #2D7DD2' : '1px solid #1e293b',
              color: '#E8EDF5',
            }}
          >
            <Layers style={{ width: 14, height: 14, color: '#2D7DD2' }} />
            <span>{activeStyleOption.label}</span>
            <ChevronDown style={{ width: 12, height: 12, color: '#6B7280' }} />
          </button>

          {/* Dropdown Options List */}
          {isStyleDropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 z-50 rounded-xl shadow-2xl overflow-hidden py-1"
              style={{
                width: 220,
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
                boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
              }}
            >
              <div
                className="px-3 py-1.5 border-b border-[#1e293b] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center justify-between"
              >
                <span>THUNDERFOREST BASEMAPS</span>
              </div>
              <div className="py-1">
                {MAP_STYLES.map((style) => {
                  const isSelected = style.id === mapStyleId;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setMapStyle(style.id);
                        setIsStyleDropdownOpen(false);
                      }}
                      className="w-full flex items-start justify-between px-3 py-2 text-left hover:bg-[#1E2D45] transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'rgba(45,125,210,0.15)' : 'transparent',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#2D7DD2' : '#E8EDF5',
                          }}
                        >
                          {style.label}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: '#6B7280',
                            marginTop: 1,
                          }}
                        >
                          {style.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check style={{ width: 14, height: 14, color: '#2D7DD2', marginTop: 2, flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
