require('dotenv').config();
const { getSqlPool } = require('./config/database');
const sql = require('mssql');
(async () => {
  const pool = await getSqlPool();
  const res = await pool.request().query("SELECT id FROM dbo.Users WHERE email='admin@carrental.vn'");
  console.log('ID in MSSQL:', res.recordset[0]?.id);
  process.exit(0);
})();
