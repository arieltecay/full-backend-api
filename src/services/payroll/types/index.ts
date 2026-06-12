export type PayrollValue = string | number | boolean | null | undefined;

export interface PayrollMetadata {
  cuit?: string;
  period?: string;
  sequence?: string;
  contribuyente?: string;
  [key: string]: PayrollValue;
}

export interface PayrollRow {
  legajo?: string | number;
  apellidoNombre?: string;
  sucursal?: string;
  convenio?: string;
  antiguedad?: number;
  netoAPagar?: number;
  remuneracionTotal?: number;
  adicionales?: number;
  deducciones?: number;
  deducciones_os?: number;
  deducciones_prev?: number;
  hijos?: number;
  obraSocial?: string;
  condicion?: string;
  actividad?: string;
  localidad?: string;
  [key: string]: PayrollValue;
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
    totalDeducciones: number;
    totalHijos: number;
    masaSalarial: number;
    promedioNeto: number;
    totalNeto: number;
    [key: string]: number;
  };
  distributions: {
    obraSocial: DistributionItem[];
    condicion: DistributionItem[];
    actividad: DistributionItem[];
    localidad: DistributionItem[];
    sucursal?: DistributionItem[];
    convenio?: DistributionItem[];
    [key: string]: DistributionItem[] | undefined;
  };
}

export interface PayrollFilter {
  sucursal?: string;
  convenio?: string;
  antiguedadRange?: string;
  searchTerm?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
