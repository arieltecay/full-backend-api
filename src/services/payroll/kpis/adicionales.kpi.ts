import { PayrollRow } from '../types';

export function calculateAdicionales(rows: PayrollRow[]): number {
  return rows.reduce((sum, r) => sum + (r.adicionales || 0), 0);
}
