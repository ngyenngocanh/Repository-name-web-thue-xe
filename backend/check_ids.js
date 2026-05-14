const { getSqlPool, sql } = require('./db/sqlServer');
require('dotenv').config();

async function checkData() {
  try {
    const pool = await getSqlPool();
    const cars = await pool.request().query('SELECT id, brand, model FROM dbo.Cars');
    console.log('Cars:', cars.recordset);
    
    const users = await pool.request().query('SELECT id, fullName, email, role FROM dbo.Users');
    console.log('Users:', users.recordset);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkData();
