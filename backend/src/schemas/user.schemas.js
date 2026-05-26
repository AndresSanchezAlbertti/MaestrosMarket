import { z } from 'zod';

export const createUserByAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  affiliateNumber: z.string().optional().nullable(),
  unionId: z.string().optional().nullable(),
  role: z.enum(['MEMBER', 'ADMIN']).optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  canView: z.boolean().optional(),
  canPublish: z.boolean().optional(),
  canModerate: z.boolean().optional(),
  canManageUsers: z.boolean().optional(),
});

export const updateUserByAdminSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  affiliateNumber: z.string().optional().nullable(),
  unionId: z.string().optional().nullable(),
  role: z.enum(['MEMBER', 'ADMIN']).optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  canView: z.boolean().optional(),
  canPublish: z.boolean().optional(),
  canModerate: z.boolean().optional(),
  canManageUsers: z.boolean().optional(),
  password: z.string().min(6).optional(),
});
