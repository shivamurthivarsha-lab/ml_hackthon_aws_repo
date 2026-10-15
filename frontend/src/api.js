const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('smart_campus_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('smart_campus_token', token);
  } else {
    localStorage.removeItem('smart_campus_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => request('/auth/me'),
  quickSwitch: (role) =>
    request('/auth/quick-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Resources
  getResources: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/resources?${query.toString()}`);
  },
  getResourceById: (id) => request(`/resources/${id}`),
  createResource: (data) =>
    request('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateResource: (id, data) =>
    request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteResource: (id) =>
    request(`/resources/${id}`, {
      method: 'DELETE',
    }),

  // Requests
  getRequests: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/requests?${query.toString()}`);
  },
  createRequest: (data) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRequestStatus: (id, action, remarks = '') =>
    request(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action, remarks }),
    }),
  extendRequest: (id, extra_days = 3) =>
    request(`/requests/${id}/extend`, {
      method: 'PUT',
      body: JSON.stringify({ extra_days }),
    }),

  // Analytics
  getAnalytics: () => request('/analytics/dashboard'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'PUT' }),
  simulateEvent: (data) =>
    request('/notifications/simulate-event', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Locations
  getLocations: () => request('/locations'),

  // Logs & Demo
  getLogs: () => request('/logs'),
  resetDemoData: () => request('/logs/reset-demo', { method: 'POST' }),
};
