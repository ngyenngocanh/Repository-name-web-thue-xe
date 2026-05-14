const { getSqlPool, sql } = require('../db/sqlServer');

function parseJson(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function toNotifRow(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    recipient: row.recipientId,
    recipientType: row.recipientType,
    title: row.title,
    message: row.message,
    type: row.notificationType,
    read: !!row.isRead,
    metadata: parseJson(row.metadataJson),
    createdAt: row.createdAt,
  };
}

async function getByRecipient(userId, { limit = 20 } = {}) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('recipientId', sql.VarChar(24), String(userId))
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP (@limit) * FROM dbo.Notifications 
      WHERE recipientId = @recipientId 
      ORDER BY createdAt DESC
    `);
  
  const notifications = result.recordset.map(toNotifRow);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return { notifications, unreadCount };
}

async function getUnreadCount(userId) {
  const pool = await getSqlPool();
  const result = await pool.request()
    .input('recipientId', sql.VarChar(24), String(userId))
    .query('SELECT COUNT(*) as cnt FROM dbo.Notifications WHERE recipientId = @recipientId AND isRead = 0');
  return result.recordset[0].cnt;
}

async function create({ recipient, recipientType = 'user', title, message, type = 'system', metadata } = {}) {
  const pool = await getSqlPool();
  const id = require('crypto').randomBytes(12).toString('hex');
  
  await pool.request()
    .input('id', sql.VarChar(24), id)
    .input('recipientId', sql.VarChar(24), String(recipient))
    .input('recipientType', sql.VarChar(20), recipientType)
    .input('title', sql.NVarChar(255), title || '')
    .input('message', sql.NVarChar(sql.MAX), message || '')
    .input('notificationType', sql.VarChar(20), type)
    .input('isRead', sql.Bit, 0)
    .input('metadataJson', sql.NVarChar(sql.MAX), metadata ? JSON.stringify(metadata) : null)
    .input('createdAt', sql.DateTime2, new Date())
    .query(`
      INSERT INTO dbo.Notifications (id, recipientId, recipientType, title, message, notificationType, isRead, metadataJson, createdAt)
      VALUES (@id, @recipientId, @recipientType, @title, @message, @notificationType, @isRead, @metadataJson, @createdAt)
    `);
  
  return { _id: id, id, recipient, recipientType, title, message, type, read: false, metadata, createdAt: new Date() };
}

async function markAsRead(id) {
  const pool = await getSqlPool();
  await pool.request()
    .input('id', sql.VarChar(24), String(id))
    .query('UPDATE dbo.Notifications SET isRead = 1 WHERE id = @id');
}

async function markAllRead(userId) {
  const pool = await getSqlPool();
  await pool.request()
    .input('recipientId', sql.VarChar(24), String(userId))
    .query('UPDATE dbo.Notifications SET isRead = 1 WHERE recipientId = @recipientId AND isRead = 0');
}

async function getSummary() {
  const pool = await getSqlPool();
  const result = await pool.request().query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN isRead = 0 THEN 1 ELSE 0 END) as unread
    FROM dbo.Notifications
  `);
  return result.recordset[0];
}

module.exports = {
  getByRecipient, getUnreadCount, create,
  markAsRead, markAllRead, getSummary,
};
