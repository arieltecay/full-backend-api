import { z } from 'zod';

export const updateHomeConfigSchema = z.object({
  companyName: z.string().min(1, 'El nombre de la empresa es requerido').optional(),
  mission: z.string().min(1, 'La misión es requerida').optional(),
  tasks: z.array(z.string().min(1)).optional(),
  heroImageUrl: z.string().url('URL inválida').optional(),
});
