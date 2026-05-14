require('dotenv').config();
const { getSqlPool, sql } = require('../db/sqlServer');

async function debug() {
  try {
    console.log('Connecting to SQL...');
    const pool = await getSqlPool();
    console.log('Connected!');
    
    console.log('Checking Users table columns...');
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Users'
    `);
    console.log('Columns in Users table:');
    console.table(result.recordset);
    
    console.log('Checking if admin user exists...');
    const adminCheck = await pool.request()
      .input('email', 'admin@carrental.vn')
      .query('SELECT id, email, fullName, role FROM dbo.Users WHERE email = @email');
    console.log('Admin check result:', adminCheck.recordset);
    
    process.exit(0);
  } catch (err) {
    console.error('Debug Error:', err);
    process.exit(1);
  }
}

debug();
