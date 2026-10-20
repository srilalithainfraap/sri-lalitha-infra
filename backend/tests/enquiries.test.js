const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Enquiry = require('../src/models/Enquiry');
const { connectTestDB, clearCollections, createUser } = require('./helpers');

beforeAll(() => connectTestDB());
afterEach(() => clearCollections(User, Enquiry));
afterAll(() => mongoose.disconnect());

const validEnquiry = {
  name: 'Priya Sharma',
  email: 'priya@example.com',
  mobile: '9876543210',
  message: 'Interested in plot P001, please contact me.',
};

describe('POST /api/enquiries', () => {
  it('creates an enquiry without auth', async () => {
    const res = await request(app).post('/api/enquiries').send(validEnquiry);
    expect(res.status).toBe(201);
    expect(res.body.enquiry.status).toBe('new');
  });

  it('rejects missing message', async () => {
    const res = await request(app).post('/api/enquiries').send({ ...validEnquiry, message: 'short' });
    expect(res.status).toBe(422);
  });

  it('rejects invalid mobile', async () => {
    const res = await request(app).post('/api/enquiries').send({ ...validEnquiry, mobile: '1234567890' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/enquiries (admin)', () => {
  beforeEach(() => Enquiry.insertMany([validEnquiry, { ...validEnquiry, email: 'other@example.com' }]));

  it('returns all enquiries for admin', async () => {
    const admin = await createUser({ email: 'admin@example.com', password: 'Admin123', role: 'admin' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'Admin123' });
    const token = loginRes.body.token;

    const res = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.enquiries).toHaveLength(2);
  });

  it('returns 403 for non-admin', async () => {
    const user = await createUser();
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
    const res = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(403);
  });
});
