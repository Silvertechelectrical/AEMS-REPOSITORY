async function run() {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@kusf.org', password: 'Admin@123' }),
  });
  const loginBody = await loginRes.json();
  console.log('login status', loginRes.status, loginBody);
  if (!loginRes.ok) process.exit(1);
  const token = loginBody.data.token;

  const protectedRes = await fetch('http://localhost:4000/api/v1/test/protected', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const protectedBody = await protectedRes.json();
  console.log('protected status', protectedRes.status, protectedBody);
}

run().catch(e => { console.error(e); process.exit(1); });
