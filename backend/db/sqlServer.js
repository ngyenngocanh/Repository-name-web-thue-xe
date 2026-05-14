const sql = require('mssql');

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  const s = String(value).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
}

function getSqlConfigFromEnv() {
  const host = process.env.SQLSERVER_HOST;
  const database = process.env.SQLSERVER_DB;
  const user = process.env.SQLSERVER_USER;
  const password = process.env.SQLSERVER_PASSWORD;
  const port = parseInt(process.env.SQLSERVER_PORT || '1433', 10);

  if (!host) throw new Error('Missing env SQLSERVER_HOST');
  if (!database) throw new Error('Missing env SQLSERVER_DB');
  if (!user) throw new Error('Missing env SQLSERVER_USER');
  if (!password) throw new Error('Missing env SQLSERVER_PASSWORD');

  // Support both "localhost\SQLEXPRESS" and "localhost" formats.
  // The .env stores it as localhost\\SQLEXPRESS (escaped backslash)
  const [server, instanceName] = String(host).split('\\');

  const config = {
    server,
    database,
    user,
    password,
    port,
    options: {
      encrypt: parseBool(process.env.SQLSERVER_ENCRYPT, true),
      trustServerCertificate: parseBool(process.env.SQLSERVER_TRUST_SERVER_CERT, true),
    },
    pool: {
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
    },
    requestTimeout: 30000,
    connectionTimeout: 15000,
  };

  // Only add instanceName when NOT using a fixed port override from env
  if (instanceName && !process.env.SQLSERVER_PORT) {
    config.options.instanceName = instanceName;
  }

  return config;
}

let poolPromise;

async function getSqlPool() {
  if (!poolPromise) {
    const config = getSqlConfigFromEnv();
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

module.exports = { sql, getSqlPool };
