import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, paginationMeta } from '../utils/helpers.js';
import { isOnline } from '../sockets/index.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const filter = {};
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  const data = items.map((u) => ({ ...u.toJSON(), online: isOnline(u._id) }));
  res.json({ success: true, data, meta: paginationMeta(total, page, limit) });
});

export const updateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw ApiError.badRequest('You cannot change your own role or status');
  const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  if (req.body.isActive === false) await User.updateOne({ _id: user._id }, { $unset: { refreshTokenHash: 1 } });
  res.json({ success: true, data: user });
});
