require('dotenv').config();
const { getSqlPool } = require('./db/sqlServer');
async function test() {
  const pool = await getSqlPool();
  const res = await pool.request().query("SELECT TOP 1 id, email, avatarJson FROM dbo.Users WHERE email LIKE '%admin%'");
  const user = res.recordset[0];
  console.log({
    id: user.id,
    email: user.email,
    hasAvatarJson: !!user.avatarJson,
    avatarJsonLength: user.avatarJson ? user.avatarJson.length : 0,
    avatarJsonPreview: user.avatarJson ? user.avatarJson.substring(0, 100) : null
  });
  process.exit(0);
}
test().catch(console.error);
