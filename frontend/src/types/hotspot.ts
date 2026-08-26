export type HotspotType =
  | 'industrial_fire'
  | 'gas_flare'
  | 'agricultural'
  | 'wildfire'
  | 'unknown';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type HotspotStatus = 'active' | 'resolved' | 'monitoring';

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  type: HotspotType;
  brightness: number;
  confidence: number;
  severity: Severity;
  timestamp: string;
  facilityId: string | null;
  status: HotspotStatus;
}

export const HOTSPOT_COLORS: Record<HotspotType, string> = {
  industrial_fire: '#FF4444',
  gas_flare: '#FF8C00',
  agricultural: '#F5C518',
  wildfire: '#3DB86B',
  unknown: '#4A5568',
};

export const HOTSPOT_LABELS: Record<HotspotType, string> = {
  industrial_fire: 'Industrial Fire',
  gas_flare: 'Gas Flare',
  agricultural: 'Agricultural',
  wildfire: 'Wildfire',
  unknown: 'Unknown',
};
