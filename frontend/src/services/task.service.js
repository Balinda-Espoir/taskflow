import api from './api';

export const taskService = {
  list: (params) => api.get('/tasks', { params }).then((r) => r.data),
  stats: () => api.get('/tasks/stats').then((r) => r.data.data),
  create: (body) => api.post('/tasks', body).then((r) => r.data.data),
  update: (id, body) => api.patch(`/tasks/${id}`, body).then((r) => r.data.data),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const userService = {
  list: (params) => api.get('/users', { params }).then((r) => r.data),
  update: (id, body) => api.patch(`/users/${id}`, body).then((r) => r.data.data),
};
