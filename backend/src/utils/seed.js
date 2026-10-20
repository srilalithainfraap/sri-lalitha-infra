/**
 * Seed the database with:
 *  - One admin user (from environment variables)
 *  - 60 plots matching the frontend's static data
 *
 * Usage:  npm run seed
 * Pass FORCE=true to drop existing data before seeding.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Plot = require('../models/Plot');

// ── Static plot data (mirrors src/data/plots.js) ──────────────────────────
const sizes = [100, 120, 150, 200];
const facings = ['East', 'West', 'North', 'South'];
const roads = ['Main Road', 'Cross Road 1', 'Cross Road 2', 'Cross Road 3', 'Inner Lane'];
const dimMap = { 100: '20x45 ft', 120: '24x45 ft', 150: '30x45 ft', 200: '40x45 ft' };

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

const plotsData = Array.from({ length: 60 }, (_, i) => {
  const n = i + 1;
  const area = sizes[i % sizes.length];
  const facing = facings[i % facings.length];
  const road = roads[Math.floor(i / 12) % roads.length];
  const status = statusSeq[i] || 'available';
  const basePrice = area === 100 ? 3000000 : area === 120 ? 3600000 : area === 150 ? 4500000 : 6000000;
  const variation = (i % 5) * 50000;

  return {
    number:     n,
    plotId:     `P${String(n).padStart(3, '0')}`,
    area,
    dimensions: dimMap[area],
    facing,
    road,
    price:      basePrice + variation,
    status,
    row:        Math.floor(i / 10) + 1,
    col:        (i % 10) + 1,
    features:   area >= 150 ? ['Corner Plot', 'Wide Road Facing'] : area === 120 ? ['Wide Road Facing'] : [],
  };
});

async function seed() {
  await connectDB();

  const force = process.env.FORCE === 'true';

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL is not set in .env — aborting');
    process.exit(1);
  }

  const existing = await User.findOne({ email: adminEmail });
  if (existing && !force) {
    console.log(`Admin user ${adminEmail} already exists — skipping (use FORCE=true to overwrite)`);
  } else {
    if (existing) await existing.deleteOne();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is not set in .env — aborting');
      process.exit(1);
    }

    const passwordHash = await User.hashPassword(adminPassword);
    await User.create({
      name:         process.env.ADMIN_NAME   || 'Administrator',
      email:        adminEmail,
      mobile:       process.env.ADMIN_MOBILE || '9999999999',
      passwordHash,
      role:         'admin',
    });
    console.log(`Admin user created: ${adminEmail}`);
  }

  // ── Plots ──────────────────────────────────────────────────────────────────
  const plotCount = await Plot.countDocuments();
  if (plotCount > 0 && !force) {
    console.log(`${plotCount} plots already exist — skipping (use FORCE=true to overwrite)`);
  } else {
    if (force) await Plot.deleteMany({});
    await Plot.insertMany(plotsData);
    console.log(`Inserted ${plotsData.length} plots`);
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
