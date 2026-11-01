import { Outlet } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white"><CheckSquare className="h-6 w-6" /></span>
          <h1 className="text-xl font-semibold">TaskFlow</h1>
        </div>
        <div className="card p-6"><Outlet /></div>
      </div>
    </div>
  );
}
