import { Server } from 'socket.io';
import cookie from 'cookie';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../services/token.service.js';

let io = null;
const connections = new Map(); // userId -> number of open sockets

export const isOnline = (userId) => (connections.get(userId.toString()) || 0) > 0;
export const onlineCount = () => connections.size;

export function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientOrigins, credentials: true },
  });

  // Authenticate every connection using the same httpOnly access-token cookie as the REST API
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      if (!cookies.accessToken) return next(new Error('unauthorized'));
      const payload = verifyAccessToken(cookies.accessToken);
      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) return next(new Error('unauthorized'));
      socket.data.user = { id: user._id.toString(), role: user.role, name: user.name };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.data.user;
    socket.join(`user:${id}`);
    if (role === 'admin') socket.join('admins');
    connections.set(id, (connections.get(id) || 0) + 1);
    io.to('admins').emit('presence:update', { online: onlineCount() });
    socket.emit('presence:update', { online: onlineCount() });

    socket.on('disconnect', () => {
      const n = (connections.get(id) || 1) - 1;
      if (n <= 0) connections.delete(id); else connections.set(id, n);
      io.to('admins').emit('presence:update', { online: onlineCount() });
    });
  });

  return io;
}

export const closeSocket = () => new Promise((resolve) => (io ? io.close(() => resolve()) : resolve()));
