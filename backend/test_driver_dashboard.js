const mongoose = require('mongoose');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const userRepo = require('./repositories/userRepo');
  
  // Find "Nguyễn Ngọc Ánh"
  const pool = await require('./db/sqlServer').getSqlPool();
  const res = await pool.request().query("SELECT TOP 1 id FROM dbo.Users WHERE email = 'anh@gmail.com'");
  let userId = res.recordset[0]?.id;
  if (!userId) {
    const fallbackRes = await pool.request().query("SELECT TOP 1 id FROM dbo.Users WHERE fullName LIKE N'%Ánh%'");
    userId = fallbackRes.recordset[0]?.id;
  }
  console.log("User ID:", userId);

  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  
  const axios = require('axios');
  try {
    const response = await axios.get('http://localhost:3000/api/driver/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", Object.keys(response.data));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
  process.exit(0);
}
test().catch(console.error);
