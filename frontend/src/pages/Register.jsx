import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err, 'Registration failed'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <h2 className="text-lg font-semibold">Create your account</h2>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">{error}</p>}
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" required autoComplete="name" className="input" value={form.name} onChange={set('name')} />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={set('email')} />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" required autoComplete="new-password" className="input" value={form.password} onChange={set('password')} />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters, with a letter and a number.</p>
        {errors.password && <p className="field-error">{errors.password}</p>}
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      <p className="text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link></p>
    </form>
  );
}
