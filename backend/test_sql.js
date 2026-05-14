const sql = require('mssql');
require('dotenv').config({ path: './.env' });

async function test() {
  try {
    const config = {
      user: process.env.SQLSERVER_USER,
      password: process.env.SQLSERVER_PASSWORD,
      server: process.env.SQLSERVER_HOST.replace(/\\\\/g, '\\'), // Handle double backslash if any
      database: process.env.SQLSERVER_DB,
      options: {
        encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQLSERVER_TRUST_SERVER_CERT === 'true'
      }
    };
    
    console.log("Connecting with config:", {
      server: config.server,
      user: config.user,
      database: config.database
    });

    const pool = await sql.connect(config);
    console.log("SQL Server connected successfully!");
    
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log("Version:", result.recordset[0].version);
    
    await pool.close();
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
}
test();
