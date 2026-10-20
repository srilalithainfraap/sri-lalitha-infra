import { TOKEN_KEY } from './client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getGallery() {
  const res = await fetch(`${BASE_URL}/gallery`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to load gallery');
  return data;
}

export async function uploadGalleryItem(formData) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE_URL}/gallery`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // multipart — do NOT set Content-Type manually
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Upload failed');
  return data;
}

export async function deleteGalleryItem(id) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE_URL}/gallery/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Delete failed');
  return data;
}
