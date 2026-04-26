require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN = {
  name: 'Admin',
  email: 'admin@campus.com',
  password: 'Admin@1234',
  role: 'admin',
  enrollmentNo: 'ADMIN001',
  semester: 1,
  branch: 'CSE',
};

async function resetAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let admin = await User.findOne({ email: ADMIN.email });

  if (admin) {
    // Force password update — triggers pre-save hash
    admin.password = ADMIN.password;
    admin.role = 'admin';
    await admin.save();
    console.log('Admin password reset successfully');
  } else {
    await User.create(ADMIN);
    console.log('Admin created');
  }

  console.log('Email:', ADMIN.email);
  console.log('Password:', ADMIN.password);
  await mongoose.disconnect();
  process.exit(0);
}

resetAdmin().catch(err => { console.error(err); process.exit(1); });
