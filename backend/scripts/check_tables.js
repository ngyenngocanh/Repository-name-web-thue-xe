require('dotenv').config();
const { getSqlPool } = require('../db/sqlServer');

async function main() {
  try {
    const pool = await getSqlPool();
    
    // List tables
    const tables = await pool.request().query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME"
    );
    console.log('=== Existing SQL Tables ===');
    tables.recordset.forEach(t => console.log(' -', t.TABLE_NAME));
    
    // Count rows in each table
    console.log('\n=== Row Counts ===');
    for (const t of tables.recordset) {
      const count = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${t.TABLE_NAME}]`);
      console.log(` ${t.TABLE_NAME}: ${count.recordset[0].cnt} rows`);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
  process.exit();
}

main();
