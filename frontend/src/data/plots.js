const sizes = [100, 120, 150, 200];
const facings = ['East', 'West', 'North', 'South'];
const roads = ['Main Road', 'Cross Road 1', 'Cross Road 2', 'Cross Road 3', 'Inner Lane'];
const dimMap = { 100: '20x45 ft', 120: '24x45 ft', 150: '30x45 ft', 200: '40x45 ft' };

// Deterministic status distribution: ~35 available, ~12 reserved, ~13 sold
const statusSeq = [
  'available','available','available','sold','available',
  'available','reserved','available','available','sold',
  'available','available','reserved','available','sold',
  'available','available','available','reserved','sold',
  'available','sold','available','available','reserved',
  'available','available','sold','available','available',
  'reserved','available','available','sold','available',
  'available','reserved','available','available','sold',
  'available','available','reserved','available','sold',
  'available','available','available','reserved','sold',
  'available','sold','available','available','reserved',
  'available','available','sold','available','available',
];

const plots = Array.from({ length: 60 }, (_, i) => {
  const n = i + 1;
  const row = Math.floor(i / 10) + 1;
  const col = (i % 10) + 1;
  const area = sizes[i % sizes.length];
  const facing = facings[i % facings.length];
  const road = roads[Math.floor(i / 12) % roads.length];
  const status = statusSeq[i] || 'available';
  const basePrice = area === 100 ? 3000000 : area === 120 ? 3600000 : area === 150 ? 4500000 : 6000000;
  const variation = (i % 5) * 50000;

  return {
    id: `P${String(n).padStart(3, '0')}`,
    number: n,
    area,
    facing,
    dimensions: dimMap[area],
    price: basePrice + variation,
    status,
    row,
    col,
    road,
    features: area >= 150
      ? ['Corner Plot', 'Wide Road Facing']
      : area === 120
      ? ['Wide Road Facing']
      : [],
  };
});

export default plots;
