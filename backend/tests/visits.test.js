const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Visit = require('../src/models/Visit');
const { connectTestDB, clearCollections, createUser } = require('./helpers');

beforeAll(() => connectTestDB());
afterEach(() => clearCollections(User, Visit));
afterAll(() => mongoose.disconnect());

const validVisit = {
  name: 'Suresh Babu',
  email: 'suresh@example.com',
  mobile: '9876543210',
  preferredDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  preferredTime: '10:00 AM',
  message: 'Would like to visit the plot.',
};

describe('POST /api/visits', () => {
  it('creates a visit without auth', async () => {
    const res = await request(app).post('/api/visits').send(validVisit);
    expect(res.status).toBe(201);
    expect(res.body.visit.status).toBe('pending');
  });

  it('rejects invalid date', async () => {
    const res = await request(app).post('/api/visits').send({ ...validVisit, preferredDate: 'not-a-date' });
    expect(res.status).toBe(422);
  });

  it('rejects invalid mobile', async () => {
    const res = await request(app).post('/api/visits').send({ ...validVisit, mobile: '5555555555' });
    expect(res.status).toBe(422);
  });

  it('returns 409 when same auth user books the same date twice', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const token = loginRes.body.token;
    const sameDay = new Date(Date.now() + 86400000).toISOString();
    await request(app).post('/api/visits').set('Authorization', `Bearer ${token}`).send({ ...validVisit, preferredDate: sameDay });
    const res = await request(app).post('/api/visits').set('Authorization', `Bearer ${token}`).send({ ...validVisit, preferredDate: sameDay });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/visits/mine', () => {
  it('returns only the current user\'s visits', async () => {
    const user = await createUser();
    const otherUser = await createUser({ email: 'other@example.com' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const token = loginRes.body.token;

    // Create a visit for user
    await Visit.create({ ...validVisit, userId: user._id });
    // Create a visit for another user
    await Visit.create({ ...validVisit, userId: otherUser._id });

    const res = await request(app).get('/api/visits/mine').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.visits).toHaveLength(1);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/visits/mine');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/visits/:id/status (admin only)', () => {
  it('admin can update visit status', async () => {
    const admin = await createUser({ email: 'admin@example.com', password: 'Admin123', role: 'admin' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'Admin123' });
    const token = loginRes.body.token;

    const visit = await Visit.create(validVisit);
    const res = await request(app)
      .patch(`/api/visits/${visit._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.visit.status).toBe('confirmed');
  });

  it('regular user cannot update visit status', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const visit = await Visit.create(validVisit);
    const res = await request(app)
      .patch(`/api/visits/${visit._id}/status`)
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(403);
  });
});
