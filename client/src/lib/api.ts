import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;

export const auth = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) => api.post('/auth/register', { email, password, name }),
};

export const categories = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
};

export const search = {
  all: (q: string, type?: string) => api.get('/search', { params: { q, type } }),
};

export const resources = {
  getAll: (params?: any) => api.get('/resources', { params }),
  getPopular: () => api.get('/resources/popular'),
  getRecent: () => api.get('/resources/recent'),
  getFeatured: () => api.get('/resources/featured'),
  getStats: () => api.get('/resources/stats'),
  download: (id: number) => api.post(`/resources/${id}/download`),
  view: (id: number) => api.post(`/resources/${id}/view`),
};

export const users = {
  getMe: () => api.get('/users/me'),
  getStats: () => api.get('/users/stats'),
};

export const teachers = {
  getAll: () => api.get('/teachers'),
  getBySlug: (slug: string) => api.get(`/teachers/${slug}`),
};

export const books = {
  getAll: () => api.get('/books'),
  getBySlug: (slug: string) => api.get(`/books/${slug}`),
};

export const newsletter = {
  subscribe: (email: string, language?: string) => api.post('/newsletter/subscribe', { email, language }),
};

export const live = {
  get: () => api.get('/live'),
  update: (data: any) => api.put('/live', data),
};

export const appearance = {
  get: () => api.get('/appearance'),
  update: (data: any) => api.put('/appearance', data),
  reset: () => api.post('/appearance/reset'),
};

export const admin = {
  getStats: () => api.get('/admin/stats'),
  categories: {
    getAll: (params?: any) => api.get('/admin/categories', { params }),
    create: (data: any) => api.post('/admin/categories', data),
    update: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
    delete: (id: number) => api.delete(`/admin/categories/${id}`),
  },
  users: {
    getAll: (params?: any) => api.get('/admin/users', { params }),
    getById: (id: number) => api.get(`/admin/users/${id}`),
    delete: (id: number) => api.delete(`/admin/users/${id}`),
  },
  upload: (formData: FormData) => api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBulk: (formData: FormData) => api.post('/admin/upload/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
  }),
  resources: {
    getAll: () => api.get('/admin/resources'),
    update: (id: number, data: any) => api.put(`/admin/resources/${id}`, data),
    delete: (url: string) => api.delete('/admin/resources', { data: { url } }),
    bulkDelete: (ids: number[]) => api.post('/admin/resources/bulk-delete', { ids }),
    deleteByCategory: (category: string, resourceType?: string) =>
      api.post('/admin/resources/delete-by-category', { category, resourceType }),
    moveCollection: (ids: number[], collection: string) =>
      api.post('/admin/resources/move-collection', { ids, collection }),
    autoClassify: (ids?: number[]) => api.post('/admin/resources/auto-classify', { ids }),
    deleteAll: (resourceType?: string) => api.post('/admin/resources/delete-all', { resourceType: resourceType || 'ALL' }),
  },
  collections: {
    delete: (slug: string) => api.delete(`/admin/collections/${slug}`),
  },
  analytics: {
    get: () => api.get('/analytics/admin'),
  },
  notifications: {
    getAll: (params?: any) => api.get('/notifications', { params }),
    create: (data: any) => api.post('/notifications', data),
    markRead: (id: number) => api.put(`/notifications/${id}/read`),
    delete: (id: number) => api.delete(`/notifications/${id}`),
  },
  activity: {
    getAll: (params?: any) => api.get('/admin/activity', { params }),
  },
  backup: {
    export: () => api.get('/admin/backup/export', { responseType: 'blob' }),
    import: (formData: FormData) => api.post('/admin/backup/import', formData),
  },
  newsletter: {
    getAll: (params?: any) => api.get('/admin/newsletter', { params }),
    send: (data: any) => api.post('/admin/newsletter/send', data),
    delete: (id: number) => api.delete(`/admin/newsletter/${id}`),
  },
  duplicates: {
    find: () => api.get('/admin/duplicates'),
    merge: (keepId: number, deleteIds: number[]) => api.post('/admin/duplicates/merge', { keepId, deleteIds }),
  },
  repairTypes: () => api.post('/admin/repair-types'),
  telegram: {
    getAll: (params?: any) => api.get('/admin/telegram', { params }),
    getById: (id: number) => api.get(`/admin/telegram/${id}`),
    create: (data: any) => api.post('/admin/telegram', data),
    update: (id: number, data: any) => api.put(`/admin/telegram/${id}`, data),
    delete: (id: number) => api.delete(`/admin/telegram/${id}`),
    bulkDelete: (ids: number[]) => api.post('/admin/telegram/bulk-delete', { ids }),
    bulkImport: (data: any[]) => api.post('/admin/telegram/bulk-import', data),
    toggleEnabled: (id: number) => api.put(`/admin/telegram/${id}/toggle-enabled`),
    getStats: () => api.get('/admin/telegram/stats'),
  },
};

