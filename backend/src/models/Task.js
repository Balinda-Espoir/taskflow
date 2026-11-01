import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, default: null },
    deletedAt: { type: Date, default: null }, // soft delete
  },
  { timestamps: true }
);

taskSchema.index({ owner: 1, deletedAt: 1, status: 1, createdAt: -1 });

taskSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.deletedAt;
    return ret;
  },
});

export const Task = mongoose.model('Task', taskSchema);
