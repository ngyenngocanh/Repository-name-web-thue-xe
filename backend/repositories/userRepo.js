const bcrypt = require('bcryptjs');
const { getSqlPool, sql } = require('../db/sqlServer');

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toUserRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    passwordHash: row.passwordHash,
    phone: row.phone,
    role: row.role,
    isVerified: !!row.isVerified,
    isOnline: !!row.isOnline,
    isActive: !!row.isActive,
    addressId: row.addressId,
    rating: { average: Number(row.ratingAverage ?? 0), count: Number(row.ratingCount ?? 0) },
    totalEarnings: Number(row.totalEarnings ?? 0),
    preferences: parseJson(row.preferencesJson),
    driverInfo: parseJson(row.driverInfoJson),
    ownerInfo: parseJson(row.ownerInfoJson),
    collaboratorRequest: parseJson(row.collaboratorRequestJson),
    contract: parseJson(row.contractJson),
    totalTrips: parseJson(row.totalTripsJson),
    avatar: parseJson(row.avatarJson),
    idCard: parseJson(row.idCardJson),
    drivingLicense: parseJson(row.drivingLicenseJson),
    bankAccount: parseJson(row.bankAccountJson),
    emergencyContact: parseJson(row.emergencyContactJson),
    driverSchedules: parseJson(row.driverSchedulesJson),
    address: row.address,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastLogin: row.lastLogin,
  };
}

async function getUserByEmail(email) {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input('email', sql.VarChar(255), String(email || '').toLowerCase())
    .query('SELECT TOP 1 * FROM dbo.Users WHERE email = @email');
  return toUserRow(result.recordset?.[0]);
}

async function getUserById(id) {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input('id', sql.VarChar(24), String(id))
    .query(`
      SELECT u.*, a.fullAddress as address 
      FROM dbo.Users u 
      LEFT JOIN dbo.Addresses a ON u.addressId = a.id 
      WHERE u.id = @id
    `);
  return toUserRow(result.recordset?.[0]);
}

async function getAll({ filter = {}, skip = 0, limit = 10, sort = 'createdAt DESC' } = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  
  let where = '1=1';
  
  if (filter.role) {
    if (filter.role.$ne) {
      req.input('roleNe', sql.VarChar(20), filter.role.$ne);
      where += ' AND role <> @roleNe';
    } else if (filter.role.$in && Array.isArray(filter.role.$in)) {
      const roleList = filter.role.$in.map((r, i) => {
        req.input(`role${i}`, sql.VarChar(20), r);
        return `@role${i}`;
      }).join(',');
      where += ` AND role IN (${roleList})`;
    } else {
      req.input('role', sql.VarChar(20), filter.role);
      where += ' AND role = @role';
    }
  }
  
  if (filter.isVerified !== undefined && filter.isVerified !== '') {
    req.input('isVerified', sql.Bit, filter.isVerified ? 1 : 0);
    where += ' AND isVerified = @isVerified';
  }
  
  if (filter.isActive !== undefined) {
    req.input('isActive', sql.Bit, filter.isActive ? 1 : 0);
    where += ' AND isActive = @isActive';
  }
  
  if (filter.search) {
    req.input('search', sql.NVarChar(200), `%${filter.search}%`);
    where += ' AND (fullName LIKE @search OR email LIKE @search OR phone LIKE @search)';
  }
  
  req.input('skip', sql.Int, skip);
  req.input('limit', sql.Int, limit);
  
  // Exclude ALL heavy JSON columns for list view (avatar, idCard, drivingLicense, driverInfo, collaboratorRequest contain MB-sized base64 images)
  const listColumns = `id, fullName, email, passwordHash, phone, role, isVerified, isOnline, isActive,
    addressId, ratingAverage, ratingCount, totalEarnings,
    preferencesJson, totalTripsJson, bankAccountJson, emergencyContactJson, driverSchedulesJson,
    createdAt, updatedAt, lastLogin`;
  
  const result = await req.query(`
    SELECT ${listColumns} FROM dbo.Users 
    WHERE ${where} 
    ORDER BY ${sort} 
    OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY
  `);
  
  return result.recordset.map(toUserRow);
}

