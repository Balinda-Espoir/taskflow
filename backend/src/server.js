import http from 'http';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';
import { initSocket, closeSocket } from './sockets/index.js';

async function main() {
  await connectDB(env.mongoUri);
  console.log('MongoDB connected');

  const server = http.createServer(createApp());
  initSocket(server);
  server.listen(env.port, () => console.log(`API listening on :${env.port} (${env.nodeEnv})`));

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down...`);
    const force = setTimeout(() => process.exit(1), 10000);
    force.unref();
    await closeSocket();
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => { console.error('Fatal startup error:', err); process.exit(1); });
