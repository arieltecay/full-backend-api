import { PayrollRow } from '../types';

export function calculateHijos(rows: PayrollRow[]): number {
  return rows.reduce((sum, r) => sum + (r.hijos || 0), 0);
}
