import { Router } from 'express';
import { getClients, updateClient } from '../../controllers/clients/index.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';
import { validate } from '../../middleware/validate.js';
import { updateClientSchema, clientParamsSchema } from '../../validation/clients.js';

const router = Router();

router.get('/', protect, adminOnly, getClients);
router.put(
  '/:id',
  protect,
  adminOnly,
  validate(clientParamsSchema, 'params'),
  validate(updateClientSchema),
  updateClient
);

export default router;
