import { api } from './client.js';

export const messagesApi = {
  list: (listingId) => api.get(`/messages/${listingId}`).then((r) => r.data),
  send: (listingId, data) => api.post(`/messages/${listingId}`, data).then((r) => r.data),
};
