import { Router } from 'express';
import { getHomeConfig, updateHomeConfig } from '../../controllers/home-config/index.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';
import { validate } from '../../middleware/validate.js';
import { updateHomeConfigSchema } from '../../validation/home-config.js';

const router = Router();

router.get('/', getHomeConfig);
router.put('/', protect, adminOnly, validate(updateHomeConfigSchema), updateHomeConfig);

export default router;
