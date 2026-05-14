const { getSqlPool } = require('./db/sqlServer');
require('dotenv').config();

async function getCars() {
  const pool = await getSqlPool();
  const r = await pool.request().query('SELECT id, brand, model FROM dbo.Cars');
  console.log(r.recordset);
  process.exit();
}
getCars();
