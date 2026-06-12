import { PayrollRow, DistributionItem } from '../types';

export function calculateObraSocialDist(rows: PayrollRow[]): DistributionItem[] {
  const dist: Record<string, number> = {};
  rows.forEach(r => {
    const label = String(r.obraSocial || 'N/A').trim();
    dist[label] = (dist[label] || 0) + 1;
  });

  return Object.entries(dist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
