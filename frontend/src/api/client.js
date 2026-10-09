const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('mentorsync_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Refresh on 401
  if (response.status === 401 && localStorage.getItem('mentorsync_refresh_token')) {
    const refreshToken = localStorage.getItem('mentorsync_refresh_token');
    try {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        localStorage.setItem('mentorsync_access_token', refreshData.access);
        headers['Authorization'] = `Bearer ${refreshData.access}`;
        // Retry original request
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        localStorage.removeItem('mentorsync_access_token');
        localStorage.removeItem('mentorsync_refresh_token');
        localStorage.removeItem('mentorsync_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    } catch {
      localStorage.removeItem('mentorsync_access_token');
      localStorage.removeItem('mentorsync_refresh_token');
      localStorage.removeItem('mentorsync_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  return response;
}

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.non_field_errors?.[0] || 'Invalid credentials');
  }

  return data;
}

export async function fetchCurrentUser() {
  const res = await fetchApi('/api/auth/me/');
  if (!res.ok) {
    throw new Error('Failed to retrieve user session');
  }
  return res.json();
}

export async function checkBackendHealth() {
  const res = await fetch(`${BASE_URL}/api/health/`);
  return res.json();
}
