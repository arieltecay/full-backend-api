import { z } from 'zod';
import { objectId } from '../middleware/validate';

export const uploadPayrollSchema = z.object({
  clientId: z.string(),
  period: z.string().regex(/^\d{2}-\d{4}$/, { message: 'El período debe tener el formato MM-YYYY' }),
  fileUrl: z.string().url().optional(),
});

export const payrollParamsSchema = z.object({
  clientId: z.string(),
  period: z.string().regex(/^\d{2}-\d{4}$/, { message: 'El período debe tener el formato MM-YYYY' }),
});

export const clientIdParamSchema = z.object({
  clientId: objectId,
});

export const payrollFilterSchema = z.object({
  sucursal: z.string().optional(),
  convenio: z.string().optional(),
  antiguedadRange: z.string().optional(),
  searchTerm: z.string().optional(),
}).optional();

export const comparePayrollsQuerySchema = z.object({
  periodA: z.string().regex(/^\d{2}-\d{4}$/, { message: 'El período debe tener el formato MM-YYYY' }),
  periodB: z.string().regex(/^\d{2}-\d{4}$/, { message: 'El período debe tener el formato MM-YYYY' }),
});
