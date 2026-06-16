import { Router } from 'express';
import { login, register } from '../../controllers/auth/index.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, registerSchema } from '../../validation/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;
