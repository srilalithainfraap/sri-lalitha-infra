import { api } from './client';

export async function getAdminStats() {
  return api.get('/dashboard/admin');
}

export async function getUserStats() {
  return api.get('/dashboard/user');
}
