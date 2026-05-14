const { getSqlPool } = require('./db/sqlServer');
require('dotenv').config();

async function checkCamry() {
  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('id', 'fe26f59e8a4e9833f756db34')
      .query('SELECT * FROM dbo.Cars WHERE id = @id');
    console.log(JSON.stringify(result.recordset[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkCamry();
