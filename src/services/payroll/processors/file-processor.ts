import axios from 'axios';
import { parse } from '@fast-csv/parse';
import { Transform } from 'stream';
import * as XLSX from 'xlsx';
import { PayrollMetadata, PayrollRow } from '../types';
import { mapPayrollRow, validateRequiredColumns } from './mapper';

export interface FileProcessorInterface {
  process(fileUrl: string): Promise<{ metadata: PayrollMetadata; rows: PayrollRow[] }>;
}

function normalizeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  
  const str = String(value).trim();
  if (!str) return 0;
  
  // Clean thousand separator (.) and replace decimal comma (,) with dot (.)
  // Example: "1.234,56" -> "1234.56"
  const cleaned = str.replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

export class CsvProcessor implements FileProcessorInterface {
  async process(fileUrl: string): Promise<{ metadata: PayrollMetadata; rows: PayrollRow[] }> {
    let metadata: PayrollMetadata = {};
    
    // 1. Intentar leer metadatos de la primera línea (primeros 4KB)
    try {
      const headResponse = await axios.get(fileUrl, { 
        headers: { Range: 'bytes=0-4096' },
        responseType: 'text'
      });
      const firstLine = headResponse.data.split('\n')[0];
      metadata = this.parseMetadataString(firstLine);
    } catch (err) {
      console.error('[CsvProcessor] Error al procesar primera línea de metadatos:', err);
    }

    // 2. Parsear el resto del CSV usando streams
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    const rows: PayrollRow[] = [];

    const transformStream = new Transform({
      objectMode: true,
      transform: (row, _, cb) => {
        const transformed: PayrollRow = {};
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'string') {
            const numericPattern = /^-?[\d.]+,?\d*$/;
            if (numericPattern.test(value) && !key.toLowerCase().includes('cuit') && !key.toLowerCase().includes('legajo')) {
              transformed[key] = normalizeNumber(value);
            } else {
              transformed[key] = value.trim();
            }
          } else {
            transformed[key] = value as string | number | boolean | null | undefined;
          }
        }

        // Aplicar Mapeo Inteligente (v2)
        const normalized = mapPayrollRow(transformed);
        
        // Validación básica de la primera fila con datos
        if (rows.length === 0 && !validateRequiredColumns(normalized)) {
          return cb(new Error('El archivo no contiene las columnas mínimas requeridas (Legajo y Neto a Pagar)'));
        }

        cb(null, normalized);
      }
    });

    return new Promise((resolve, reject) => {
      response.data
        .pipe(parse({ 
          headers: (headers) => {
            const seen = new Set();
            return headers.map(h => {
              if (!h) return 'empty_header';
              let name = h.trim();
              let counter = 1;
              while (seen.has(name)) {
                name = `${h.trim()}_${counter++}`;
              }
              seen.add(name);
              return name;
            });
          }, 
          trim: true, 
          ignoreEmpty: true, 
          delimiter: ',', 
          skipLines: 1 
        }))
        .pipe(transformStream)
        .on('error', (err: any) => {
          console.error('[CsvProcessor] Error en el stream:', err.message);
          reject(err);
        })
        .on('data', (row: PayrollRow) => rows.push(row))
        .on('end', () => resolve({ metadata, rows }));
    });
  }

  private parseMetadataString(line: string): PayrollMetadata {
    const cuitMatch = line.match(/CUIT:\s*([\d-]+)/i);
    const periodMatch = line.match(/Período\s*([\d\s/-]+)/i);
    const seqMatch = line.match(/Secuencia:\s*([^ ,]+)/i);
    const contMatch = line.match(/Contribuyente:\s*([^,]+)/i);

    return {
      cuit: cuitMatch ? cuitMatch[1].trim() : undefined,
      period: periodMatch ? periodMatch[1].trim().replace(/\s+/g, '') : undefined,
      sequence: seqMatch ? seqMatch[1].trim() : undefined,
      contribuyente: contMatch ? contMatch[1].trim() : undefined,
    };
  }
}

export class ExcelProcessor implements FileProcessorInterface {
  async process(fileUrl: string): Promise<{ metadata: PayrollMetadata; rows: PayrollRow[] }> {
    // 1. Descargar el archivo Excel como un ArrayBuffer
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Leer workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let metadata: PayrollMetadata = {};
    let range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
    
    // Verificamos si la primera celda A1 contiene metadatos en formato texto
    const a1Cell = sheet['A1'];
    let startRow = 0;

    if (a1Cell && a1Cell.t === 's' && (a1Cell.v.includes('CUIT:') || a1Cell.v.includes('Contribuyente:'))) {
      metadata = this.parseMetadataString(a1Cell.v);
      startRow = 1; // La fila 0 contiene metadatos, los datos reales empiezan en la fila 1
    }

    // Convertimos a JSON omitiendo la primera fila si contiene metadatos
    const sheetData: any[] = XLSX.utils.sheet_to_json(sheet, { 
      range: startRow,
      raw: false // Obtener como strings para normalizar de forma homogénea
    });

    const rows: PayrollRow[] = sheetData.map((row, index) => {
      const transformed: PayrollRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string') {
          const numericPattern = /^-?[\d.]+,?\d*$/;
          if (numericPattern.test(value) && !key.toLowerCase().includes('cuit') && !key.toLowerCase().includes('legajo')) {
            transformed[key] = normalizeNumber(value);
          } else {
            transformed[key] = value.trim();
          }
        } else {
          transformed[key] = value as string | number | boolean | null | undefined;
        }
      }

      // Aplicar Mapeo Inteligente (v2)
      const normalized = mapPayrollRow(transformed);

      if (index === 0 && !validateRequiredColumns(normalized)) {
        throw new Error('El archivo Excel no contiene las columnas mínimas requeridas (Legajo y Neto a Pagar)');
      }

      return normalized;
    });

    return { metadata, rows };
  }

  private parseMetadataString(line: string): PayrollMetadata {
    const cuitMatch = line.match(/CUIT:\s*([\d-]+)/i);
    const periodMatch = line.match(/Período\s*([\d\s/-]+)/i);
    const seqMatch = line.match(/Secuencia:\s*([^ ,]+)/i);
    const contMatch = line.match(/Contribuyente:\s*([^,\n]+)/i);

    return {
      cuit: cuitMatch ? cuitMatch[1].trim() : undefined,
      period: periodMatch ? periodMatch[1].trim().replace(/\s+/g, '') : undefined,
      sequence: seqMatch ? seqMatch[1].trim() : undefined,
      contribuyente: contMatch ? contMatch[1].trim() : undefined,
    };
  }
}

export class FileProcessorFactory {
  static getProcessor(fileUrl: string): FileProcessorInterface {
    const urlWithoutQuery = fileUrl.split('?')[0];
    const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
      return new ExcelProcessor();
    }
    return new CsvProcessor(); // Por defecto es CSV
  }
}
