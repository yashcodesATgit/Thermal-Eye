export type MapStyleId =
  | 'cycle'
  | 'atlas'
  | 'transport'
  | 'transport-dark'
  | 'landscape';

export interface MapStyleOption {
  id: MapStyleId;
  label: string;
  styleId: string;
  description: string;
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'cycle',
    label: 'Cycle Map',
    styleId: 'cycle',
    description: 'Cycling & detailed geographic context',
  },
  {
    id: 'atlas',
    label: 'Atlas',
    styleId: 'atlas',
    description: 'Clean & minimal',
  },
  {
    id: 'transport',
    label: 'Transport',
    styleId: 'transport',
    description: 'Roads & transportation',
  },
  {
    id: 'transport-dark',
    label: 'Transport Dark',
    styleId: 'transport-dark',
    description: 'Dark transportation map',
  },
  {
    id: 'landscape',
    label: 'Landscape',
    styleId: 'landscape',
    description: 'Terrain & natural features',
  },
];

export function getThunderforestTileUrl(styleId: string, apiKey: string): string {
  return `https://api.thunderforest.com/${styleId}/{z}/{x}/{y}.png?apikey=${apiKey}`;
}
