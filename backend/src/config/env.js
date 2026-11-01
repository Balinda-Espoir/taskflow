
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const required = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

if (!isTest) {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(', ')}`
    );
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  isProd: process.env.NODE_ENV === 'production',

  isTest,

  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGODB_URI,

  accessSecret: process.env.JWT_ACCESS_SECRET || 'test-access-secret',

  refreshSecret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',

  accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',

  refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,

  clientOrigins: (
    process.env.CLIENT_URL || 'http://localhost:5173'
  )
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
};
