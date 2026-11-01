import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/auth/me')
      .then((r) => active && setUser(r.data.data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onForcedLogout = () => setUser(null);
    window.addEventListener('auth:logout', onForcedLogout);
    return () => window.removeEventListener('auth:logout', onForcedLogout);
  }, []);

  useEffect(() => {
    if (user) connectSocket(); else disconnectSocket();
  }, [user]);

  const login = useCallback(async (body) => {
    const { data } = await api.post('/auth/login', body);
    setUser(data.data.user);
  }, []);

  const register = useCallback(async (body) => {
    const { data } = await api.post('/auth/register', body);
    setUser(data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally { setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
