/**
 * Thin fetch wrapper that:
 *  - Reads the JWT from localStorage (key: sli_jwt)
 *  - Attaches Authorization: Bearer <token> on every request
 *  - Parses JSON responses
 *  - Throws an Error with the server's message on non-2xx responses
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY = 'sli_jwt';

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function saveToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

async function request(method, path, body, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = data?.errors ?? null;
    throw err;
  }

  return data;
}

export const api = {
  get:    (path, opts)        => request('GET',    path, undefined, opts),
  post:   (path, body, opts)  => request('POST',   path, body, opts),
  patch:  (path, body, opts)  => request('PATCH',  path, body, opts),
  put:    (path, body, opts)  => request('PUT',    path, body, opts),
  delete: (path, opts)        => request('DELETE', path, undefined, opts),
};
