import type { StyleSpecification } from 'maplibre-gl';

export type MapStyleId = 'dark' | 'bright' | 'positron' | 'liberty' | 'terrain';

export interface MapStyleConfig {
  id: MapStyleId;
  name: string;
  label: string;
  styleUrl?: string;
  tileUrl?: string;
  tiles?: string[];
  provider: string;
  requiresApiKey: boolean;
  attribution: string;
  type: 'vector' | 'raster';
  description: string;
}

export const DEFAULT_MAP_STYLE_ID: MapStyleId = 'bright';

export const MAP_STYLES: MapStyleConfig[] = [
  {
    id: 'dark',
    name: 'Dark',
    label: 'Dark',
    styleUrl: 'https://tiles.openfreemap.org/styles/dark',
    provider: 'OpenFreeMap',
    requiresApiKey: false,
    attribution:
      '&copy; <a href="https://openfreemap.org">OpenFreeMap</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    type: 'vector',
    description: 'Primary dark vector theme with high thermal contrast',
  },
  {
    id: 'bright',
    name: 'Bright',
    label: 'Bright',
    styleUrl: 'https://tiles.openfreemap.org/styles/bright',
    provider: 'OpenFreeMap',
    requiresApiKey: false,
    attribution:
      '&copy; <a href="https://openfreemap.org">OpenFreeMap</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    type: 'vector',
    description: 'Clean modern light vector theme with clear geography',
  },
  {
    id: 'positron',
    name: 'Positron',
    label: 'Positron',
    styleUrl: 'https://tiles.openfreemap.org/styles/positron',
    provider: 'OpenFreeMap',
    requiresApiKey: false,
    attribution:
      '&copy; <a href="https://openfreemap.org">OpenFreeMap</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    type: 'vector',
    description: 'Minimal light vector theme optimized for analytical heatmaps',
  },
  {
    id: 'liberty',
    name: 'Liberty',
    label: 'Liberty',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    provider: 'OpenFreeMap',
    requiresApiKey: false,
    attribution:
      '&copy; <a href="https://openfreemap.org">OpenFreeMap</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    type: 'vector',
    description: 'Detailed geographic vector map with rich feature labels',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    label: 'Terrain',
    tileUrl: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
    tiles: [
      'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
    ],
    provider: 'OpenTopoMap',
    requiresApiKey: false,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    type: 'raster',
    description: 'Topographic & terrain-oriented context',
  },
];

export function buildMapStyleSpec(config: MapStyleConfig): string | StyleSpecification {
  if (config.type === 'vector' && config.styleUrl) {
    return config.styleUrl;
  }
  return {
    version: 8,
    name: config.name,
    sources: {
      'basemap-source': {
        type: 'raster',
        tiles: config.tiles || [config.tileUrl!],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 22,
        attribution: config.attribution,
      },
    },
    layers: [
      {
        id: 'basemap-layer',
        type: 'raster',
        source: 'basemap-source',
      },
    ],
  };
}
