import { Router } from 'express';
import { listUsers, updateUser } from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listUsersSchema, updateUserSchema } from '../validators/user.validators.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/', validate(listUsersSchema), listUsers);
router.patch('/:id', validate(updateUserSchema), updateUser);
export default router;
