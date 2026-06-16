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
import { validate } from '../../middleware/validate.js';
import { createDashboardSchema, updateDashboardSchema, dashboardParamsSchema, queryDashboardSchema } from '../../validation/dashboard.js';

const router = Router();

router.get('/my-dashboards', protect, getMyDashboards);
router.get('/stats', protect, adminOnly, getGlobalStats);
router.post('/', protect, adminOnly, validate(createDashboardSchema), createDashboard);
router.get('/', protect, adminOnly, getDashboards);
router.put('/:id', protect, adminOnly, validate(updateDashboardSchema), validate(dashboardParamsSchema, 'params'), updateDashboard);
router.delete('/:id', protect, adminOnly, validate(dashboardParamsSchema, 'params'), deleteDashboard);
router.get('/:id/details', protect, validate(dashboardParamsSchema, 'params'), getDashboardDetails);
router.post('/:id/query', protect, validate(dashboardParamsSchema, 'params'), validate(queryDashboardSchema), queryDashboardAI);

export default router;
