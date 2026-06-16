import { Request, Response, NextFunction } from 'express';
import { Report } from '../../models/report/index.js';
import { CloudinaryService } from '../../services/cloudinary.service.js';
import { ExcelService } from '../../services/excel/index.js';
import { CreateReportBody, ReportParams, TokenParams } from './types.js';
import { AppError } from '../../utils/app-error.js';
import fs from 'fs';

export const createReport = async (req: Request<{}, {}, CreateReportBody>, res: Response, next: NextFunction) => {
  try {
    const { title, clientId, expiresAt } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError(400, 'El archivo Excel es obligatorio');
    }

    const { metadata, data: structuredData } = ExcelService.parseExcel(file.path);
    const cloudinaryResult = await CloudinaryService.uploadFile(file.path, 'reports');

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

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
    next(error);
  }
};

export const getAllReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await Report.find().populate('client', 'name email').sort('-createdAt');
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const getReportByToken = async (req: Request<TokenParams>, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const report = await Report.findOne({ accessToken: token, isActive: true });

    if (!report) {
      throw new AppError(404, 'Informe no encontrado o acceso denegado');
    }

    if (new Date() > report.expiresAt) {
      throw new AppError(403, 'El acceso a este informe ha expirado');
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const report = await Report.findById(id);

    if (!report) {
      throw new AppError(404, 'Informe no encontrado');
    }

    await CloudinaryService.deleteFile(report.excelPublicId);
    await report.deleteOne();

    res.json({ message: 'Informe y archivos eliminados correctamente' });
  } catch (error) {
    next(error);
  }
};

export const toggleReportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const report = await Report.findById(id);

    if (!report) {
      throw new AppError(404, 'Informe no encontrado');
    }

    report.isActive = !report.isActive;
    await report.save();

    res.json(report);
  } catch (error) {
    next(error);
  }
};
