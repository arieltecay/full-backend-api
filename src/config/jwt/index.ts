import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWT_CONFIG } from './types.js';

export const generateToken = (id: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: JWT_CONFIG.expiresIn as any,
  };
  
  return jwt.sign({ id, role }, JWT_CONFIG.secret as Secret, options);
};
