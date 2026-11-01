import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, paginationMeta } from '../utils/helpers.js';
import { emitToUser } from '../sockets/index.js';

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  dueDate: { dueDate: 1, createdAt: -1 },
  title: { title: 1 },
};

const ownedFilter = (req, extra = {}) => ({ owner: req.user._id, deletedAt: null, ...extra });

export const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, search, sort } = req.query;
  const filter = ownedFilter(req);
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };

  const [items, total] = await Promise.all([
    Task.find(filter).sort(SORTS[sort]).skip((page - 1) * limit).limit(limit).lean({ virtuals: false }),
    Task.countDocuments(filter),
  ]);
  const data = items.map(({ __v, deletedAt, ...t }) => t);
  res.json({ success: true, data, meta: paginationMeta(total, page, limit) });
});

export const taskStats = asyncHandler(async (req, res) => {
  const rows = await Task.aggregate([
    { $match: ownedFilter(req) },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = { todo: 0, in_progress: 0, done: 0, total: 0 };
  for (const r of rows) { stats[r._id] = r.count; stats.total += r.count; }
  const overdue = await Task.countDocuments(ownedFilter(req, { status: { $ne: 'done' }, dueDate: { $lt: new Date() } }));
  res.json({ success: true, data: { ...stats, overdue } });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, owner: req.user._id });
  emitToUser(req.user._id, 'task:created', task);
  res.status(201).json({ success: true, data: task });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne(ownedFilter(req, { _id: req.params.id }));
  if (!task) throw ApiError.notFound('Task not found');
  res.json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(ownedFilter(req, { _id: req.params.id }), { $set: req.body }, { new: true, runValidators: true });
  if (!task) throw ApiError.notFound('Task not found');
  emitToUser(req.user._id, 'task:updated', task);
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(ownedFilter(req, { _id: req.params.id }), { $set: { deletedAt: new Date() } });
  if (!task) throw ApiError.notFound('Task not found');
  emitToUser(req.user._id, 'task:deleted', { _id: task._id });
  res.json({ success: true, message: 'Task deleted' });
});
