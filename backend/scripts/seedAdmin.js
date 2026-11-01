import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) { console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD'); process.exit(1); }

await connectDB(env.mongoUri);
const existing = await User.findOne({ email });
if (existing) {
  existing.role = 'admin';
  await existing.save();
  console.log(`Promoted existing user ${email} to admin`);
} else {
  await User.create({ name: 'Administrator', email, password, role: 'admin' });
  console.log(`Created admin ${email}`);
}
await disconnectDB();
