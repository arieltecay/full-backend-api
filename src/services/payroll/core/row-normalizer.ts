import { PayrollRow } from '../types';
import { ValueResolver } from './value-resolver';

/**
 * Garantiza que cada fila de la nómina tenga una estructura camelCase consistente
 * antes de ser procesada por la analítica o enviada al frontend.
 */
export class RowNormalizer {
  static normalize(row: any): PayrollRow {
    const bruto = ValueResolver.getNumeric(row, 'remuneracionTotal', ['Remuneración Total', 'REMUNERACIÓN TOTAL', 'Total Bruto', 'Bruto']);
    
    const deducSS = ValueResolver.getNumeric(row, 'deducciones', ['Total Aportes SS', 'Total Aportes SS_1', 'Aportes SS', 'Aporte Previsional']);
    const deducOS = ValueResolver.getNumeric(row, 'deducciones_os', ['Total Aportes OS', 'Aporte OS', 'Aportes OS']);
    const totalDeduc = deducSS + deducOS;

    const netoOriginal = ValueResolver.getNumeric(row, 'netoAPagar', ['Neto a Pagar', 'NETO A PAGAR', 'Neto', 'Liquido']);
    const netoCalculado = netoOriginal > 0 ? netoOriginal : (bruto - totalDeduc);

    return {
      legajo:            ValueResolver.getString(row, 'legajo', ['Legajo', 'LEGAJO', 'ID']),
      apellidoNombre:    ValueResolver.getString(row, 'apellidoNombre', ['Apellido y Nombre', 'APELLIDO Y NOMBRE', 'Nombre']),
      sucursal:          ValueResolver.getString(row, 'sucursal', ['Sucursal', 'SUCURSAL', 'Planta', 'Centro de Costos']),
      convenio:          ValueResolver.getString(row, 'convenio', ['Convenio', 'CONVENIO', 'CCT', 'Sindicato']),
      antiguedad:        ValueResolver.getNumeric(row, 'antiguedad', ['Antigüedad (Años)', 'Antigüedad Total', 'Años']),
      netoAPagar:        netoCalculado,
      remuneracionTotal: bruto,
      adicionales:       ValueResolver.getNumeric(row, 'adicionales', ['Adicionales', 'CONCEPTOS NO REMUN.', 'Extras', 'Premios']),
      deducciones:       totalDeduc,
      deducciones_os:    deducOS,
      deducciones_prev:  deducSS,
      hijos:             ValueResolver.getNumeric(row, 'hijos', ['Hijos', 'HIJOS', 'Cargas', 'Cargas Fam.']),
      obraSocial:        ValueResolver.getString(row, 'obraSocial', ['Obra Social', 'O.S.', 'OS']),
      condicion:         ValueResolver.getString(row, 'condicion', ['Condición', 'CONDICIÓN', 'Situación']),
      actividad:         ValueResolver.getString(row, 'actividad', ['Actividad', 'ACTIVIDAD', 'Cargo']),
      localidad:         ValueResolver.getString(row, 'localidad', ['Localidad', 'LOCALIDAD', 'Ciudad']),
    };
  }

  static normalizeAll(rows: any[]): PayrollRow[] {
    return rows.map(r => this.normalize(r));
  }
}
