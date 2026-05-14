require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne({});
  console.log("user.avatar exists:", !!user.avatar);
  console.log("JSON.stringify(user.avatar):");
  const str = JSON.stringify(user.avatar);
  console.log(str ? str.substring(0, 100) + '...' : 'null');
  
  process.exit(0);
}
test().catch(console.error);
