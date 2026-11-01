import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute, { GuestRoute } from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import PageLoader from './components/PageLoader';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
