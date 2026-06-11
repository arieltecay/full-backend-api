import { Router } from 'express';
import { getHomeConfig, updateHomeConfig } from '../../controllers/home-config/index.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';

const router = Router();

// GET es público para que el Frontend pueda mostrar la info
router.get('/', getHomeConfig);

// PUT está protegido: requiere token y ser administrador
router.put('/', protect, adminOnly, updateHomeConfig);

export default router;
