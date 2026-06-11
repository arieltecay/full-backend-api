import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user/index.js';
import { TokenPayload } from './types.js';
import { JWT_CONFIG } from '../../config/jwt/types.js';

export const protect = async (req: any, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as TokenPayload;

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      // Check if user is active
      if (!req.user.isActive || req.user.status !== 'active') {
        return res.status(403).json({ message: 'Tu cuenta ha sido desactivada o suspendida' });
      }

      // Check for temporal access expiration
      if (req.user.role === 'client' && req.user.accessExpiresAt && new Date() > req.user.accessExpiresAt) {
        return res.status(403).json({ message: 'Tu acceso temporal ha expirado. Contacta al administrador.' });
      }

      next();
    } catch (error) {
      console.error('JWT Error:', error);
      res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  } else {
    res.status(401).json({ message: 'No autorizado, sin token' });
  }
};

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: se requieren permisos de administrador' });
  }
};
