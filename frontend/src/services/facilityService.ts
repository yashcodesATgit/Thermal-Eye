import type { Facility } from '../types/facility';
import mockFacilities from '../data/mock_facilities.json';

/**
 * Fetch facility data.
 * Phase 2: returns local mock data.
 * Phase 7+: will call FastAPI backend via axios.
 */
export async function fetchFacilities(): Promise<Facility[]> {
  return Promise.resolve(mockFacilities as Facility[]);
}
