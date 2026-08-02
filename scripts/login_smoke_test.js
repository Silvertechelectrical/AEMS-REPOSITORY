const baseUrl = 'http://127.0.0.1:4000/api/v1';

async function run() {
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kusf.org', password: 'Admin@123' }),
    });
    const loginText = await loginRes.text();
    console.log('login status', loginRes.status);
    console.log('login headers', Object.fromEntries(loginRes.headers.entries()));
    console.log('login body', loginText);
    try {
      const loginJson = JSON.parse(loginText);
      console.log('login json', loginJson);
      const token = loginJson?.data?.token || loginJson?.token;
      console.log('token', token);
    } catch (e) {
      console.error('json parse error', e.message);
    }
  } catch (e) {
    console.error('login fetch error', e.message || e);
  }
}

run();
