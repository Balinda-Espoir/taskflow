import { Router } from 'express';
import { listTasks, taskStats, createTask, getTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listTasksSchema, createTaskSchema, updateTaskSchema, taskIdSchema } from '../validators/task.validators.js';

const router = Router();
router.use(protect);
router.get('/stats', taskStats);
router.route('/').get(validate(listTasksSchema), listTasks).post(validate(createTaskSchema), createTask);
router.route('/:id')
  .get(validate(taskIdSchema), getTask)
  .patch(validate(updateTaskSchema), updateTask)
  .delete(validate(taskIdSchema), deleteTask);
export default router;
