// Клиент API для бэкенда
// Использует X-User-Id из Telegram WebApp

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getUserId() {
  const tg = window.Telegram?.WebApp;
  // В Telegram берём реальный ID, иначе мок для разработки
  return tg?.initDataUnsafe?.user?.id || 12345;
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': String(getUserId()),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// === Subjects ===
export const subjectsApi = {
  list: () => request('/subjects'),
  create: (data) => request('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),
  grades: (id) => request(`/subjects/${id}/grades`),
  addGrade: (id, data) => request(`/subjects/${id}/grades`, { method: 'POST', body: JSON.stringify(data) }),
  forecast: (id, data) => request(`/subjects/${id}/forecast`, { method: 'POST', body: JSON.stringify(data) })
};

// === Events ===
export const eventsApi = {
  list: () => request('/events'),
  create: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/events/${id}`, { method: 'DELETE' })
};

// === Grades ===
export const gradesApi = {
  remove: (id) => request(`/grades/${id}`, { method: 'DELETE' })
};

// === User ===
export const meApi = {
  get: () => request('/me'),
  update: (data) => request('/me', { method: 'PUT', body: JSON.stringify(data) })
};
