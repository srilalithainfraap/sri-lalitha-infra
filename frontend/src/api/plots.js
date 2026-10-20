import { api } from './client';

export async function getPlots(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const qs = params.toString() ? `?${params}` : '';
  return api.get(`/plots${qs}`);
}

export async function getPlot(plotId) {
  return api.get(`/plots/${plotId}`);
}

export async function updatePlotStatus(id, status) {
  return api.patch(`/plots/${id}/status`, { status });
}

export async function createPlot(data) {
  return api.post('/plots', data);
}

export async function deletePlot(id) {
  return api.delete(`/plots/${id}`);
}
