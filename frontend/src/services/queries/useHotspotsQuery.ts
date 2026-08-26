import { useQuery } from '@tanstack/react-query';
import { fetchHotspots } from '../hotspotService';
import type { Hotspot } from '../../types/hotspot';

export function useHotspotsQuery() {
  return useQuery<Hotspot[]>({
    queryKey: ['hotspots'],
    queryFn: fetchHotspots,
  });
}
