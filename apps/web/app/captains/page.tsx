'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiBaseUrl } from '../../lib/api';

export default function CaptainsPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [studentNumber, setStudentNumber] = useState('');
  const [universityCode, setUniversityCode] = useState('');
  const [verification, setVerification] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingStudent, setVerifyingStudent] = useState(false);

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('kusf_token') : null;
  const authHeaders = useMemo(
    () => ({ Authorization: token ? `Bearer ${token}` : '' }),
    [token],
  );

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const verifyStudent = async () => {
    if (!studentNumber || !universityCode) {
      setMessage('Enter a student number and university code to verify the person before creating a captain account.');
      return;
    }

    setVerifyingStudent(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiBase}/university-verification/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ studentNumber, universityCode }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || 'Unable to verify student');
      }
      setVerification(body.data);
      setMessage(body.data?.verified ? 'Student verified successfully.' : 'Student record could not be confirmed.');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to verify student.');
    } finally {
      setVerifyingStudent(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!token) {
      setMessage('You must be logged in to create captain accounts.');
      setSubmitting(false);
      return;
    }

    if (!verification?.verified) {
      setMessage('Confirm the student verification result before creating the captain account.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/register-captain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) {
        setMessage(body.message || 'Unable to create captain account.');
        return;
      }

      setMessage('Captain account created successfully. They can now login with the credentials you provided.');
      setForm({ name: '', email: '', password: '' });
    } catch (error: any) {
      setMessage(error?.message || 'Unable to create captain account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create Captain Account</h1>
              <p className="mt-2 text-slate-300">Create a new team captain account for your university.</p>
            </div>
            <Link href="/dashboard" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Full name
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Student number / registration number
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(event) => setStudentNumber(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  placeholder="UON/CS/2024/001"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                University code
                <input
                  type="text"
                  value={universityCode}
                  onChange={(event) => setUniversityCode(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  placeholder="UON"
                  required
                />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={verifyStudent} disabled={verifyingStudent} className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">
                  {verifyingStudent ? 'Checking…' : 'Verify student'}
                </button>
              </div>
            </div>

            {verification ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">
                <div><strong>Status:</strong> {verification.verified ? 'Verified' : 'Not verified'}</div>
                {verification.student ? (
                  <div className="mt-2 space-y-1">
                    <div><strong>Name:</strong> {verification.student.name}</div>
                    <div><strong>Student number:</strong> {verification.student.studentNumber}</div>
                    <div><strong>DOB:</strong> {verification.student.dateOfBirth}</div>
                    <div><strong>Enrollment:</strong> {verification.student.enrollmentStatus}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className="block text-sm text-slate-300">
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm text-slate-300">
                Temporary password
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                />
              </label>
            </div>

            {message ? <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">{message}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Captain'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
