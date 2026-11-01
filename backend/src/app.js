import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { globalLimiter, requireCustomHeader } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind Render's proxy

  app.use(helmet());
  app.use(cors({
    origin(origin, cb) {
      if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  }));
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev'));
  app.use(globalLimiter);

  app.get('/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', db: dbUp ? 'up' : 'down', uptime: process.uptime() });
  });

  app.use('/api/v1', requireCustomHeader, routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
