import { PayrollRow } from '../types';

export function calculateRemuneracionTotal(rows: PayrollRow[]): number {
  return rows.reduce((sum, r) => sum + (r.remuneracionTotal || 0), 0);
}
