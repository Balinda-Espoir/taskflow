import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-semibold">Sign in</h2>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">{error}</p>}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" required autoComplete="current-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      <p className="text-center text-sm text-slate-500">No account? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create one</Link></p>
    </form>
  );
}
