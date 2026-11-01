import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { taskService } from '../services/task.service';
import { getErrorMessage } from '../services/api';
import useDebounce from '../hooks/useDebounce';
import useSocketEvent from '../hooks/useSocketEvent';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const SOCKET_EVENTS = ['task:created', 'task:updated', 'task:deleted'];

function StatCard({ label, value, tone = '' }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value ?? '–'}</p>
    </div>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest', page: 1 });
  const [editing, setEditing] = useState(null); // null | 'new' | task
  const [deleting, setDeleting] = useState(null);

  const search = useDebounce(filters.search);

  const load = useCallback(async () => {
    try {
      const params = { page: filters.page, limit: 8, sort: filters.sort };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const [list, s] = await Promise.all([taskService.list(params), taskService.stats()]);
      setTasks(list.data);
      setMeta(list.meta);
      setStats(s);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.sort, filters.status, search]);

  useEffect(() => { setLoading(true); load(); }, [load]);
  useSocketEvent(SOCKET_EVENTS, load); // keeps other tabs/devices in sync in real time

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, page: 1 }));

  const save = async (values) => {
    if (editing === 'new') { await taskService.create(values); toast.success('Task created'); }
    else { await taskService.update(editing._id, values); toast.success('Task updated'); }
    setEditing(null);
    load();
  };

  const toggle = async (task) => {
    try {
      await taskService.update(task._id, { status: task.status === 'done' ? 'todo' : 'done' });
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const confirmDelete = async () => {
    try {
      await taskService.remove(deleting._id);
      toast.success('Task deleted');
      setDeleting(null);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />New task</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={stats?.total} />
        <StatCard label="In progress" value={stats?.in_progress} tone="text-amber-600" />
        <StatCard label="Completed" value={stats?.done} tone="text-emerald-600" />
        <StatCard label="Overdue" value={stats?.overdue} tone="text-red-600" />
      </div>

      <div className="card">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-3 dark:border-slate-800 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input !pl-9" placeholder="Search tasks…" value={filters.search} onChange={setFilter('search')} aria-label="Search tasks" />
          </div>
          <select className="input sm:w-40" value={filters.status} onChange={setFilter('status')} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          <select className="input sm:w-40" value={filters.sort} onChange={setFilter('sort')} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="dueDate">Due date</option>
            <option value="title">Title</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : error ? (
          <EmptyState title="Couldn't load tasks" description={error} action={<button className="btn-primary" onClick={load}>Retry</button>} />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={search || filters.status ? 'No matching tasks' : 'No tasks yet'}
            description={search || filters.status ? 'Try changing your search or filters.' : 'Create your first task to get started.'}
            action={!search && !filters.status && <button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" />New task</button>}
          />
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {tasks.map((t) => <TaskItem key={t._id} task={t} onEdit={setEditing} onDelete={setDeleting} onToggle={toggle} />)}
          </ul>
        )}
        <Pagination meta={meta} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New task' : 'Edit task'}>
        {editing && <TaskForm task={editing === 'new' ? null : editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete task?">
        <p className="text-sm text-slate-600 dark:text-slate-300">"{deleting?.title}" will be removed. This cannot be undone from the UI.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="btn-danger" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
