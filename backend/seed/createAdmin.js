/**
 * One-time script to create a login account for any role (admin/staff/student).
 *
 * Public self-registration is disabled (POST /api/auth/register now requires
 * an existing admin to be logged in), so this script bootstraps accounts by
 * writing directly to the database.
 *
 * Usage (run from the backend/ folder, with your .env already set up):
 *   node seed/createAdmin.js "Jane Superintendent" admin@hostel.edu "SomeStrongPassword123" admin
 *   node seed/createAdmin.js "John Student" student@hostel.edu "SomeStrongPassword123" student
 *
 * The 4th argument (role) is optional and defaults to "admin" if omitted.
 * Valid roles: admin, staff, student
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
  const [, , nameArg, emailArg, passwordArg, roleArg] = process.argv;

  const name = nameArg || 'Admin';
  const email = (emailArg || 'admin@hostel.edu').toLowerCase();
  const password = passwordArg || 'ChangeMe123';
  const role = ['admin', 'staff', 'student'].includes(roleArg) ? roleArg : 'admin';

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

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  console.log('Account created:');
  console.log(`  Name:  ${user.name}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role:  ${user.role}`);
  console.log('You can now log in on the website with this email and the password you provided.');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to create account:', error.message);
  process.exit(1);
});