async function countDocuments(filter = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  
  let where = '1=1';
  
  if (filter.role) {
    if (filter.role.$ne) {
      req.input('roleNe', sql.VarChar(20), filter.role.$ne);
      where += ' AND role <> @roleNe';
    } else if (filter.role.$in) {
      const roleList = filter.role.$in.map((r, i) => {
        req.input(`role${i}`, sql.VarChar(20), r);
        return `@role${i}`;
      }).join(',');
      where += ` AND role IN (${roleList})`;
    } else {
      req.input('role', sql.VarChar(20), filter.role);
      where += ' AND role = @role';
    }
  }
  
  if (filter.isVerified !== undefined && filter.isVerified !== '') {
    req.input('isVerified', sql.Bit, filter.isVerified ? 1 : 0);
    where += ' AND isVerified = @isVerified';
  }
  
  if (filter.isActive !== undefined) {
    req.input('isActive', sql.Bit, filter.isActive ? 1 : 0);
    where += ' AND isActive = @isActive';
  }
  
  if (filter.search) {
    req.input('search', sql.NVarChar(200), `%${filter.search}%`);
    where += ' AND (fullName LIKE @search OR email LIKE @search OR phone LIKE @search)';
  }
  
  if (filter.createdAt) {
    if (filter.createdAt.$gte) {
      req.input('createdGte', sql.DateTime2, filter.createdAt.$gte);
      where += ' AND createdAt >= @createdGte';
    }
    if (filter.createdAt.$lt) {
      req.input('createdLt', sql.DateTime2, filter.createdAt.$lt);
      where += ' AND createdAt < @createdLt';
    }
    if (filter.createdAt.$lte) {
      req.input('createdLte', sql.DateTime2, filter.createdAt.$lte);
      where += ' AND createdAt <= @createdLte';
    }
  }
  
  const result = await req.query(`SELECT COUNT(*) as cnt FROM dbo.Users WHERE ${where}`);
  return result.recordset[0].cnt;
}

async function updateUser(id, updates) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('id', sql.VarChar(24), String(id));
  
  const setClauses = [];
  
  if (updates.fullName !== undefined) { req.input('fullName', sql.NVarChar(100), updates.fullName); setClauses.push('fullName=@fullName'); }
  if (updates.email !== undefined) { req.input('email', sql.VarChar(255), updates.email); setClauses.push('email=@email'); }
  if (updates.phone !== undefined) { req.input('phone', sql.VarChar(30), updates.phone); setClauses.push('phone=@phone'); }
  if (updates.role !== undefined) { req.input('role', sql.VarChar(20), updates.role); setClauses.push('role=@role'); }
  if (updates.isActive !== undefined) { req.input('isActive', sql.Bit, updates.isActive ? 1 : 0); setClauses.push('isActive=@isActive'); }
  if (updates.isVerified !== undefined) { req.input('isVerified', sql.Bit, updates.isVerified ? 1 : 0); setClauses.push('isVerified=@isVerified'); }
  if (updates.isOnline !== undefined) { req.input('isOnline', sql.Bit, updates.isOnline ? 1 : 0); setClauses.push('isOnline=@isOnline'); }
  if (updates.collaboratorRequestJson !== undefined) { req.input('crJson', sql.NVarChar(sql.MAX), updates.collaboratorRequestJson); setClauses.push('collaboratorRequestJson=@crJson'); }
  if (updates.driverInfoJson !== undefined) { req.input('diJson', sql.NVarChar(sql.MAX), updates.driverInfoJson); setClauses.push('driverInfoJson=@diJson'); }
  if (updates.bankAccount !== undefined) { req.input('bankAccountJson', sql.NVarChar(sql.MAX), updates.bankAccount ? JSON.stringify(updates.bankAccount) : null); setClauses.push('bankAccountJson=@bankAccountJson'); }
  if (updates.avatar !== undefined) { req.input('avatarJson', sql.NVarChar(sql.MAX), updates.avatar ? JSON.stringify(updates.avatar) : null); setClauses.push('avatarJson=@avatarJson'); }
  if (updates.idCard !== undefined) { req.input('idCardJson', sql.NVarChar(sql.MAX), updates.idCard ? JSON.stringify(updates.idCard) : null); setClauses.push('idCardJson=@idCardJson'); }
  if (updates.drivingLicense !== undefined) { req.input('drivingLicenseJson', sql.NVarChar(sql.MAX), updates.drivingLicense ? JSON.stringify(updates.drivingLicense) : null); setClauses.push('drivingLicenseJson=@drivingLicenseJson'); }
  if (updates.addressId !== undefined) { req.input('addressId', sql.VarChar(24), updates.addressId ? String(updates.addressId) : null); setClauses.push('addressId=@addressId'); }
  
  setClauses.push('updatedAt=SYSUTCDATETIME()');
  
  if (setClauses.length <= 1) return getUserById(id);
  
  await req.query(`UPDATE dbo.Users SET ${setClauses.join(', ')} WHERE id=@id`);
  return getUserById(id);
}

