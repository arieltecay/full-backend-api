import { z } from 'zod';

export const uploadPayrollSchema = z.object({
  clientId: z.string(), // could be UUID or simple string
  period: z.string().regex(/^\d{2}-\d{4}$/, { message: 'Period must be MM-YYYY' }),
  fileUrl: z.string().url().optional(),
});

export const payrollParamsSchema = z.object({
  clientId: z.string(),
  period: z.string().regex(/^\d{2}-\d{4}$/, { message: 'Period must be MM-YYYY' }),
});

export const payrollFilterSchema = z.object({
  sucursal: z.string().optional(),
  convenio: z.string().optional(),
  antiguedadRange: z.string().optional(),
  searchTerm: z.string().optional(),
}).optional();
