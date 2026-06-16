import { Router } from 'express';
import { login, register, getClients, updateClient } from '../../controllers/auth/index.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, registerSchema, updateClientSchema } from '../../validation/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/clients', protect, adminOnly, getClients);
router.put('/clients/:id', protect, adminOnly, validate(updateClientSchema), updateClient);

export default router;
