import XLSX from 'xlsx';

export class ExcelService {
  /**
   * Limpia strings de moneda argentina (1.234,56) a números (1234.56)
   */
  private static cleanCurrency(value: any): any {
    if (typeof value === 'string' && value.includes(',')) {
      // Quitamos puntos de miles y reemplazamos coma decimal por punto
      const cleanValue = value.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(cleanValue);
      return isNaN(num) ? value : num;
    }
    return value;
  }

  /**
   * Lee un archivo Excel/CSV y devuelve datos estructurados con metadatos
   */
  static parseExcel(filePath: string): { metadata: any, data: any[] } {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Obtenemos los datos crudos como array de arrays para inspeccionar las primeras filas
      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let metadata = {};
      let dataStartIndex = 0;

      // Detectar si la primera fila es metadato (CUIT, Período, etc.)
      if (rawRows[0] && rawRows[0][0]?.toString().includes('CUIT:')) {
        const metaLine = rawRows[0].join(' ');
        metadata = {
          cuit: metaLine.match(/CUIT:\s*([\d-]+)/)?.[1],
          period: metaLine.match(/Período\s*(\d{2}\s\d{4})/)?.[1],
          company: metaLine.match(/Contribuyente:\s*([^,]+)/)?.[1]?.trim(),
        };
        dataStartIndex = 1; // La tabla real empieza después de los metadatos
      }

      // Convertimos la tabla a JSON usando la fila de headers correcta
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { range: dataStartIndex });

      // Limpiamos los datos (conversión de moneda a números)
      const cleanData = data.map(row => {
        const newRow: any = {};
        for (const key in row) {
          newRow[key] = this.cleanCurrency(row[key]);
        }
        return newRow;
      });
      
      return { metadata, data: cleanData };
    } catch (error) {
      console.error('❌ Error al procesar Excel:', error);
      throw new Error('No se pudo procesar el archivo. Verifica el formato.');
    }
  }
}

