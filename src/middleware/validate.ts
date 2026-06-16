import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/app-error';

/** Refinement de Zod para validar MongoDB ObjectId */
export const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'ID inválido',
});

/**
 * Middleware factory para validación Zod.
 * @param schema - Esquema Zod a aplicar
 * @param source - Propiedad de req a validar (body, params, query)
 */
export const validate = (schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.issues.map((e: z.ZodIssue) => e.message).join('; ');
        next(new AppError(400, messages));
        return;
      }
      next(err);
    }
  };
};
