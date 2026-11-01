import { useState } from 'react';
import { getErrorMessage, getFieldErrors } from '../services/api';

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: toInputDate(task?.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit({ ...form, title: form.title.trim(), dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4" noValidate>
      {formError && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">{formError}</p>}
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" className="input" value={form.title} onChange={set('title')} maxLength={120} autoFocus />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" className="input min-h-[80px]" value={form.description} onChange={set('description')} maxLength={2000} />
        {errors.description && <p className="field-error">{errors.description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={form.status} onChange={set('status')}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="priority">Priority</label>
          <select id="priority" className="input" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="dueDate">Due date</label>
          <input id="dueDate" type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
      </div>
    </form>
  );
}
