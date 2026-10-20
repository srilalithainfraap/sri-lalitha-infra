const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const { connectTestDB, clearCollections } = require('./helpers');

beforeAll(() => connectTestDB());
afterEach(() => clearCollections(User));
afterAll(() => mongoose.disconnect());

describe('POST /api/auth/register', () => {
  const valid = {
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    mobile: '9876543210',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, token: expect.any(String) });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(409);
  });

  it('rejects invalid mobile (8-digit)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, mobile: '12345678' });
    expect(res.status).toBe(422);
  });

  it('rejects mismatched passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, confirmPassword: 'wrong' });
    expect(res.status).toBe(422);
  });

  it('rejects weak password (no uppercase)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, password: 'password1', confirmPassword: 'password1' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      mobile: '9876543210',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ravi@example.com', password: 'Password1' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, token: expect.any(String) });
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ravi@example.com', password: 'Wrongpass1' });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'Password1' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      mobile: '9876543210',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
    const token = regRes.body.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('ravi@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
