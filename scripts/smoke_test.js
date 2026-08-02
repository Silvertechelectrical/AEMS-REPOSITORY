const baseUrl = 'http://127.0.0.1:4000/api/v1';

async function run() {
  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthBody = await healthRes.text();
    console.log('health status', healthRes.status);
    console.log('health body', healthBody);
  } catch (e) {
    console.error('health error', e.message || e);
  }

  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kusf.org', password: 'Admin@123' }),
    });
    const loginText = await loginRes.text();
    console.log('login status', loginRes.status);
    console.log('login body', loginText);
  } catch (e) {
    console.error('login error', e.message || e);
  }
}

run();
