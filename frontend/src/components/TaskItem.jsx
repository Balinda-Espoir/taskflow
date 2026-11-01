import { Calendar, Pencil, Trash2 } from 'lucide-react';

const STATUS = {
  todo: { label: 'To do', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  in_progress: { label: 'In progress', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  done: { label: 'Done', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
};
const PRIORITY = {
  low: 'text-slate-500',
  medium: 'text-brand-600',
  high: 'text-red-600',
};

export default function TaskItem({ task, onEdit, onDelete, onToggle }) {
  const overdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();
  const s = STATUS[task.status];
  return (
    <li className="flex items-start gap-3 p-4">
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'not done' : 'done'}`}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : ''}`}>{task.title}</p>
        {task.description && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={`badge ${s.cls}`}>{s.label}</span>
          <span className={`font-medium capitalize ${PRIORITY[task.priority]}`}>{task.priority} priority</span>
          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 ${overdue ? 'font-medium text-red-600' : 'text-slate-500'}`}>
              <Calendar className="h-3.5 w-3.5" />{new Date(task.dueDate).toLocaleDateString()}{overdue && ' · overdue'}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button className="btn-ghost !p-2" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Pencil className="h-4 w-4" /></button>
        <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}><Trash2 className="h-4 w-4" /></button>
      </div>
    </li>
  );
}
