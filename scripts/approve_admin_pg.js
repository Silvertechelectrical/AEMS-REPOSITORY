const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

 (async () => {
  // parse DATABASE_URL to avoid query-string ssl mode collisions
  const dbUrl = process.env.DATABASE_URL;
  const u = new URL(dbUrl);
  const config = {
    host: u.hostname,
    port: Number(u.port),
    user: u.username,
    password: u.password,
    database: u.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
  };
  const client = new Client(config);
  try {
    await client.connect();
    const res = await client.query("UPDATE \"User\" SET approved = true WHERE email='admin@kusf.org'");
    console.log('updated rows:', res.rowCount);
  } catch (e) {
    console.error('pg error', e.message || e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
