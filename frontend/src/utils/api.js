/**
 * Authenticated fetch wrapper.
 * JWT tokens are stored in HttpOnly cookies — the browser sends them
 * automatically on every request when credentials: 'include' is set.
 */
export const apiFetch = async (url, options = {}) => {
  const headers = { ...options.headers };

  // Don't set Content-Type for FormData — browser handles it
  if (!(options.body instanceof FormData)) {
    if (!headers['Content-Type'] && options.method && options.method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends HttpOnly cookies automatically
  });

  if (response.status === 401) {
    // Clear the frontend flag cookie and redirect to login
    document.cookie = 'is_authenticated=; path=/; max-age=0';
    window.location.href = '/login';
  }

  return response;
};

/** Quick synchronous check — reads the non-HttpOnly flag cookie */
export const isAuthenticated = () =>
  document.cookie.split(';').some(c => c.trim().startsWith('is_authenticated=1'));
