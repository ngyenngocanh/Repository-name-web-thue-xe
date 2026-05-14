require('dotenv').config();
const { getSqlPool } = require('../db/sqlServer');

async function debug() {
  try {
    const pool = await getSqlPool();
    const adminCheck = await pool.request()
      .input('email', 'admin@carrental.vn')
      .query('SELECT id, email, passwordHash FROM dbo.Users WHERE email = @email');
    console.log('Admin passwordHash:', adminCheck.recordset[0]?.passwordHash);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
debug();
