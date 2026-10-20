const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

async function connectTestDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

async function clearCollections(...models) {
  await Promise.all(models.map((m) => m.deleteMany({})));
}

async function createUser(overrides = {}) {
  const defaults = {
    name: 'Test User',
    email: 'testuser@example.com',
    mobile: '9876543210',
    password: 'Password1',
    role: 'user',
  };
  const data = { ...defaults, ...overrides };
  const passwordHash = await User.hashPassword(data.password);
  return User.create({ ...data, passwordHash });
}

async function loginAs(userData) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: userData.email, password: userData.password });
  return res.body.token;
}

module.exports = { connectTestDB, clearCollections, createUser, loginAs };
