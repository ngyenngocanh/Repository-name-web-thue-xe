const { getSqlPool, sql } = require('../db/sqlServer');
const bookingRepo = require('./bookingRepo');

async function initTable() {
  const pool = await getSqlPool();
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Contracts' AND xtype='U')
    CREATE TABLE dbo.Contracts (
      id VARCHAR(24) PRIMARY KEY,
      bookingId VARCHAR(24) NOT NULL,
      renterId VARCHAR(24) NOT NULL,
      ownerId VARCHAR(24) NOT NULL,
      carId VARCHAR(24),
      driverId VARCHAR(24),
      contractId NVARCHAR(100),
      content NVARCHAR(MAX),
      fileName NVARCHAR(255),
      renterSignatureJson NVARCHAR(MAX),
      ownerSignatureJson NVARCHAR(MAX),
      status VARCHAR(20) DEFAULT 'pending',
      createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
      updatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
    )
  `);
}

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toContractRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    booking: row.bookingId,
    renter: row.renterId,
    owner: row.ownerId,
    car: row.carId,
    driver: row.driverId,
    contractId: row.contractId,
    content: row.content,
    fileName: row.fileName,
    renterSignature: parseJson(row.renterSignatureJson),
    ownerSignature: parseJson(row.ownerSignatureJson),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function create(data) {
  const pool = await getSqlPool();
  const req = pool.request();
  const id = data._id ? String(data._id) : (new (require('mongoose').Types.ObjectId)()).toString();
  
  req.input('id', sql.VarChar(24), id);
  req.input('bookingId', sql.VarChar(24), String(data.booking));
  req.input('renterId', sql.VarChar(24), String(data.renter));
  req.input('ownerId', sql.VarChar(24), String(data.owner));
  req.input('carId', sql.VarChar(24), data.car ? String(data.car) : null);
  req.input('driverId', sql.VarChar(24), data.driver ? String(data.driver) : null);
  req.input('contractId', sql.NVarChar(100), data.contractId || null);
  req.input('content', sql.NVarChar(sql.MAX), data.content || null);
  req.input('fileName', sql.NVarChar(255), data.fileName || null);
  req.input('renterSignatureJson', sql.NVarChar(sql.MAX), data.renterSignature ? JSON.stringify(data.renterSignature) : null);
  req.input('ownerSignatureJson', sql.NVarChar(sql.MAX), data.ownerSignature ? JSON.stringify(data.ownerSignature) : null);
  req.input('status', sql.VarChar(20), data.status || 'pending');
  
  await req.query(`
    INSERT INTO dbo.Contracts (
      id, bookingId, renterId, ownerId, carId, driverId,
      contractId, content, fileName, renterSignatureJson, ownerSignatureJson, status,
      createdAt, updatedAt
    ) VALUES (
      @id, @bookingId, @renterId, @ownerId, @carId, @driverId,
      @contractId, @content, @fileName, @renterSignatureJson, @ownerSignatureJson, @status,
      SYSUTCDATETIME(), SYSUTCDATETIME()
    )
  `);
  
  return getByBookingId(data.booking);
}

async function getByBookingId(bookingId, populate = []) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('bookingId', sql.VarChar(24), String(bookingId))
    .query('SELECT TOP 1 * FROM dbo.Contracts WHERE bookingId = @bookingId');
    
  let contract = toContractRow(result.recordset[0]);
  if (!contract) return null;

  if (populate.length > 0) {
    // Manually populate references similar to bookingRepo
    const userIds = new Set();
    if (populate.includes('renter')) userIds.add(contract.renter);
    if (populate.includes('owner')) userIds.add(contract.owner);
    if (populate.includes('driver') && contract.driver) userIds.add(contract.driver);
    
    if (userIds.size > 0) {
      const ids = [...userIds];
      const req = pool.request();
      const inClause = ids.map((id, i) => { req.input(`u${i}`, sql.VarChar(24), id); return `@u${i}`; }).join(',');
      const usersRes = await req.query(`
        SELECT u.id, u.fullName, u.email, u.phone, u.idCardJson, u.drivingLicenseJson, a.fullAddress as address 
        FROM dbo.Users u 
        LEFT JOIN dbo.Addresses a ON u.addressId = a.id 
        WHERE u.id IN (${inClause})
      `);
      const userMap = {};
      usersRes.recordset.forEach(u => userMap[u.id] = { 
        _id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, 
        idCard: parseJson(u.idCardJson), drivingLicense: parseJson(u.drivingLicenseJson),
        address: u.address
      });
      if (populate.includes('renter')) contract.renter = userMap[contract.renter] || contract.renter;
      if (populate.includes('owner')) contract.owner = userMap[contract.owner] || contract.owner;
      if (populate.includes('driver') && contract.driver) contract.driver = userMap[contract.driver] || contract.driver;
    }
    
    if (populate.includes('car') && contract.car) {
      const req2 = pool.request();
      req2.input('carId', sql.VarChar(24), contract.car);
      const carRes = await req2.query('SELECT id, brand, model, licensePlate, year, color, seats, fuel, transmission, ownerId FROM dbo.Cars WHERE id = @carId');
      if (carRes.recordset[0]) {
        const c = carRes.recordset[0];
        contract.car = { 
          _id: c.id, 
          brand: c.brand, 
          model: c.model, 
          licensePlate: c.licensePlate,
          year: c.year,
          color: c.color,
          seats: c.seats,
          fuel: c.fuel,
          transmission: c.transmission,
          owner: c.ownerId
        };
      }
    }
    
    if (populate.includes('booking')) {
      const b = await bookingRepo.getById(contract.booking);
      if (b) contract.booking = b;
    }
  }
  
  return contract;
}

async function updateContract(bookingId, updates) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('bookingId', sql.VarChar(24), String(bookingId));
  
  const setClauses = [];
  if (updates.renterSignature) { req.input('renterSig', sql.NVarChar(sql.MAX), JSON.stringify(updates.renterSignature)); setClauses.push('renterSignatureJson=@renterSig'); }
  if (updates.ownerSignature) { req.input('ownerSig', sql.NVarChar(sql.MAX), JSON.stringify(updates.ownerSignature)); setClauses.push('ownerSignatureJson=@ownerSig'); }
  if (updates.status) { req.input('status', sql.VarChar(20), updates.status); setClauses.push('status=@status'); }
  
  if (setClauses.length === 0) return getByBookingId(bookingId);
  
  setClauses.push('updatedAt=SYSUTCDATETIME()');
  
  await req.query(`UPDATE dbo.Contracts SET ${setClauses.join(', ')} WHERE bookingId=@bookingId`);
  return getByBookingId(bookingId);
}

// Call initTable right away so the table is created at startup if needed
initTable().catch(err => console.error("Error init Contracts table:", err));

module.exports = {
  create,
  getByBookingId,
  updateContract
};
