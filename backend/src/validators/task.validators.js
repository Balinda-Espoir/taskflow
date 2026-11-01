import { z } from 'zod';

const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const status = z.enum(['todo', 'in_progress', 'done']);
const priority = z.enum(['low', 'medium', 'high']);
const dueDate = z.union([z.null(), z.coerce.date()]);

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: status.optional(),
    priority: priority.optional(),
    search: z.string().trim().max(100).optional(),
    sort: z.enum(['newest', 'oldest', 'dueDate', 'title']).default('newest'),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate: dueDate.optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate: dueDate.optional(),
  }).refine((b) => Object.keys(b).length > 0, 'Provide at least one field'),
});

export const taskIdSchema = z.object({ params: z.object({ id }) });
