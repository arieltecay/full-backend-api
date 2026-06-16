import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['admin', 'client']).optional(),
});

export const updateClientSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  accessExpiresAt: z.string().datetime().optional().nullable(),
  customNote: z.string().optional(),
});
