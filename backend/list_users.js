const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Booking = require('./models/Booking');

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ role: 'driver' });
  users.forEach(u => console.log(`${u._id} - ${u.fullName} - ${u.email}`));
  process.exit(0);
}
listUsers();
