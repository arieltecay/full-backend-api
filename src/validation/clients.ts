import { z } from 'zod';
import { objectId } from '../middleware/validate';

export const updateClientSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  accessExpiresAt: z.string().datetime().optional().nullable(),
  customNote: z.string().optional(),
  managerPassword: z.string().optional(),
});

export const clientParamsSchema = z.object({
  id: objectId,
});
