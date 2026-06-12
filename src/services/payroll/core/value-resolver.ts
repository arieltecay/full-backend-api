/**
 * Helper para obtener valores de forma segura, intentando la key normalizada 
 * y fallbacks de nombres comunes por compatibilidad con datos viejos o diversos.
 */
export class ValueResolver {
  static getNumeric(row: any, key: string, fallbacks: string[] = []): number {
    if (typeof row[key] === 'number') return row[key];
    
    // Intentar fallbacks
    for (const fb of fallbacks) {
      const val = row[fb];
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const cleaned = val.replace(/\./g, '').replace(/,/g, '.');
        const num = parseFloat(cleaned);
        if (!isNaN(num)) return num;
      }
    }
    return 0;
  }

  static getString(row: any, key: string, fallbacks: string[] = []): string {
    if (typeof row[key] === 'string' && row[key].trim()) return row[key].trim();
    
    for (const fb of fallbacks) {
      const val = row[fb];
      if (typeof val === 'string' && val.trim()) return val.trim();
      if (val !== undefined && val !== null) return String(val).trim();
    }
    return '';
  }
}
