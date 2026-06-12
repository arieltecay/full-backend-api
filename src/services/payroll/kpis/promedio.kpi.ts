import { PayrollRow } from '../types';

export function calculatePromedio(rows: PayrollRow[], masaSalarial: number): number {
  return rows.length > 0 ? masaSalarial / rows.length : 0;
}
