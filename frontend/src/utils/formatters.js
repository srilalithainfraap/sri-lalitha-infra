export function formatCurrency(amount) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatPlotId(id) {
  return id?.toUpperCase() ?? '—';
}

export function getStatusColor(status) {
  switch (status) {
    case 'available': return { bg: '#B88A35', text: '#FFFFFF', label: 'Available' };
    case 'reserved': return { bg: '#3B82F6', text: '#FFFFFF', label: 'Reserved' };
    case 'sold': return { bg: '#6B7280', text: '#FFFFFF', label: 'Sold' };
    default: return { bg: '#9CA3AF', text: '#FFFFFF', label: status };
  }
}
