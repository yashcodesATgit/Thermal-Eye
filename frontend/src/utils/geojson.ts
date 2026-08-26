import type { Hotspot, HotspotType } from '../types/hotspot';
import type { Facility } from '../types/facility';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Convert Hotspot[] to GeoJSON FeatureCollection.
 * Coordinates are [longitude, latitude] per GeoJSON spec.
 */
export function hotspotsToGeoJSON(hotspots: Hotspot[]): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: hotspots.map((h) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [h.longitude, h.latitude] as [number, number],
      },
      properties: {
        id: h.id,
        type: h.type,
        brightness: h.brightness,
        confidence: h.confidence,
        severity: h.severity,
        timestamp: h.timestamp,
        facilityId: h.facilityId,
        status: h.status,
        // Normalized brightness for heatmap weight (0-1 range)
        normalizedBrightness: Math.min(1, Math.max(0, (h.brightness - 240) / (360 - 240))),
        // Combined weight using brightness and confidence
        heatWeight: Math.min(
          1,
          Math.max(
            0,
            ((h.brightness - 240) / (360 - 240)) * 0.7 +
              (h.confidence / 100) * 0.3,
          ),
        ),
      },
    })),
  };
}

/**
 * Convert Facility[] to GeoJSON FeatureCollection.
 */
export function facilitiesToGeoJSON(facilities: Facility[]): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: facilities.map((f) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [f.longitude, f.latitude] as [number, number],
      },
      properties: {
        id: f.id,
        name: f.name,
        type: f.type,
        city: f.city,
        state: f.state,
        country: f.country,
      },
    })),
  };
}

/**
 * Filter hotspots by type, confidence, and date.
 */
export function filterHotspots(
  hotspots: Hotspot[],
  activeTypes: HotspotType[],
  minimumConfidence: number,
  selectedDate: string,
): Hotspot[] {
  return hotspots.filter((h) => {
    if (!activeTypes.includes(h.type)) return false;
    if (h.confidence < minimumConfidence) return false;
    // Filter by selected date: show hotspots from that day and before
    const hotspotDate = h.timestamp.slice(0, 10);
    if (hotspotDate > selectedDate) return false;
    return true;
  });
}
