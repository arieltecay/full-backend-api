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

const router = Router();

// Públicas (Acceso por Token)
router.get('/view/:token', getReportByToken);

// Protegidas (Solo Admin)
router.post('/', protect, adminOnly, upload.single('excel'), createReport);
router.get('/', protect, adminOnly, getAllReports);
router.patch('/toggle/:id', protect, adminOnly, toggleReportStatus);
router.delete('/:id', protect, adminOnly, deleteReport);

export default router;
