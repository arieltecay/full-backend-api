import { Router } from 'express';
import {
  createReport,
  getAllReports,
  getReportByToken,
  deleteReport,
  toggleReportStatus
} from '../../controllers/report/index.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { createReportSchema, reportParamsSchema } from '../../validation/report.js';

const router = Router();

router.get('/view/:token', getReportByToken);
router.post('/', protect, adminOnly, upload.single('excel'), validate(createReportSchema), createReport);
router.get('/', protect, adminOnly, getAllReports);
router.patch('/toggle/:id', protect, adminOnly, validate(reportParamsSchema, 'params'), toggleReportStatus);
router.delete('/:id', protect, adminOnly, validate(reportParamsSchema, 'params'), deleteReport);

export default router;
