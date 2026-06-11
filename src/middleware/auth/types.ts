import { Response, NextFunction } from 'express';

export interface TokenPayload {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: any;
}
