const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Plot = require('../src/models/Plot');
const { connectTestDB, clearCollections, createUser, loginAs } = require('./helpers');

beforeAll(() => connectTestDB());
afterEach(() => clearCollections(User, Plot));
afterAll(() => mongoose.disconnect());

const validPlot = {
  number: 1,
  plotId: 'TEST-001',
  area: 100,
  dimensions: '20x45 ft',
  facing: 'East',
  road: '30ft road',
  price: 500000,
  status: 'available',
};

describe('PATCH /api/auth/saved-plots', () => {
  it('requires authentication — 401 without token', async () => {
    const res = await request(app).patch('/api/auth/saved-plots').send({ plotId: 'TEST-001' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when plotId body field is missing', async () => {
    const user = await createUser();
    const token = await loginAs({ email: user.email, password: 'Password1' });
    const res = await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for a plotId that does not exist', async () => {
    const user = await createUser();
    const token = await loginAs({ email: user.email, password: 'Password1' });
    const res = await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({ plotId: 'DOES-NOT-EXIST' });
    expect(res.status).toBe(404);
  });

  it('saves a plot and returns it in savedPlots as a plotId string', async () => {
    await Plot.create(validPlot);
    const user = await createUser();
    const token = await loginAs({ email: user.email, password: 'Password1' });

    const res = await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({ plotId: 'TEST-001' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.savedPlots).toContain('TEST-001');
  });

  it('unsaves a previously saved plot — returns empty array', async () => {
    await Plot.create(validPlot);
    const user = await createUser();
    const token = await loginAs({ email: user.email, password: 'Password1' });

    await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({ plotId: 'TEST-001' });

    const res = await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({ plotId: 'TEST-001' });

    expect(res.status).toBe(200);
    expect(res.body.savedPlots).not.toContain('TEST-001');
    expect(res.body.savedPlots).toHaveLength(0);
  });

  it('persists saved plot — appears in GET /api/auth/me', async () => {
    await Plot.create(validPlot);
    const user = await createUser();
    const token = await loginAs({ email: user.email, password: 'Password1' });

    await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({ plotId: 'TEST-001' });

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.savedPlots).toContain('TEST-001');
  });

  it('does not leak saved plots across users', async () => {
    await Plot.create(validPlot);
    const user1 = await createUser({ email: 'user1@example.com' });
    const user2 = await createUser({ email: 'user2@example.com' });
    const token1 = await loginAs({ email: 'user1@example.com', password: 'Password1' });
    const token2 = await loginAs({ email: 'user2@example.com', password: 'Password1' });

    await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token1}`)
      .send({ plotId: 'TEST-001' });

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token2}`);

    expect(meRes.body.user.savedPlots).toHaveLength(0);
  });

  it('saved plot deleted from DB is omitted from savedPlots response', async () => {
    const plot = await Plot.create(validPlot);
    const user = await createUser();
    const token = await loginAs({ email: user.email, password: 'Password1' });

    await request(app)
      .patch('/api/auth/saved-plots')
      .set('Authorization', `Bearer ${token}`)
      .send({ plotId: 'TEST-001' });

    await Plot.findByIdAndDelete(plot._id);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.body.user.savedPlots).toHaveLength(0);
  });
});
