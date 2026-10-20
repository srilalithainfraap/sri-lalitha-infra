import { api } from './client';

export async function createVisit(data) {
  return api.post('/visits', data);
}

export async function getVisits(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const qs = params.toString() ? `?${params}` : '';
  return api.get(`/visits${qs}`);
}

export async function getMyVisits() {
  return api.get('/visits/mine');
}

export async function updateVisitStatus(id, status) {
  return api.patch(`/visits/${id}/status`, { status });
}
