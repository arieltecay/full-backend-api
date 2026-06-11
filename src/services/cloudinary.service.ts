import cloudinary from '../config/cloudinary.js';
import { UploadApiResponse } from 'cloudinary';

export class CloudinaryService {
  /**
   * Sube un archivo a Cloudinary con optimización automática.
   * @param filePath Ruta del archivo temporal o buffer.
   * @param folder Carpeta dentro de Cloudinary (ej: 'reports', 'docs', 'home').
   */
  static async uploadFile(filePath: string, folder: string): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `full_admin/${folder}`,
        resource_type: 'auto', // Detecta automáticamente si es imagen, pdf, raw (excel), etc.
        fetch_format: 'auto',   // Optimiza el formato según el navegador
        quality: 'auto',        // Optimiza la calidad para reducir peso
      });
      return result;
    } catch (error) {
      console.error('❌ Error al subir a Cloudinary:', error);
      throw new Error('Error al procesar el archivo en la nube.');
    }
  }

  /**
   * Elimina un archivo de Cloudinary.
   * @param publicId El ID público del archivo guardado en Mongo.
   */
  static async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('❌ Error al eliminar de Cloudinary:', error);
      // No lanzamos error para no bloquear la eliminación en base de datos, 
      // pero lo dejamos logueado.
    }
  }
}
