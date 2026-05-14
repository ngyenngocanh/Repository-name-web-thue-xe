const { getSqlPool, sql } = require('../db/sqlServer');

async function initTable() {
  const pool = await getSqlPool();
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payouts' AND xtype='U')
    CREATE TABLE dbo.Payouts (
      id VARCHAR(24) PRIMARY KEY,
      payeeId VARCHAR(24) NOT NULL,
      amount DECIMAL(18,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      method VARCHAR(50),
      notes NVARCHAR(MAX),
      adminId VARCHAR(24),
      transactionId VARCHAR(100),
      createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
      updatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
    )
  `);
}

function toPayoutRow(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    payee: row.payeeId,
    amount: row.amount,
    status: row.status,
    method: row.method,
    notes: row.notes,
    admin: row.adminId,
    transactionId: row.transactionId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function getEarningsAndPayouts(userId, role) {
  const pool = await getSqlPool();
  let totalEarned = 0;
  
  if (role === 'driver') {
    const res = await pool.request()
      .input('driverId', sql.VarChar(24), String(userId))
      .query(`
        SELECT 
          ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.driverFee') AS DECIMAL(18,2))), 0) + 
          ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.driverTripFee') AS DECIMAL(18,2))), 0) as earned
        FROM dbo.Bookings
        WHERE driverId = @driverId 
          AND status IN ('completed', 'active')
          AND JSON_VALUE(paymentJson, '$.status') = 'paid'
      `);
    totalEarned = res.recordset[0].earned || 0;
  } else if (role === 'collaborator') {
    const res = await pool.request()
      .input('bookedById', sql.VarChar(24), String(userId))
      .query(`
        SELECT 
          ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.ctvCommission') AS DECIMAL(18,2))), 0) as earned
        FROM dbo.Bookings
        WHERE bookedById = @bookedById 
          AND status IN ('completed', 'active')
          AND JSON_VALUE(paymentJson, '$.status') = 'paid'
      `);
    totalEarned = res.recordset[0].earned || 0;
  }

  const payoutsRes = await pool.request()
    .input('payeeId', sql.VarChar(24), String(userId))
    .query(`SELECT ISNULL(SUM(amount), 0) as totalPaid FROM dbo.Payouts WHERE payeeId = @payeeId AND status = 'completed'`);
  
  const totalPaid = payoutsRes.recordset[0].totalPaid || 0;
  
  return { totalEarned, totalPaid };
}

async function create(data) {
  const pool = await getSqlPool();
  const id = data._id ? String(data._id) : (new (require('mongoose').Types.ObjectId)()).toString();
  
  await pool.request()
    .input('id', sql.VarChar(24), id)
    .input('payeeId', sql.VarChar(24), String(data.payee))
    .input('amount', sql.Decimal(18,2), data.amount)
    .input('status', sql.VarChar(20), data.status || 'completed')
    .input('method', sql.VarChar(50), data.method || 'bank_transfer')
    .input('notes', sql.NVarChar(sql.MAX), data.notes || '')
    .input('adminId', sql.VarChar(24), data.admin ? String(data.admin) : null)
    .input('transactionId', sql.VarChar(100), data.transactionId || '')
    .query(`
      INSERT INTO dbo.Payouts (id, payeeId, amount, status, method, notes, adminId, transactionId)
      VALUES (@id, @payeeId, @amount, @status, @method, @notes, @adminId, @transactionId)
    `);
    
  return getById(id);
}

async function getById(id) {
  const pool = await getSqlPool();
  const res = await pool.request().input('id', sql.VarChar(24), String(id)).query('SELECT * FROM dbo.Payouts WHERE id = @id');
  return toPayoutRow(res.recordset[0]);
}

async function getByPayee(userId) {
  const pool = await getSqlPool();
  const res = await pool.request()
    .input('payeeId', sql.VarChar(24), String(userId))
    .query('SELECT * FROM dbo.Payouts WHERE payeeId = @payeeId ORDER BY createdAt DESC');
  return res.recordset.map(toPayoutRow);
}

initTable().catch(err => console.error("Error init Payouts table:", err));

module.exports = {
  getEarningsAndPayouts,
  create,
  getById,
  getByPayee
};
