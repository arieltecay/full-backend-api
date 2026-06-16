import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/user/index.js';
import { Payroll } from '../../models/payroll/index.js';
import { Report } from '../../models/report/index.js';

export const getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalClients, totalPayrolls, totalReports] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Payroll.countDocuments(),
      Report.countDocuments()
    ]);

    const recentClients = await User.find({ role: 'client' })
      .select('name email createdAt status')
      .sort('-createdAt')
      .limit(5);

    const recentPayrolls = await Payroll.find()
      .select('period clientId uploadedAt')
      .sort('-uploadedAt')
      .limit(5);

    res.json({
      summary: {
        totalClients,
        totalPayrolls,
        totalReports,
        activeUsers: await User.countDocuments({ role: 'client', isActive: true, status: 'active' })
      },
      recentClients,
      recentPayrolls
    });
  } catch (error) {
    next(error);
  }
};
