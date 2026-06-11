import { Router } from 'express';
import { uploadPayroll, getPayroll, getPayrollStats, getPayrollPeriods, comparePayrolls } from '../../controllers/payroll/index.js';
import { adminOnly, protect } from '../../middleware/auth/index.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

// Only admins can upload payrolls
router.post('/:clientId/:period', protect, adminOnly, upload.single('file'), uploadPayroll);

// Get available periods for a client
router.get('/:clientId/periods', protect, getPayrollPeriods);

// Comparison endpoint
router.get('/:clientId/compare', protect, comparePayrolls);

// Analytics endpoint
router.get('/:clientId/:period/stats', protect, getPayrollStats);

// Any authenticated user (admin or client) can read payrolls
router.get('/:clientId/:period', protect, getPayroll);

export default router;
