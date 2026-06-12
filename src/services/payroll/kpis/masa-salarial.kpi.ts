import { PayrollRow } from '../types';

export function calculateMasaSalarial(rows: PayrollRow[]): number {
  return rows.reduce((sum, r) => sum + (r.netoAPagar || 0), 0);
}
