import { useEffect } from 'react';
import { connectSocket } from '../services/socket';

export default function useSocketEvent(events, handler) {
  useEffect(() => {
    const socket = connectSocket();
    const list = Array.isArray(events) ? events : [events];
    list.forEach((e) => socket.on(e, handler));
    return () => list.forEach((e) => socket.off(e, handler));
  }, [events, handler]);
}
