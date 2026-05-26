import { z } from 'zod';

export const createUnionSchema = z.object({
  name: z.string().min(2),
  province: z.string().min(2),
  active: z.boolean().optional(),
});

export const updateUnionSchema = z.object({
  name: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  active: z.boolean().optional(),
});
