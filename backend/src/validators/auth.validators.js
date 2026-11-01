import { z } from 'zod';

const password = z.string().min(8, 'At least 8 characters').max(72)
  .regex(/[A-Za-z]/, 'Must contain a letter').regex(/\d/, 'Must contain a number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().toLowerCase().email(),
    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(72),
  }),
});
