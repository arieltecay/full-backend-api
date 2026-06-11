import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ ADVERTENCIA: JWT_SECRET no está definido en las variables de entorno.');
}

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'emergency_fallback_do_not_use_in_production',
  expiresIn: '30d',
};
