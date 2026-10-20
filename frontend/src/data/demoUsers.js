// NOTE: btoa() is used here for demo-only password obfuscation.
// This is NOT secure production authentication. Never use this approach for real apps.

export const demoUsers = [
  {
    id: 'demo-user-001',
    name: 'Demo User',
    email: 'user@demo.com',
    mobile: '9876543210',
    // btoa('Demo@1234')
    passwordHash: btoa('Demo@1234'),
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-admin-001',
    name: 'Admin',
    email: 'admin@srilalitha.com',
    mobile: '9000000000',
    // btoa('Admin@1234')
    passwordHash: btoa('Admin@1234'),
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];
