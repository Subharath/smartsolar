/**
 * API client – all backend communication goes through this file.
 *
 * When the C# ASP.NET Core API is ready:
 * 1. Set API_BASE_URL to your real API URL
 * 2. Set USE_MOCK_DATA = false
 * 3. Replace mock helpers in services/mockData.js with real endpoints
 */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5025/api'
  : `http://${window.location.hostname}:5025/api`;

// Use real ASP.NET Core Web API
export const USE_MOCK_DATA = false;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
