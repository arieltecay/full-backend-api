import { FileProcessorFactory } from './file-processor.js';
import { PayrollMetadata, PayrollRow } from '../../types/payroll.types.js';

export { PayrollMetadata };

/**
 * Parsea un archivo (CSV o Excel) desde una URL pública (Cloudinary u otra).
 * Delega en la factoría adecuada según la extensión del archivo.
 */
export async function parseCsvFromUrl(fileUrl: string): Promise<{ metadata: PayrollMetadata; rows: PayrollRow[] }> {
  const processor = FileProcessorFactory.getProcessor(fileUrl);
  return await processor.process(fileUrl);
}