async function deleteUser(id) {
  const pool = await getSqlPool();
  await pool.request().input('id', sql.VarChar(24), String(id)).query('DELETE FROM dbo.Users WHERE id=@id');
}

async function updateLastLogin(id, when = new Date()) {
  const pool = await getSqlPool();
  await pool
    .request()
    .input('id', sql.VarChar(24), String(id))
    .input('lastLogin', sql.DateTime2, when)
    .query('UPDATE dbo.Users SET lastLogin=@lastLogin, updatedAt=SYSUTCDATETIME() WHERE id=@id');
}

async function createUser({
  id, fullName, email, password, phone, role,
  isActive = true, isVerified = false,
  preferences, driverInfo, ownerInfo, collaboratorRequest, contract, avatar,
}) {
  const pool = await getSqlPool();
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  await pool
    .request()
    .input('id', sql.VarChar(24), id)
    .input('fullName', sql.NVarChar(100), fullName)
    .input('email', sql.VarChar(255), String(email).toLowerCase())
    .input('passwordHash', sql.VarChar(255), passwordHash)
    .input('phone', sql.VarChar(30), phone)
    .input('role', sql.VarChar(20), role)
    .input('isVerified', sql.Bit, isVerified ? 1 : 0)
    .input('isOnline', sql.Bit, 0)
    .input('isActive', sql.Bit, isActive ? 1 : 0)
    .input('ratingAverage', sql.Decimal(3, 1), 0)
    .input('ratingCount', sql.Int, 0)
    .input('totalEarnings', sql.Decimal(18, 2), 0)
    .input('preferencesJson', sql.NVarChar(sql.MAX), preferences ? JSON.stringify(preferences) : null)
    .input('driverInfoJson', sql.NVarChar(sql.MAX), driverInfo ? JSON.stringify(driverInfo) : null)
    .input('ownerInfoJson', sql.NVarChar(sql.MAX), ownerInfo ? JSON.stringify(ownerInfo) : null)
    .input('collaboratorRequestJson', sql.NVarChar(sql.MAX), collaboratorRequest ? JSON.stringify(collaboratorRequest) : null)
    .input('contractJson', sql.NVarChar(sql.MAX), contract ? JSON.stringify(contract) : null)
    .input('avatarJson', sql.NVarChar(sql.MAX), avatar ? JSON.stringify(avatar) : null)
    .input('createdAt', sql.DateTime2, now)
    .input('updatedAt', sql.DateTime2, now)
    .input('lastLogin', sql.DateTime2, now)
    .query(`
      INSERT INTO dbo.Users (
        id, fullName, email, passwordHash, phone, role,
        isVerified, isOnline, isActive,
        ratingAverage, ratingCount, totalEarnings,
        preferencesJson, driverInfoJson, ownerInfoJson, collaboratorRequestJson, contractJson, avatarJson,
        createdAt, updatedAt, lastLogin
      ) VALUES (
        @id, @fullName, @email, @passwordHash, @phone, @role,
        @isVerified, @isOnline, @isActive,
        @ratingAverage, @ratingCount, @totalEarnings,
        @preferencesJson, @driverInfoJson, @ownerInfoJson, @collaboratorRequestJson, @contractJson, @avatarJson,
        @createdAt, @updatedAt, @lastLogin
      )
    `);

  return await getUserById(id);
}

module.exports = {
  getUserByEmail,
  getUserById,
  getById: getUserById,
  getAll,
  countDocuments,
  updateUser,
  deleteUser,
  updateLastLogin,
  createUser,
};
