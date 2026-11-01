import { z } from 'zod';

const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    role: z.enum(['user', 'admin']).optional(),
    isActive: z.boolean().optional(),
  }).refine((b) => Object.keys(b).length > 0, 'Provide at least one field'),
});
