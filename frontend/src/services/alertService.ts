import type { Alert } from '../types/alert';
import mockAlerts from '../data/mock_alerts.json';

export async function fetchAlerts(): Promise<Alert[]> {
  return Promise.resolve(mockAlerts as Alert[]);
}
