import { Router } from 'express';
import { getGlobalStats } from '../../controllers/dashboard/index.js';
import { 
  createDashboard, 
  getDashboards, 
  updateDashboard, 
  deleteDashboard, 
  getMyDashboards, 
  getDashboardDetails, 
  queryDashboardAI 
} from '../../controllers/dashboard/dashboard-controller.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';

const router = Router();

// Rutas para el cliente (y el admin) - Mover arriba para prioridad
router.get('/my-dashboards', protect, getMyDashboards);

// Rutas de administración general
router.get('/stats', protect, adminOnly, getGlobalStats);
router.post('/', protect, adminOnly, createDashboard);
router.get('/', protect, adminOnly, getDashboards);
router.put('/:id', protect, adminOnly, updateDashboard);
router.delete('/:id', protect, adminOnly, deleteDashboard);

// Rutas de detalle
router.get('/:id/details', protect, getDashboardDetails);
router.post('/:id/query', protect, queryDashboardAI);

export default router;