export const telegram = {
  getAll: () => api.get('/telegram'),
  getById: (id: number) => api.get(`/telegram/${id}`),
  getByCollection: (slug: string) => api.get(`/telegram/collection/${slug}`),
  getStats: () => api.get('/telegram/stats'),
  checkAccess: () => api.get('/telegram/check'),
};

export const telegramAccess = {
  getAll: () => api.get('/telegram/channels'),
  getStats: () => api.get('/telegram/stats'),
};

export const resourceCategories = {
  getAll: () => api.get('/resource-categories'),
  getBySlug: (slug: string, params?: any) => api.get(`/resource-categories/${slug}`, { params }),
};

export const bulkImport = {
  upload: (formData: FormData) => api.post('/admin/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
  scanFolder: (data?: any) => api.post('/admin/import/scan-folder', data),
  getCategories: () => api.get('/admin/import/categories'),
};

export const dashboard = {
  get: () => api.get('/dashboard'),
  getBookmarks: () => api.get('/dashboard/bookmarks'),
  checkBookmark: (lessonId: number) => api.get(`/dashboard/bookmarks/check/${lessonId}`),
  addBookmark: (lessonId: number) => api.post(`/dashboard/bookmarks/${lessonId}`),
  removeBookmark: (lessonId: number) => api.delete(`/dashboard/bookmarks/${lessonId}`),
  getDownloads: () => api.get('/dashboard/downloads'),
  getActivity: () => api.get('/dashboard/activity'),
  getRecommended: () => api.get('/dashboard/recommended'),
  updateProfile: (data: any) => api.put('/dashboard/profile', data),
  changePassword: (data: any) => api.put('/dashboard/password', data),
};

export const downloads = {
  getSecureUrl: (resourceId: number) => `/api/download/${resourceId}`,
  track: (resourceId: number) => api.post(`/download/track/${resourceId}`),
  download: (resourceId: number) => api.get(`/download/${resourceId}`, { responseType: 'blob' }),
};

// Convenience aliases used by AudioPlayer, LessonDetail etc.
export const bookmarks = {
  add: (lessonId: number) => api.post(`/dashboard/bookmarks/${lessonId}`),
  remove: (lessonId: number) => api.delete(`/dashboard/bookmarks/${lessonId}`),
  check: (lessonId: number) => api.get(`/dashboard/bookmarks/check/${lessonId}`),
};

export const progress = {
  update: (lessonId: number, position: number, completed = false) =>
    api.post('/progress', { lessonId, position, completed }),
};

export const lessons = {
  getBySlug: (slug: string) => api.get(`/lessons/${slug}`),
  getAll: (params?: any) => api.get('/lessons', { params }),
};

export const collections = {
  getBySlug: (slug: string, params?: any) => api.get(`/resources/collections/${slug}`, { params }),
  getStats: () => api.get('/resources/collections/stats'),
};

