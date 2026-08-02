"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getApiUrl } from '../../lib/api';
import { setStoredAuth } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const emailValue = form.email.trim();
    const passwordValue = form.password.trim();

    if (!emailValue || !passwordValue) {
      setMessage('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const requestBody = { email: emailValue, password: passwordValue };
      const res = await fetch(getApiUrl('auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(body?.message || 'Invalid login credentials');
      } else {
        const token = body?.data?.token;
        const user = body?.data?.user;
        if (!token || !user) {
          setMessage('Login response was incomplete.');
        } else {
          setStoredAuth(token, user);
          setMessage('Signed in successfully.');
          router.replace('/dashboard');
        }
      }
    } catch (e: any) {
      setMessage(e?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-slate-300">Access the KUSF athlete management portal.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <button className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </div>
    </main>
  );
}
