const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('hospital_auth_token');

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const text = await res.text();

  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned invalid JSON (${res.status})`
      );
    }
  }

  if (!res.ok) {
    throw new Error(
      json?.message ||
      `API request failed with status ${res.status}`
    );
  }

  if (!json) {
    return null;
  }

  if (json.success === false) {
    throw new Error(json.message || 'API Request failed');
  }

  return json.data;
}

export const api = {
  get: (url) =>
    fetchApi(url, {
      method: 'GET'
    }),

  post: (url, body) =>
    fetchApi(url, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: (url, body) =>
    fetchApi(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: (url) =>
    fetchApi(url, {
      method: 'DELETE'
    })
};