import { Router } from 'express';
import { login, register, getClients, updateClient } from '../../controllers/auth/index.js';
import { protect, adminOnly } from '../../middleware/auth/index.js';

const router = Router();

router.post('/login', login);

// El registro vuelve a ser público temporalmente para crear el primer admin.
router.post('/register', register);
router.get('/clients', protect, adminOnly, getClients);
router.put('/clients/:id', protect, adminOnly, updateClient);

export default router;
