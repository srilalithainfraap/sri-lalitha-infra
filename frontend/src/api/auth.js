import { api, saveToken, clearToken } from './client';

export async function register({ name, email, mobile, password, confirmPassword }) {
  const data = await api.post('/auth/register', { name, email, mobile, password, confirmPassword });
  if (data.token) saveToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password });
  if (data.token) saveToken(data.token);
  return data;
}

export async function getMe() {
  return api.get('/auth/me');
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch { /* ignore network errors on logout */ }
  clearToken();
}

export async function toggleSavedPlot(plotId) {
  return api.patch('/auth/saved-plots', { plotId });
}
