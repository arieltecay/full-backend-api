import { PayrollRow, PayrollFilter } from '../types';

/**
 * Único motor responsable de aplicar filtros a la nómina (Server-Side).
 */
export class FilterEngine {
  static apply(rows: PayrollRow[], filters: PayrollFilter): PayrollRow[] {
    return rows.filter(row => {
      // Filtro de Sucursal
      if (filters.sucursal && row.sucursal !== filters.sucursal) {
        return false;
      }

      // Filtro de Convenio
      if (filters.convenio && row.convenio !== filters.convenio) {
        return false;
      }

      // Filtro de Antigüedad
      if (filters.antiguedadRange) {
        const [min, max] = filters.antiguedadRange.split('-').map(Number);
        const val = Number(row.antiguedad) || 0;
        if (val < min || (max && val > max)) return false;
      }

      // Término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matches = 
          String(row.apellidoNombre || '').toLowerCase().includes(term) ||
          String(row.legajo || '').toLowerCase().includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }
}
