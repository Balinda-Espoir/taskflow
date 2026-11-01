import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.accessSecret, { expiresIn: env.accessTtl });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), jti: crypto.randomUUID() }, env.refreshSecret, {
    expiresIn: `${env.refreshTtlDays}d`,
  });

export const verifyAccessToken = (t) => jwt.verify(t, env.accessSecret);
export const verifyRefreshToken = (t) => jwt.verify(t, env.refreshSecret);
export const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

const baseCookie = () => ({
  httpOnly: true,
  secure: env.isProd,
  // Frontend (Vercel) and backend (Render) are different sites in production => SameSite=None + Secure.
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
});

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, { ...baseCookie(), maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...baseCookie(), maxAge: env.refreshTtlDays * 86400 * 1000 });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', baseCookie());
  res.clearCookie('refreshToken', baseCookie());
}

export async function issueSession(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  setAuthCookies(res, { accessToken, refreshToken });
}
