import { Request, Response } from 'express';
import { Report } from '../../models/report/index.js';
import { CloudinaryService } from '../../services/cloudinary.service.js';
import { ExcelService } from '../../services/excel/index.js';
import { CreateReportBody, ReportParams, TokenParams } from './types.js';
import fs from 'fs';

/**
 * Crea un nuevo informe subiendo el Excel y parseando los datos
 */
export const createReport = async (req: Request<{}, {}, CreateReportBody>, res: Response) => {
  try {
    const { title, clientId, expiresAt } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'El archivo Excel es obligatorio' });
    }

    // 1. Parsear los datos del Excel para MongoDB (ahora devuelve {metadata, data})
    const { metadata, data: structuredData } = ExcelService.parseExcel(file.path);

    // 2. Subir el archivo original a Cloudinary como backup
    const cloudinaryResult = await CloudinaryService.uploadFile(file.path, 'reports');

    // 3. Eliminar el archivo temporal local
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // 4. Crear el registro en MongoDB
    const report = await Report.create({
      title,
      client: clientId as any,
      metadata,
      data: structuredData,
      excelUrl: cloudinaryResult.secure_url,
      excelPublicId: cloudinaryResult.public_id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: (req as any).user._id
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Report Creation Error:', error);
    res.status(500).json({ message: 'Error al crear el informe' });
  }
};

/**
 * Obtiene todos los informes (Solo Admin)
 */
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await Report.find().populate('client', 'name email').sort('-createdAt');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes' });
  }
};

/**
 * Obtiene un informe por su Token de acceso (Público/Cliente)
 */
export const getReportByToken = async (req: Request<TokenParams>, res: Response) => {
  try {
    const { token } = req.params;
    const report = await Report.findOne({ accessToken: token, isActive: true });

    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado o acceso denegado' });
    }

    // Verificar expiración
    if (new Date() > report.expiresAt) {
      return res.status(403).json({ message: 'El acceso a este informe ha expirado' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el informe' });
  }
};

/**
 * Elimina un informe y su archivo en Cloudinary (Solo Admin)
 */
export const deleteReport = async (req: Request<ReportParams>, res: Response) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    // Borrar de Cloudinary
    await CloudinaryService.deleteFile(report.excelPublicId);

    // Borrar de MongoDB
    await report.deleteOne();

    res.json({ message: 'Informe y archivos eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el informe' });
  }
};

/**
 * Activa/Desactiva un informe (Kill Switch)
 */
export const toggleReportStatus = async (req: Request<ReportParams>, res: Response) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    report.isActive = !report.isActive;
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado' });
  }
};
