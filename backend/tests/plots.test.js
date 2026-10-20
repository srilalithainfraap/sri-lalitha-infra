const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Plot = require('../src/models/Plot');
const { connectTestDB, clearCollections, createUser } = require('./helpers');

beforeAll(() => connectTestDB());
afterEach(() => clearCollections(User, Plot));
afterAll(() => mongoose.disconnect());

const samplePlot = {
  number: 1, plotId: 'P001', area: 100, dimensions: '20x45 ft',
  facing: 'East', road: 'Main Road', price: 3000000, status: 'available', row: 1, col: 1,
};

async function getAdminToken() {
  const admin = await createUser({ email: 'admin@example.com', password: 'Admin123', role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'Admin123' });
  return res.body.token;
}

describe('GET /api/plots', () => {
  beforeEach(() => Plot.insertMany([
    { ...samplePlot },
    { ...samplePlot, number: 2, plotId: 'P002', status: 'sold' },
  ]));

  it('returns all plots', async () => {
    const res = await request(app).get('/api/plots');
    expect(res.status).toBe(200);
    expect(res.body.plots).toHaveLength(2);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/plots?status=sold');
    expect(res.status).toBe(200);
    expect(res.body.plots).toHaveLength(1);
    expect(res.body.plots[0].status).toBe('sold');
  });
});

describe('GET /api/plots/:plotId', () => {
  beforeEach(() => Plot.create(samplePlot));

  it('returns a plot by plotId', async () => {
    const res = await request(app).get('/api/plots/P001');
    expect(res.status).toBe(200);
    expect(res.body.plot.plotId).toBe('P001');
  });

  it('returns 404 for unknown plotId', async () => {
    const res = await request(app).get('/api/plots/P999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/plots/:id/status (admin only)', () => {
  it('updates plot status as admin', async () => {
    const token = await getAdminToken();
    const plot = await Plot.create(samplePlot);
    const res = await request(app)
      .patch(`/api/plots/${plot._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sold' });
    expect(res.status).toBe(200);
    expect(res.body.plot.status).toBe('sold');
  });

  it('rejects non-admin', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const token = loginRes.body.token;
    const plot = await Plot.create(samplePlot);
    const res = await request(app)
      .patch(`/api/plots/${plot._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'sold' });
    expect(res.status).toBe(403);
  });
});
