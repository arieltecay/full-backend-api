import { PayrollRow } from '../types';

export function calculateDotacion(rows: PayrollRow[]): number {
  return rows.length;
}
