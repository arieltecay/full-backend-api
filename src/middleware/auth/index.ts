import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user/index.js';
import { TokenPayload } from './types.js';
import { JWT_CONFIG } from '../../config/jwt/types.js';
import { AppError } from '../../utils/app-error.js';

export const protect = async (req: any, _res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as TokenPayload;

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        throw new AppError(401, 'Usuario no encontrado');
      }

      if (!req.user.isActive || req.user.status !== 'active') {
        throw new AppError(403, 'Tu cuenta ha sido desactivada o suspendida');
      }

      if (req.user.role === 'client' && req.user.accessExpiresAt && new Date() > req.user.accessExpiresAt) {
        throw new AppError(403, 'Tu acceso temporal ha expirado. Contacta al administrador.');
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      console.error('JWT Error:', error);
      next(new AppError(401, 'No autorizado, token fallido'));
    }
  } else {
    next(new AppError(401, 'No autorizado, sin token'));
  }
};

export const adminOnly = (req: any, _res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError(403, 'Acceso denegado: se requieren permisos de administrador'));
  }
};
