import { api } from './client.js';

export const adminApi = {
  stats: () => api.get('/admin/stats').then((r) => r.data),

  pendingListings: () => api.get('/admin/listings/pending').then((r) => r.data),
  approveListing: (id) => api.put(`/admin/listings/${id}/approve`).then((r) => r.data),
  rejectListing: (id, reason) =>
    api.put(`/admin/listings/${id}/reject`, { reason }).then((r) => r.data),

  // Usuarios
  listUsers: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data),
  pendingUsers: () => api.get('/admin/users/pending').then((r) => r.data),
  createUser: (data) => api.post('/admin/users', data).then((r) => r.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`).then((r) => r.data),
  rejectUser: (id, reason) =>
    api.put(`/admin/users/${id}/reject`, { reason }).then((r) => r.data),

  // Sindicatos
  listUnions: () => api.get('/admin/unions').then((r) => r.data),
  createUnion: (data) => api.post('/admin/unions', data).then((r) => r.data),
  updateUnion: (id, data) => api.put(`/admin/unions/${id}`, data).then((r) => r.data),
  deleteUnion: (id) => api.delete(`/admin/unions/${id}`).then((r) => r.data),
};
