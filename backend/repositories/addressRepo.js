const { getSqlPool, sql } = require('../db/sqlServer');

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toAddressRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    street: row.street,
    ward: parseJson(row.wardJson),
    province: parseJson(row.provinceJson),
    fullAddress: row.fullAddress,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    owner: row.ownerId,
    ownerId: row.ownerId,
    isDefault: !!row.isDefault,
    addressType: row.addressType,
    isActive: !!row.isActive,
    metadata: parseJson(row.metadataJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getAddressById(id) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('id', sql.VarChar(24), String(id))
    .query('SELECT TOP 1 * FROM dbo.Addresses WHERE id=@id');
  return toAddressRow(result.recordset?.[0]);
}

async function getByOwner(ownerId) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('ownerId', sql.VarChar(24), String(ownerId))
    .query('SELECT * FROM dbo.Addresses WHERE ownerId=@ownerId ORDER BY isDefault DESC, createdAt DESC');
  return result.recordset.map(toAddressRow);
}

async function createAddress(data) {
  const pool = await getSqlPool();
  const id = data.id || Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  
  await pool.request()
    .input('id', sql.VarChar(24), id)
    .input('street', sql.NVarChar(255), data.street)
    .input('wardJson', sql.NVarChar(sql.MAX), data.ward ? JSON.stringify(data.ward) : null)
    .input('provinceJson', sql.NVarChar(sql.MAX), data.province ? JSON.stringify(data.province) : null)
    .input('fullAddress', sql.NVarChar(500), data.fullAddress)
    .input('referenceType', sql.VarChar(20), data.referenceType || 'User')
    .input('referenceId', sql.VarChar(24), data.referenceId || data.owner || data.ownerId)
    .input('ownerId', sql.VarChar(24), data.owner || data.ownerId)
    .input('isDefault', sql.Bit, data.isDefault ? 1 : 0)
    .input('addressType', sql.VarChar(20), data.addressType)
    .input('isActive', sql.Bit, data.isActive !== false ? 1 : 0)
    .input('metadataJson', sql.NVarChar(sql.MAX), data.metadata ? JSON.stringify(data.metadata) : null)
    .query(`
      INSERT INTO dbo.Addresses (id, street, wardJson, provinceJson, fullAddress, referenceType, referenceId, ownerId, isDefault, addressType, isActive, metadataJson, createdAt, updatedAt)
      VALUES (@id, @street, @wardJson, @provinceJson, @fullAddress, @referenceType, @referenceId, @ownerId, @isDefault, @addressType, @isActive, @metadataJson, SYSUTCDATETIME(), SYSUTCDATETIME())
    `);
    
  return getAddressById(id);
}

async function updateAddress(id, updates) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('id', sql.VarChar(24), String(id));
  
  const setClauses = [];
  if (updates.street !== undefined) { req.input('street', sql.NVarChar(255), updates.street); setClauses.push('street=@street'); }
  if (updates.ward !== undefined) { req.input('wardJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.ward)); setClauses.push('wardJson=@wardJson'); }
  if (updates.province !== undefined) { req.input('provinceJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.province)); setClauses.push('provinceJson=@provinceJson'); }
  if (updates.fullAddress !== undefined) { req.input('fullAddress', sql.NVarChar(500), updates.fullAddress); setClauses.push('fullAddress=@fullAddress'); }
  if (updates.isDefault !== undefined) { req.input('isDefault', sql.Bit, updates.isDefault ? 1 : 0); setClauses.push('isDefault=@isDefault'); }
  if (updates.addressType !== undefined) { req.input('addressType', sql.VarChar(20), updates.addressType); setClauses.push('addressType=@addressType'); }
  if (updates.isActive !== undefined) { req.input('isActive', sql.Bit, updates.isActive ? 1 : 0); setClauses.push('isActive=@isActive'); }
  
  if (setClauses.length === 0) return getAddressById(id);
  
  setClauses.push('updatedAt=SYSUTCDATETIME()');
  await req.query(`UPDATE dbo.Addresses SET ${setClauses.join(', ')} WHERE id=@id`);
  return getAddressById(id);
}

async function unsetOtherDefaults(ownerId, excludeId) {
  const pool = await getSqlPool();
  await pool.request()
    .input('ownerId', sql.VarChar(24), String(ownerId))
    .input('excludeId', sql.VarChar(24), String(excludeId))
    .query('UPDATE dbo.Addresses SET isDefault=0 WHERE ownerId=@ownerId AND id<>@excludeId');
}

async function deleteAddress(id) {
  const pool = await getSqlPool();
  await pool.request().input('id', sql.VarChar(24), String(id)).query('DELETE FROM dbo.Addresses WHERE id=@id');
}

module.exports = {
  getAddressById,
  getByOwner,
  createAddress,
  updateAddress,
  deleteAddress,
  unsetOtherDefaults
};
