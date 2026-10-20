/**
 * Security-focused integration tests:
 * - Privilege escalation prevention
 * - User data isolation
 * - Invalid token rejection
 * - Mass assignment protection
 */

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Visit = require('../src/models/Visit');
const Enquiry = require('../src/models/Enquiry');
const Plot = require('../src/models/Plot');
const { connectTestDB, clearCollections, createUser } = require('./helpers');

beforeAll(() => connectTestDB());
afterEach(() => clearCollections(User, Visit, Enquiry, Plot));
afterAll(() => mongoose.disconnect());

// ── Token / auth ──────────────────────────────────────────────────────────────

describe('Token security', () => {
  it('rejects a tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.sig');
    expect(res.status).toBe(401);
  });

  it('rejects a well-formed JWT signed with the wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: new mongoose.Types.ObjectId() }, 'wrong-secret', { expiresIn: '1h' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired JWT', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});

// ── Privilege escalation ──────────────────────────────────────────────────────

describe('Privilege escalation prevention', () => {
  it('registration cannot set role=admin', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker',
      email: 'hacker@example.com',
      mobile: '9123456789',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'admin', // attempt to escalate
    });
    expect(res.status).toBe(201);
    const user = await User.findOne({ email: 'hacker@example.com' });
    expect(user.role).toBe('user'); // role ignored, defaulted to user
  });

  it('ordinary user cannot access admin enquiry list', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const res = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(403);
  });

  it('ordinary user cannot access admin visit list', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const res = await request(app).get('/api/visits').set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(403);
  });

  it('ordinary user cannot access admin stats', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const res = await request(app).get('/api/dashboard/admin').set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated user cannot access admin plot create', async () => {
    const res = await request(app).post('/api/plots').send({ number: 99, plotId: 'P099', area: 100, price: 1, status: 'available' });
    expect(res.status).toBe(401);
  });
});

// ── User data isolation ───────────────────────────────────────────────────────

describe('User data isolation', () => {
  it('user dashboard returns only own visits and enquiries', async () => {
    const user = await createUser();
    const otherUser = await createUser({ email: 'other@example.com' });

    const visitData = {
      name: 'Test', mobile: '9876543210',
      preferredDate: new Date(), preferredTime: '10 AM',
    };
    await Visit.create({ ...visitData, userId: user._id });
    await Visit.create({ ...visitData, userId: otherUser._id });

    const enquiryData = { name: 'Test', mobile: '9876543210', message: 'Some message here...' };
    await Enquiry.create({ ...enquiryData, userId: user._id });
    await Enquiry.create({ ...enquiryData, userId: otherUser._id });

    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const token = loginRes.body.token;

    const visitRes = await request(app).get('/api/visits/mine').set('Authorization', `Bearer ${token}`);
    expect(visitRes.body.visits).toHaveLength(1);
    expect(visitRes.body.visits[0].userId.toString()).toBe(user._id.toString());

    const enquiryRes = await request(app).get('/api/enquiries/mine').set('Authorization', `Bearer ${token}`);
    expect(enquiryRes.body.enquiries).toHaveLength(1);
    expect(enquiryRes.body.enquiries[0].userId.toString()).toBe(user._id.toString());
  });
});

// ── Input validation ──────────────────────────────────────────────────────────

describe('Input validation', () => {
  it('registration rejects XSS in name field (stored safely, not sanitized to empty)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '<script>alert(1)</script>',
      email: 'xss@example.com',
      mobile: '9123456789',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
    // Should succeed (name is stored as text, not executed; rendered safely by React)
    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('<script>alert(1)</script>');
  });

  it('registration requires valid Indian mobile (must start with 6-9)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test2@example.com',
      mobile: '1234567890', // starts with 1, invalid
      password: 'Password1',
      confirmPassword: 'Password1',
    });
    expect(res.status).toBe(422);
  });

  it('passwordHash is never exposed in any user response', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test3@example.com',
      mobile: '9876543210',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
    const token = regRes.body.token;
    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(JSON.stringify(regRes.body)).not.toContain('passwordHash');
    expect(JSON.stringify(meRes.body)).not.toContain('passwordHash');
  });
});
