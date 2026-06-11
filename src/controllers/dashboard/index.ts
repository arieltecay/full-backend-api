import { Request, Response } from 'express';
import { User } from '../../models/user/index.js';
import { Payroll } from '../../models/payroll/index.js';
import { Report } from '../../models/report/index.js';

/**
 * Obtiene métricas globales para el dashboard principal del Admin
 */
export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    const [totalClients, totalPayrolls, totalReports] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Payroll.countDocuments(),
      Report.countDocuments()
    ]);

    // Obtener los últimos 5 clientes registrados
    const recentClients = await User.find({ role: 'client' })
      .select('name email createdAt status')
      .sort('-createdAt')
      .limit(5);

    // Obtener últimas 5 nóminas cargadas
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
    res.status(500).json({ message: 'Error al obtener estadísticas globales' });
  }
};
