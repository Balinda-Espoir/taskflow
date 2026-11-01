import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  issueSession, clearAuthCookies, verifyRefreshToken, hashToken,
} from '../services/token.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('Email is already registered');
  const user = await User.create({ name, email, password }); // role is never taken from the client
  await issueSession(user, res);
  res.status(201).json({ success: true, data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');
  // Same message for unknown email / wrong password to avoid account enumeration
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');
  user.lastLoginAt = new Date();
  await issueSession(user, res);
  res.json({ success: true, data: { user } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized('No refresh token');
  let payload;
  try { payload = verifyRefreshToken(token); } catch { clearAuthCookies(res); throw ApiError.unauthorized('Invalid refresh token'); }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.isActive) { clearAuthCookies(res); throw ApiError.unauthorized('Account unavailable'); }

  if (user.refreshTokenHash !== hashToken(token)) {
    // Token reuse detected: revoke the whole session
    user.refreshTokenHash = undefined;
    await user.save({ validateBeforeSave: false });
    clearAuthCookies(res);
    throw ApiError.unauthorized('Session revoked, please sign in again');
  }
  await issueSession(user, res); // rotation
  res.json({ success: true, data: { user } });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const { sub } = verifyRefreshToken(token);
      await User.updateOne({ _id: sub }, { $unset: { refreshTokenHash: 1 } });
    } catch { /* ignore invalid token on logout */ }
  }
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out' });
});

export const me = (req, res) => res.json({ success: true, data: { user: req.user } });
