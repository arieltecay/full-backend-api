/**
 * Diccionario de sinónimos para normalizar encabezados de payroll.
 * Mapea variaciones comunes en archivos CSV/Excel a keys estándar internas.
 */
const HEADERS_MAP: Record<string, string> = {
  // Legajo
  'LEGAJO': 'legajo',
  'LEG.': 'legajo',
  'LEG': 'legajo',
  'NRO. LEGAJO': 'legajo',
  'ID': 'legajo',
  
  // Apellido y Nombre
  'APELLIDO Y NOMBRE': 'apellidoNombre',
  'NOMBRE': 'apellidoNombre',
  'EMPLEADO': 'apellidoNombre',
  'APELLIDO': 'apellidoNombre',
  'NOMBRE Y APELLIDO': 'apellidoNombre',
  
  // Sucursal
  'SUCURSAL': 'sucursal',
  'SUC.': 'sucursal',
  'PLANTA': 'sucursal',
  'CENTRO DE COSTOS': 'sucursal',
  'CENTRO DE COSTO': 'sucursal',
  'SUCURSAL / PLANTA': 'sucursal',
  
  // Convenio
  'CONVENIO': 'convenio',
  'CONV.': 'convenio',
  'CCT': 'convenio',
  'SINDICATO/CONVENIO': 'convenio',
  'SINDICATO': 'convenio',
  
  // Neto a Pagar / Remuneración
  'NETO A PAGAR': 'netoAPagar',
  'NETO': 'netoAPagar',
  'LIQUIDO': 'netoAPagar',
  'LÍQUIDO': 'netoAPagar',
  'SUELDO NETO': 'netoAPagar',
  'NETO A COBRAR': 'netoAPagar',
  'A COBRAR': 'netoAPagar',
  'REMUNERACION TOTAL': 'remuneracionTotal',
  'TOTAL BRUTO': 'remuneracionTotal',
  'BRUTO': 'remuneracionTotal',
  'REM. TOTAL': 'remuneracionTotal',
  'SUELDO BRUTO': 'remuneracionTotal',
  'TOTAL': 'remuneracionTotal',
  
  // Adicionales / Variables
  'ADICIONALES': 'adicionales',
  'CONCEPTOS NO REMUN.': 'adicionales',
  'EXTRAS': 'adicionales',
  'NO REMUNERATIVOS': 'adicionales',
  'ADIC.': 'adicionales',
  'REM. VARIABLES': 'adicionales',
  'ADICIONALES NO REMUNERATIVOS': 'adicionales',
  'PREMIOS': 'adicionales',
  
  // Deducciones / Aportes
  'DEDUCCIONES': 'deducciones',
  'TOTAL APORTES SS': 'deducciones',
  'TOTAL APORTES OS': 'deducciones_os',
  'DEDUC.': 'deducciones',
  'RETENCIONES': 'deducciones',
  'DESCUENTOS': 'deducciones',
  'APORTES': 'deducciones',
  'APORTE PREVISIONAL': 'deducciones_prev',
  
  // Antigüedad
  'ANTIGUEDAD': 'antiguedad',
  'ANTIG.': 'antiguedad',
  'ANTIGUEDAD (ANOS)': 'antiguedad',
  'ANTIGUEDAD TOTAL': 'antiguedad',
  'ANOS': 'antiguedad',
  
  // Obra Social
  'OBRA SOCIAL': 'obraSocial',
  'O.S.': 'obraSocial',
  'OS': 'obraSocial',
  'OBRASOC': 'obraSocial',
  
  // Condición
  'CONDICION': 'condicion',
  'COND.': 'condicion',
  'TIPO': 'condicion',
  'SITUACION': 'condicion',
  
  // Hijos
  'HIJOS': 'hijos',
  'CARGAS': 'hijos',
  'FAMILIA': 'hijos',
  'CARGAS FAM.': 'hijos',
  'CARGAS DE FAMILIA': 'hijos',
  
  // Actividad
  'ACTIVIDAD': 'actividad',
  'ACT.': 'actividad',
  'PUESTO': 'actividad',
  'CARGO': 'actividad',
  
  // Localidad
  'LOCALIDAD': 'localidad',
  'LOC.': 'localidad',
  'CIUDAD': 'localidad',
  'DOMICILIO': 'localidad',
};

/**
 * Normaliza un string de encabezado eliminando acentos, espacios y convirtiendo a mayúsculas
 * para buscar en el mapa de sinónimos.
 */
function normalizeHeaderKey(header: string): string {
  return header
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
}

/**
 * Mapea una fila cruda del CSV/Excel a una estructura de PayrollRow normalizada.
 */
export function mapPayrollRow(rawRow: Record<string, any>): any {
  const mapped: any = {};
  
  // Primero guardamos todas las columnas originales por si acaso
  for (const [key, value] of Object.entries(rawRow)) {
    const normalizedKey = normalizeHeaderKey(key);
    const standardKey = HEADERS_MAP[normalizedKey];
    
    if (standardKey) {
      mapped[standardKey] = value;
    } else {
      // Si no es una key crítica conocida, la guardamos tal cual (camelCase sugerido)
      const camelKey = key.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      mapped[camelKey] = value;
    }
  }

  return mapped;
}

/**
 * Valida que la fila contenga las columnas mínimas obligatorias.
 */
export function validateRequiredColumns(mappedRow: any): boolean {
  // Obligatorio Legajo y al menos un valor monetario principal
  return !!(
    (mappedRow.legajo !== undefined && mappedRow.legajo !== null) && 
    (mappedRow.netoAPagar !== undefined || mappedRow.remuneracionTotal !== undefined)
  );
}
