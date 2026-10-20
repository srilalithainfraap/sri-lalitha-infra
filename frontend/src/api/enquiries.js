import { api } from './client';

export async function createEnquiry(data) {
  return api.post('/enquiries', data);
}

export async function getEnquiries(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const qs = params.toString() ? `?${params}` : '';
  return api.get(`/enquiries${qs}`);
}

export async function getMyEnquiries() {
  return api.get('/enquiries/mine');
}

export async function updateEnquiryStatus(id, status) {
  return api.patch(`/enquiries/${id}/status`, { status });
}

export async function deleteEnquiry(id) {
  return api.delete(`/enquiries/${id}`);
}
