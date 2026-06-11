import { PayrollStats, DistributionItem } from '../../types/payroll.types.js';

export class PayrollAnalyticsService {
  /**
   * Generates a comprehensive analytics report from payroll raw data.
   * Designed to be extensible for future metric requests.
   */
  static calculateStats(data: any[]): PayrollStats {
    const totalEmployees = data.length;
    
    // Initial KPIs
    const summary: Record<string, number> = {
      totalEmployees,
      totalRemuneration: 0,
      totalAdicionales: 0,
      totalHijos: 0,
    };

    // Generic distribution mapper
    const distributions: Record<string, Record<string, number>> = {
      obraSocial: {},
      condicion: {},
      actividad: {},
      localidad: {},
    };

    data.forEach(row => {
      // Aggregate numeric KPIs
      summary.totalRemuneration += row['Remuneración Total'] || 0;
      summary.totalAdicionales += row['Adicionales'] || 0;
      summary.totalHijos += row['Hijos'] || 0;

      // New Metric Opportunities (Generic implementation)
      this.updateDistribution(distributions.obraSocial, row['Obra Social']);
      this.updateDistribution(distributions.condicion, row['Condición']);
      this.updateDistribution(distributions.actividad, row['Actividad']);
      this.updateDistribution(distributions.localidad, row['Localidad']);
    });

    // Post-calculation
    summary.averageRemuneration = totalEmployees > 0 ? summary.totalRemuneration / totalEmployees : 0;

    return {
      summary: {
        totalEmployees: summary.totalEmployees,
        totalRemuneration: summary.totalRemuneration,
        averageRemuneration: summary.averageRemuneration,
        totalAdicionales: summary.totalAdicionales,
        totalHijos: summary.totalHijos,
        ...summary
      },
      distributions: {
        obraSocial: this.formatAndSortDist(distributions.obraSocial),
        condicion: this.formatAndSortDist(distributions.condicion),
        actividad: this.formatAndSortDist(distributions.actividad),
        localidad: this.formatAndSortDist(distributions.localidad),
      }
    };
  }

  private static updateDistribution(dist: Record<string, number>, key: any) {
    const label = String(key || 'N/A').trim();
    dist[label] = (dist[label] || 0) + 1;
  }

  private static formatAndSortDist(dist: Record<string, number>): DistributionItem[] {
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sorted by value for better charting
  }
}
