/**
 * One-time script to create the first admin ("Head") account.
 *
 * Public self-registration is disabled (POST /api/auth/register now requires
 * an existing admin to be logged in), so this script bootstraps that very
 * first account by writing directly to the database.
 *
 * Usage (run from the backend/ folder, with your .env already set up):
 *   node seed/createAdmin.js "Jane Superintendent" admin@hostel.edu "SomeStrongPassword123"
 *
 * If you don't pass arguments, it falls back to the defaults below —
 * change them first, or just always pass your own values on the command line.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
  const [, , nameArg, emailArg, passwordArg] = process.argv;

  const name = nameArg || 'Admin';
  const email = (emailArg || 'admin@hostel.edu').toLowerCase();
  const password = passwordArg || 'ChangeMe123';

  const mongoURI = process.env.MONGO_URI?.trim();
  if (!mongoURI) {
    console.error('MONGO_URI is not set. Copy backend/.env.example to backend/.env and fill it in first.');
    process.exit(1);
  }

  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB.');

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`A user with email "${email}" already exists (role: ${existing.role}). Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('Admin account created:');
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);
  console.log('You can now log in on the website with this email and the password you provided.');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to create admin:', error.message);
  process.exit(1);
});