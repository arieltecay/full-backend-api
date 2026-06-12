import { PayrollRow } from '../types';

export function calculateDeducciones(rows: PayrollRow[]): number {
  return rows.reduce((sum, r) => sum + (r.deducciones || 0), 0);
}
