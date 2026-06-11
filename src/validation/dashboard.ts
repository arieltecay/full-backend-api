import { z } from 'zod';

export const createDashboardSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido' }),
  clientId: z.string().min(1, { message: 'El clientId es requerido' }),
  period: z.string().regex(/^\d{2}-\d{4}$/, { message: 'El período debe tener el formato MM-YYYY' }),
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
  }).optional(),
});

export const updateDashboardSchema = z.object({
  title: z.string().min(1).optional(),
  period: z.string().regex(/^\d{2}-\d{4}$/).optional(),
  isActive: z.boolean().optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
  }).optional(),
});
