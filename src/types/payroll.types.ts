export type PayrollValue = string | number | boolean | null | undefined;

export interface PayrollMetadata {
  cuit?: string;
  period?: string;
  sequence?: string;
  contribuyente?: string;
  [key: string]: PayrollValue;
}

export interface PayrollRow {
  Legajo?: string | number;
  'Apellido y Nombre'?: string;
  Sucursal?: string;
  Convenio?: string;
  'Antigüedad (Años)'?: number;
  'Neto a Pagar'?: number;
  'Remuneración Total'?: number;
  Adicionales?: number;
  Hijos?: number;
  'Obra Social'?: string;
  Condición?: string;
  Actividad?: string;
  Localidad?: string;
  [key: string]: PayrollValue; // Permite columnas dinámicas adicionales de forma segura
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface PayrollStats {
  summary: {
    totalEmployees: number;
    totalRemuneration: number;
    averageRemuneration: number;
    totalAdicionales: number;
    totalHijos: number;
    [key: string]: number;
  };
  distributions: {
    obraSocial: DistributionItem[];
    condicion: DistributionItem[];
    actividad: DistributionItem[];
    localidad: DistributionItem[];
    [key: string]: DistributionItem[];
  };
}

export interface PayrollFilter {
  sucursal?: string;
  convenio?: string;
  antiguedadRange?: string;
  searchTerm?: string;
}
