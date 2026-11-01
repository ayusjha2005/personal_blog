/**
 * Centralized API service with credentials support for session cookies
 */
const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  // If body is NOT FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Crucial for express-session cookie
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Public
  getHome: () => apiRequest('/home'),
  getProfile: () => apiRequest('/profile'),
  getCategories: () => apiRequest('/categories'),
  getArticles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.q) query.set('q', params.q);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return apiRequest(`/articles${qs ? `?${qs}` : ''}`);
  },
  getArticle: (slug) => apiRequest(`/articles/${slug}`),
  likeArticle: (slug) => apiRequest(`/articles/${slug}/like`, { method: 'POST' }),
  commentArticle: (slug, data) => apiRequest(`/articles/${slug}/comment`, { method: 'POST', body: data }),
  sendContact: (data) => apiRequest('/contact', { method: 'POST', body: data }),
  getActivity: () => apiRequest('/activity'),
  getLeaderboard: () => apiRequest('/leaderboard'),

  // Auth
  getMe: () => apiRequest('/auth/me'),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // Admin
  getStats: () => apiRequest('/admin/stats'),
  getAdminArticles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/articles${qs ? `?${qs}` : ''}`);
  },
  getAdminArticle: (id) => apiRequest(`/admin/articles/${id}`),
  createArticle: (formData) => apiRequest('/admin/articles', { method: 'POST', body: formData }),
  updateArticle: (id, formData) => apiRequest(`/admin/articles/${id}`, { method: 'PUT', body: formData }),
  toggleArticleStatus: (id) => apiRequest(`/admin/articles/${id}/toggle`, { method: 'POST' }),
  deleteArticle: (id) => apiRequest(`/admin/articles/${id}`, { method: 'DELETE' }),

  getComments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/comments${qs ? `?${qs}` : ''}`);
  },
  deleteComment: (articleId, commentId) => apiRequest(`/admin/comments/${articleId}/${commentId}`, { method: 'DELETE' }),

  getMessages: (status) => apiRequest(`/admin/messages${status ? `?status=${status}` : ''}`),
  markMessage: (id) => apiRequest(`/admin/messages/${id}/mark`, { method: 'PATCH' }),
  deleteMessage: (id) => apiRequest(`/admin/messages/${id}`, { method: 'DELETE' }),

  getAdminProfile: () => apiRequest('/admin/profile'),
  updateProfile: (formData) => apiRequest('/admin/profile', { method: 'PUT', body: formData }),

  getSettings: () => apiRequest('/admin/settings'),
  updateSettings: (data) => apiRequest('/admin/settings', { method: 'PUT', body: data }),
};
