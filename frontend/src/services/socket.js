import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(SOCKET_URL, { withCredentials: true, reconnectionAttempts: 10, reconnectionDelay: 1000 });
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
