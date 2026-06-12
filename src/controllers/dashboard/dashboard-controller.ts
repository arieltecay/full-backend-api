import { Request, Response, NextFunction } from 'express';
import { Dashboard } from '../../models/dashboard/index.js';
import { Payroll } from '../../models/payroll/index.js';
import { User } from '../../models/user/index.js';
import { createDashboardSchema, updateDashboardSchema } from '../../validation/dashboard.js';
import { PayrollService } from '../../services/payroll/index.js';
import { GeminiService } from '../../services/gemini/gemini-service.js';

// Extendemos el tipo Request de Express para que acepte req.user
interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * POST /dashboards
 * Admin only
 */
export async function createDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = createDashboardSchema.parse(req.body);
    
    // Verificar si el cliente existe
    const client = await User.findOne({ _id: data.clientId, role: 'client' });
    if (!client) {
      return res.status(404).json({ message: 'El cliente especificado no existe o no tiene rol de cliente' });
    }

    // Verificar si existe nómina para ese cliente y período
    const payrollExists = await Payroll.findOne({ clientId: data.clientId, period: data.period });
    if (!payrollExists) {
      return res.status(400).json({ 
        message: `No se encontró ninguna nómina cargada para el cliente en el período ${data.period}. Primero debes cargar la nómina.` 
      });
    }

    const dashboard = await Dashboard.create(data);
    return res.status(201).json(dashboard);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboards
 * Admin: Listar todos los tableros creados
 */
export async function getDashboards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const dashboards = await Dashboard.find()
      .populate('clientId', 'name email status')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(dashboards);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /dashboards/:id
 * Admin: Editar tablero
 */
export async function updateDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = updateDashboardSchema.parse(req.body);

    const dashboard = await Dashboard.findByIdAndUpdate(id, updateData, { new: true });
    if (!dashboard) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    return res.json(dashboard);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /dashboards/:id
 * Admin: Eliminar tablero
 */
export async function deleteDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const dashboard = await Dashboard.findByIdAndDelete(id);
    if (!dashboard) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    return res.json({ message: 'Tablero eliminado con éxito' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboards/my-dashboards
 * Client: Obtiene todos los tableros activos asignados a su cuenta
 */
export async function getMyDashboards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const clientId = req.user?._id;
    if (!clientId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const dashboards = await Dashboard.find({ clientId, isActive: true })
      .sort({ period: -1 })
      .lean();

    return res.json(dashboards);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /dashboards/:id/details
 * Client & Admin: Obtiene estadísticas completas y filas del tablero
 */
export async function getDashboardDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const dashboard = await Dashboard.findById(id).lean();
    if (!dashboard) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Seguridad: Si es un cliente, debe pertenecerle el tablero y estar activo
    if (userRole === 'client') {
      if (String(dashboard.clientId) !== String(userId)) {
        return res.status(403).json({ message: 'No tienes acceso a este tablero' });
      }
      if (!dashboard.isActive) {
        return res.status(403).json({ message: 'El tablero solicitado está inactivo' });
      }
    }

    // Buscar nómina correspondiente
    const payroll = await Payroll.findOne({ clientId: String(dashboard.clientId), period: dashboard.period }).lean();
    if (!payroll) {
      return res.status(404).json({ message: 'La nómina asociada a este tablero no fue encontrada' });
    }

    const client = await User.findById(dashboard.clientId).select('name').lean();

    // Normalizar datos para asegurar camelCase y resolver bug de $0 (v3.1)
    const normalizedRows = PayrollService.normalizeRows(payroll.data);

    // Calcular estadísticas sobre los datos normalizados
    const stats = PayrollService.analyze(normalizedRows);

    return res.json({
      dashboard,
      clientName: client?.name || 'Cliente',
      metadata: payroll.metadata,
      stats,
      rows: normalizedRows, // Todas las filas normalizadas para el frontend
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /dashboards/:id/query
 * Client & Admin: Consulta interactiva de IA sobre el tablero seleccionado
 */
export async function queryDashboardAI(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { query } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ message: 'Se requiere una pregunta para el asistente' });
    }

    const dashboard = await Dashboard.findById(id).lean();
    if (!dashboard) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Seguridad
    if (userRole === 'client') {
      if (String(dashboard.clientId) !== String(userId)) {
        return res.status(403).json({ message: 'No tienes acceso a este tablero' });
      }
    }

    const payroll = await Payroll.findOne({ clientId: String(dashboard.clientId), period: dashboard.period }).lean();
    if (!payroll) {
      return res.status(404).json({ message: 'Nómina no encontrada' });
    }

    const client = await User.findById(dashboard.clientId).select('name').lean();
    const clientName = client?.name || 'Cliente';

    // Agregamos estadísticas normalizadas para Gemini (v3.1)
    const stats = PayrollService.analyze(PayrollService.normalizeRows(payroll.data));

    const responseText = await GeminiService.queryPayroll(query, stats, clientName);

    return res.json({ query, response: responseText });
  } catch (err) {
    next(err);
  }
}
