import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskForm from './TaskForm';

describe('TaskForm', () => {
  it('blocks submission when the title is empty', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Write docs  ' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: 'Write docs', status: 'todo', dueDate: null });
  });
});
