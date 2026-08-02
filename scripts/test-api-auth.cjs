const http = require('http');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      { hostname: u.hostname, port: u.port, path: u.pathname + u.search, method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      },
    );
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    const login = await postJson('http://localhost:4000/api/v1/auth/login', { email: 'admin@kusf.org', password: 'Admin@123' });
    console.log('login', login.status, login.body);
    const parsed = JSON.parse(login.body || '{}');
    if (login.status !== 200) process.exit(1);
    const token = parsed.data?.token;
    if (!token) process.exit(1);

    const u = new URL('http://localhost:4000/api/v1/test/protected');
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'GET', headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('protected', res.statusCode, body);
        process.exit(0);
      });
    });
    req.on('error', (e) => { console.error(e); process.exit(1); });
    req.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
