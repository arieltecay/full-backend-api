import { Request, Response, NextFunction } from 'express';
import { Payroll } from '../../models/payroll/index.js';
import { uploadPayrollSchema, payrollParamsSchema } from '../../validation/payroll.js';
import { parseCsvFromUrl } from '../../services/payroll/parser.js';
import { CloudinaryService } from '../../services/cloudinary.service.js';
import { PayrollAnalyticsService } from '../../services/payroll/analytics.service.js';
import fs from 'fs';

/**
 * GET /payroll/:clientId/periods
 */
export async function getPayrollPeriods(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId } = req.params;
    
    // Find all payrolls for this client, sorted by upload date
    const payrolls = await Payroll.find({ clientId })
      .select('period uploadedAt metadata')
      .sort({ uploadedAt: -1 })
      .lean();

    return res.json(payrolls.map(p => ({
      period: p.period,
      uploadedAt: p.uploadedAt,
      contribuyente: p.metadata?.contribuyente
    })));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /payroll/:clientId/:period
 * Body: { fileUrl?: string } (or file via multipart/form-data)
 */
export async function uploadPayroll(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate route params
    const params = payrollParamsSchema.parse({ clientId: req.params.clientId, period: req.params.period });
    const { clientId, period } = params;
    
    let fileUrl = (req.body as any).fileUrl;

    // If a file was uploaded via multipart/form-data
    if (req.file) {
      const result = await CloudinaryService.uploadFile(req.file.path, 'payrolls');
      fileUrl = result.secure_url;
      // Clean up local temp file
      fs.unlinkSync(req.file.path);
    }

    if (!fileUrl) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Parse CSV from Cloudinary URL (returns { metadata, rows })
    const { metadata, rows } = await parseCsvFromUrl(fileUrl);

    // Create payroll document (unique index ensures one per client/period)
    const payroll = await Payroll.create({ 
      clientId, 
      period, 
      originalFileUrl: fileUrl, 
      metadata,
      data: rows 
    });

    return res.status(201).json({ payrollId: payroll._id, message: 'Payroll uploaded successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /payroll/:clientId/:period
 * Optional query: page, limit
 */
export async function getPayroll(req: Request, res: Response, next: NextFunction) {
  try {
    const params = payrollParamsSchema.parse({ clientId: req.params.clientId, period: req.params.period });
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const payroll = await Payroll.findOne({ clientId: params.clientId, period: params.period })
      .select('data')
      .skip(skip)
      .limit(limit)
      .lean();

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    // If pagination was applied, we slice the array manually because Mongo cannot paginate inside an array
    const totalRows = payroll.data.length;
    const paginated = payroll.data.slice(skip, skip + limit);

    return res.json({
      clientId: params.clientId,
      period: params.period,
      page,
      limit,
      totalRows,
      rows: paginated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /payroll/:clientId/:period/stats
 */
export async function getPayrollStats(req: Request, res: Response, next: NextFunction) {
  try {
    const params = payrollParamsSchema.parse({ clientId: req.params.clientId, period: req.params.period });
    
    const payroll = await Payroll.findOne({ clientId: params.clientId, period: params.period }).lean();

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    const analytics = PayrollAnalyticsService.calculateStats(payroll.data);

    return res.json({
      clientId: params.clientId,
      period: params.period,
      metadata: payroll.metadata,
      ...analytics
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /payroll/:clientId/compare?periodA=MM-YYYY&periodB=MM-YYYY
 */
export async function comparePayrolls(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId } = req.params;
    const { periodA, periodB } = req.query;

    if (!periodA || !periodB) {
      return res.status(400).json({ message: 'Se requieren periodA y periodB' });
    }

    const [payrollA, payrollB] = await Promise.all([
      Payroll.findOne({ clientId, period: periodA as string }).lean(),
      Payroll.findOne({ clientId, period: periodB as string }).lean()
    ]);

    if (!payrollA || !payrollB) {
      return res.status(404).json({ message: 'Uno o ambos períodos no fueron encontrados' });
    }

    const statsA = PayrollAnalyticsService.calculateStats(payrollA.data);
    const statsB = PayrollAnalyticsService.calculateStats(payrollB.data);

    const calcVariation = (valA: number, valB: number) => {
      if (valA === 0) return valB > 0 ? 100 : 0;
      return ((valB - valA) / valA) * 100;
    };

    // Calculate variations for all summary metrics automatically (Extensible)
    const variations: Record<string, number> = {};
    Object.keys(statsB.summary).forEach(key => {
      variations[key] = calcVariation(statsA.summary[key] || 0, statsB.summary[key] || 0);
    });

    return res.json({
      clientId,
      periodA,
      periodB,
      summaryA: statsA.summary,
      summaryB: statsB.summary,
      variations
    });
  } catch (err) {
    next(err);
  }
}
