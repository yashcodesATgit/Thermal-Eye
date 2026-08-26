import type { Hotspot } from '../types/hotspot';
import mockHotspots from '../data/mock_hotspots.json';

/**
 * Fetch hotspot data.
 * Phase 2: returns local mock data.
 * Phase 7+: will call FastAPI backend via axios.
 */
export async function fetchHotspots(): Promise<Hotspot[]> {
  // Simulate async data fetch for architecture parity with future API
  return Promise.resolve(mockHotspots as Hotspot[]);
}
