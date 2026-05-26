import { api } from './client.js';

export const unionsApi = {
  list: () => api.get('/unions').then((r) => r.data),
  create: (data) => api.post('/unions', data).then((r) => r.data),
};
