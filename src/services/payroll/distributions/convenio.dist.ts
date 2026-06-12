import { PayrollRow, DistributionItem } from '../types';

export function calculateConvenioDist(rows: PayrollRow[]): DistributionItem[] {
  const dist: Record<string, number> = {};
  rows.forEach(r => {
    const label = String(r.convenio || 'N/A').trim();
    dist[label] = (dist[label] || 0) + 1;
  });

  return Object.entries(dist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
