import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../alertService';
import type { Alert } from '../../types/alert';

export function useAlertsQuery() {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });
}
