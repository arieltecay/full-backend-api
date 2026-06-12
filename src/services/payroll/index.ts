import { PayrollRow, PayrollStats, PayrollFilter } from './types';
import { RowNormalizer } from './core/row-normalizer';
import { FilterEngine } from './core/filter-engine';

// KPIs
import { calculateDotacion } from './kpis/dotacion.kpi';
import { calculateMasaSalarial } from './kpis/masa-salarial.kpi';
import { calculatePromedio } from './kpis/promedio.kpi';
import { calculateAdicionales } from './kpis/adicionales.kpi';
import { calculateDeducciones } from './kpis/deducciones.kpi';
import { calculateHijos } from './kpis/hijos.kpi';
import { calculateRemuneracionTotal } from './kpis/remuneracion.kpi';

// Distributions
import { calculateObraSocialDist } from './distributions/obra-social.dist';
import { calculateCondicionDist } from './distributions/condicion.dist';
import { calculateActividadDist } from './distributions/actividad.dist';
import { calculateLocalidadDist } from './distributions/localidad.dist';
import { calculateSucursalDist } from './distributions/sucursal.dist';
import { calculateConvenioDist } from './distributions/convenio.dist';

/**
 * PayrollService: Fachada única para el dominio de nóminas.
 * Orquestador de la arquitectura atómica v3.1.
 */
export class PayrollService {
  /**
   * Normaliza un array de filas crudas a la estructura camelCase estándar.
   */
  static normalizeRows(rows: any[]): PayrollRow[] {
    return RowNormalizer.normalizeAll(rows);
  }

  /**
   * Filtra las filas normalizadas según los criterios del frontend.
   */
  static filterRows(rows: PayrollRow[], filters: PayrollFilter): PayrollRow[] {
    return FilterEngine.apply(rows, filters);
  }

  /**
   * Realiza el análisis completo (KPIs + Gráficos) sobre un conjunto de filas (ya filtradas o no).
   */
  static analyze(rows: PayrollRow[]): PayrollStats {
    const masaSalarial = calculateMasaSalarial(rows);
    const totalEmployees = calculateDotacion(rows);

    return {
      summary: {
        totalEmployees,
        totalRemuneration: calculateRemuneracionTotal(rows),
        averageRemuneration: totalEmployees > 0 ? calculateRemuneracionTotal(rows) / totalEmployees : 0,
        totalAdicionales: calculateAdicionales(rows),
        totalDeducciones: calculateDeducciones(rows),
        totalHijos: calculateHijos(rows),
        masaSalarial: masaSalarial,
        promedioNeto: calculatePromedio(rows, masaSalarial),
        totalNeto: masaSalarial,
      },
      distributions: {
        obraSocial: calculateObraSocialDist(rows),
        condicion: calculateCondicionDist(rows),
        actividad: calculateActividadDist(rows),
        localidad: calculateLocalidadDist(rows),
        sucursal: calculateSucursalDist(rows),
        convenio: calculateConvenioDist(rows),
      }
    };
  }

  /**
   * Proceso completo: Filtrado + Análisis.
   */
  static filterAndAnalyze(rows: any[], filters: PayrollFilter): PayrollStats {
    const normalized = this.normalizeRows(rows);
    const filtered = this.filterRows(normalized, filters);
    return this.analyze(filtered);
  }
}
