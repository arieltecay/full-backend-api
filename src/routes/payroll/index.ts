import { Router } from 'express';
import { uploadPayroll, getPayroll, getPayrollStats, getPayrollPeriods, comparePayrolls } from '../../controllers/payroll/index.js';
import { adminOnly, protect } from '../../middleware/auth/index.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { clientIdParamSchema, comparePayrollsQuerySchema } from '../../validation/payroll.js';

const router = Router();

router.post('/:clientId/:period', protect, adminOnly, upload.single('file'), uploadPayroll);
router.get('/:clientId/periods', protect, validate(clientIdParamSchema, 'params'), getPayrollPeriods);
router.get('/:clientId/compare', protect, validate(clientIdParamSchema, 'params'), validate(comparePayrollsQuerySchema, 'query'), comparePayrolls);
router.post('/:clientId/:period/stats', protect, getPayrollStats);
router.get('/:clientId/:period', protect, getPayroll);

export default router;
