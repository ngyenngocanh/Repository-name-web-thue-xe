const { getSqlPool, sql } = require('../db/sqlServer');

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toReviewRow(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    booking: row.bookingId,
    reviewer: row.reviewerId,
    reviewee: row.revieweeId,
    car: row.carId,
    type: row.reviewType,
    rating: parseJson(row.ratingJson) || {},
    comment: row.comment,
    images: parseJson(row.imagesJson) || [],
    response: parseJson(row.responseJson),
    flags: parseJson(row.flagsJson),
    isPublic: !!row.isPublic,
    isVerified: !!row.isVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getById(id) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('id', sql.VarChar(24), String(id))
    .query('SELECT TOP 1 * FROM dbo.Reviews WHERE id=@id');
  return toReviewRow(result.recordset?.[0]);
}

async function getAll({ filter = {}, skip = 0, limit = 10, sort = 'createdAt DESC', populate = [] } = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  let where = '1=1';
  
  if (filter.carId) { req.input('carId', sql.VarChar(24), filter.carId); where += ' AND carId = @carId'; }
  if (filter.reviewerId) { req.input('reviewerId', sql.VarChar(24), filter.reviewerId); where += ' AND reviewerId = @reviewerId'; }
  if (filter.revieweeId) { req.input('revieweeId', sql.VarChar(24), filter.revieweeId); where += ' AND revieweeId = @revieweeId'; }
  if (filter.bookingId) { req.input('bookingId', sql.VarChar(24), filter.bookingId); where += ' AND bookingId = @bookingId'; }
  if (filter.type) { req.input('reviewType', sql.VarChar(30), filter.type); where += ' AND reviewType = @reviewType'; }
  if (filter.isPublic !== undefined) { req.input('isPublic', sql.Bit, filter.isPublic ? 1 : 0); where += ' AND isPublic = @isPublic'; }
  
  req.input('skip', sql.Int, skip);
  req.input('limit', sql.Int, limit);
  
  const result = await req.query(`SELECT * FROM dbo.Reviews WHERE ${where} ORDER BY ${sort} OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY`);
  let reviews = result.recordset.map(toReviewRow);
  
  if (populate.length > 0) reviews = await populateRefs(reviews, populate);
  return reviews;
}

async function populateRefs(reviews, fields = []) {
  if (!reviews || reviews.length === 0) return reviews;
  const pool = await getSqlPool();
  
  const userIds = new Set();
  for (const r of reviews) {
    if (fields.includes('reviewer') && r.reviewer) userIds.add(r.reviewer);
    if (fields.includes('reviewee') && r.reviewee) userIds.add(r.reviewee);
  }
  
  const userMap = {};
  if (userIds.size > 0) {
    const ids = [...userIds];
    const ph = ids.map((_, i) => `@u${i}`).join(',');
    const req = pool.request();
    ids.forEach((id, i) => req.input(`u${i}`, sql.VarChar(24), id));
    const result = await req.query(`SELECT id, fullName, email, avatarJson FROM dbo.Users WHERE id IN (${ph})`);
    for (const row of result.recordset) {
      userMap[row.id] = { _id: row.id, id: row.id, fullName: row.fullName, email: row.email, avatar: parseJson(row.avatarJson) };
    }
  }
  
  return reviews.map(r => ({
    ...r,
    reviewer: (fields.includes('reviewer') && userMap[r.reviewer]) || r.reviewer,
    reviewee: (fields.includes('reviewee') && userMap[r.reviewee]) || r.reviewee,
  }));
}

async function countDocuments(filter = {}) {
  const pool = await getSqlPool();
  const req = pool.request();
  let where = '1=1';
  if (filter.carId) { req.input('carId', sql.VarChar(24), filter.carId); where += ' AND carId = @carId'; }
  if (filter.revieweeId) { req.input('revieweeId', sql.VarChar(24), filter.revieweeId); where += ' AND revieweeId = @revieweeId'; }
  const result = await req.query(`SELECT COUNT(*) as cnt FROM dbo.Reviews WHERE ${where}`);
  return result.recordset[0].cnt;
}

async function createReview(data) {
  const pool = await getSqlPool();
  const id = data.id || Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  
  await pool.request()
    .input('id', sql.VarChar(24), id)
    .input('bookingId', sql.VarChar(24), data.booking)
    .input('reviewerId', sql.VarChar(24), data.reviewer)
    .input('revieweeId', sql.VarChar(24), data.reviewee)
    .input('carId', sql.VarChar(24), data.car)
    .input('reviewType', sql.VarChar(30), data.type)
    .input('ratingJson', sql.NVarChar(sql.MAX), JSON.stringify(data.rating))
    .input('comment', sql.NVarChar(sql.MAX), data.comment)
    .input('imagesJson', sql.NVarChar(sql.MAX), JSON.stringify(data.images || []))
    .input('isPublic', sql.Bit, 1)
    .query(`
      INSERT INTO dbo.Reviews (id, bookingId, reviewerId, revieweeId, carId, reviewType, ratingJson, comment, imagesJson, isPublic, createdAt, updatedAt)
      VALUES (@id, @bookingId, @reviewerId, @revieweeId, @carId, @reviewType, @ratingJson, @comment, @imagesJson, @isPublic, SYSUTCDATETIME(), SYSUTCDATETIME())
    `);
    
  return getById(id);
}

async function updateReview(id, updates) {
  const pool = await getSqlPool();
  const req = pool.request();
  req.input('id', sql.VarChar(24), String(id));
  
  const setClauses = [];
  if (updates.comment !== undefined) { req.input('comment', sql.NVarChar(sql.MAX), updates.comment); setClauses.push('comment=@comment'); }
  if (updates.rating !== undefined) { req.input('ratingJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.rating)); setClauses.push('ratingJson=@ratingJson'); }
  if (updates.isPublic !== undefined) { req.input('isPublic', sql.Bit, updates.isPublic ? 1 : 0); setClauses.push('isPublic=@isPublic'); }
  if (updates.response !== undefined) { req.input('responseJson', sql.NVarChar(sql.MAX), JSON.stringify(updates.response)); setClauses.push('responseJson=@responseJson'); }
  
  if (setClauses.length === 0) return getById(id);
  
  setClauses.push('updatedAt=SYSUTCDATETIME()');
  await req.query(`UPDATE dbo.Reviews SET ${setClauses.join(', ')} WHERE id=@id`);
  return getById(id);
}

async function deleteReview(id) {
  const pool = await getSqlPool();
  await pool.request().input('id', sql.VarChar(24), String(id)).query('DELETE FROM dbo.Reviews WHERE id=@id');
}

module.exports = {
  getById,
  getAll,
  countDocuments,
  createReview,
  updateReview,
  deleteReview,
  populateRefs
};
