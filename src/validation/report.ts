import { z } from 'zod';
import { objectId } from '../middleware/validate';

export const createReportSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  clientId: objectId,
  expiresAt: z.string().optional(),
});

export const reportParamsSchema = z.object({
  id: objectId,
});

export const tokenParamsSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});
