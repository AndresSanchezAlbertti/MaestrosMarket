import { api } from './client.js';

export const listingsApi = {
  list: (params = {}) => api.get('/listings', { params }).then((r) => r.data),
  detail: (id) => api.get(`/listings/${id}`).then((r) => r.data),
  create: (data) => api.post('/listings', data).then((r) => r.data),
  update: (id, data) => api.put(`/listings/${id}`, data).then((r) => r.data),
};
