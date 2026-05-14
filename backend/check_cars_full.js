const { getSqlPool } = require('./db/sqlServer');
require('dotenv').config();

async function checkCars() {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query('SELECT * FROM dbo.Cars');
    console.log(JSON.stringify(result.recordset, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkCars();
