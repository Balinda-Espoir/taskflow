import { useCallback, useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { userService } from '../services/task.service';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import useSocketEvent from '../hooks/useSocketEvent';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function Admin() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [online, setOnline] = useState(null);
  const [loading, setLoading] = useState(true);
  const search = useDebounce(searchText);

  const load = useCallback(async () => {
    try {
      const res = await userService.list({ page, limit: 10, ...(search ? { search } : {}) });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load users'));
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const onPresence = useCallback((p) => { setOnline(p.online); load(); }, [load]);
  useSocketEvent('presence:update', onPresence);

  const patch = async (u, body) => {
    try {
      await userService.update(u._id, body);
      toast.success('User updated');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User management</h1>
        <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">{online ?? '–'} online</span>
      </div>

      <div className="card">
        <div className="relative border-b border-slate-200 p-3 dark:border-slate-800">
          <Search className="pointer-events-none absolute left-6 top-5.5 mt-0.5 h-4 w-4 text-slate-400" />
          <input className="input !pl-9" placeholder="Search by name or email…" value={searchText} onChange={(e) => { setSearchText(e.target.value); setPage(1); }} aria-label="Search users" />
        </div>
        {loading ? (
          <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try a different search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((u) => {
                  const self = u._id === me._id;
                  return (
                    <tr key={u._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${u.online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} title={u.online ? 'Online' : 'Offline'} />
                          <div><p className="font-medium">{u.name}{self && <span className="ml-1 text-xs text-slate-400">(you)</span>}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select className="input !w-28 !py-1" value={u.role} disabled={self} onChange={(e) => patch(u, { role: e.target.value })} aria-label={`Role for ${u.name}`}>
                          <option value="user">User</option><option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-ghost !py-1" disabled={self} onClick={() => patch(u, { isActive: !u.isActive })}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onChange={setPage} />
      </div>
    </div>
  );
}
