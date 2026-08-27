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
  type: HotspotType;  // Raw FIRMS telemetry type
  brightness: number;
  confidence: number; // NASA FIRMS confidence
  severity: Severity;
  timestamp: string;
  facilityId: string | null;
  status: HotspotStatus;
  // Phase 6 ML Prediction fields
  mlType?: HotspotType;
  mlConfidence?: number;
  modelVersion?: string;
  mlExplanation?: string | Record<string, number>;
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
