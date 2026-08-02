'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getApiBaseUrl } from '../../lib/api';

interface University {
  id: string;
  name: string;
  code: string;
  location: string;
}

const getAuthToken = () => typeof window !== 'undefined' ? window.localStorage.getItem('kusf_token') : null;

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', name: '', code: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'create' | 'update'>('create');

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const token = getAuthToken();
  const authHeaders = useMemo(
    () => ({ Authorization: token ? `Bearer ${token}` : '' }),
    [token],
  );

  const loadUniversities = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('You must be logged in to manage universities.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/universities`, { headers: { ...authHeaders } });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Unable to load universities');
      }

      setUniversities(body.data || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniversities();
  }, [apiBase, authHeaders]);

  const handleChange = (field: keyof University) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleEdit = (university: University) => {
    setMode('update');
    setForm(university);
  };

  const resetForm = () => {
    setMode('create');
    setForm({ id: '', name: '', code: '', location: '' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!token) {
      setError('Authentication required');
      setSubmitting(false);
      return;
    }

    const payload = { name: form.name, code: form.code, location: form.location };

    try {
      const url = mode === 'create' ? `${apiBase}/universities` : `${apiBase}/universities/${form.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Unable to save university');
      }

      await loadUniversities();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Unable to save university');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this university?')) {
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/universities/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Unable to delete university');
      }

      await loadUniversities();
      if (form.id === id) resetForm();
    } catch (err: any) {
      setError(err.message || 'Unable to delete university');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">University Management</h1>
              <p className="mt-2 text-slate-300">Create, update, and remove universities from the AEMS registry.</p>
            </div>
            <Link href="/dashboard" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{mode === 'create' ? 'Add University' : 'Update University'}</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-300">
                Name
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Code
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  value={form.code}
                  onChange={handleChange('code')}
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Location
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  value={form.location}
                  onChange={handleChange('location')}
                  required
                />
              </label>

              {error ? <div className="rounded-2xl border border-rose-500 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {mode === 'create' ? 'Create University' : 'Save Changes'}
                </button>
                {mode === 'update' ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">University list</h2>
                <p className="mt-1 text-sm text-slate-400">Only authorized admins can modify this registry.</p>
              </div>
              <span className="rounded-2xl bg-slate-950/40 px-4 py-2 text-sm text-slate-300">{universities.length} entries</span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-300">Loading universities…</div>
            ) : universities.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-300">No universities found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-slate-400">Name</th>
                      <th className="px-4 py-3 text-slate-400">Code</th>
                      <th className="px-4 py-3 text-slate-400">Location</th>
                      <th className="px-4 py-3 text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {universities.map((university) => (
                      <tr key={university.id}>
                        <td className="px-4 py-4 text-slate-100">{university.name}</td>
                        <td className="px-4 py-4 text-slate-300">{university.code}</td>
                        <td className="px-4 py-4 text-slate-300">{university.location}</td>
                        <td className="px-4 py-4 text-slate-300">
                          <button
                            className="mr-2 rounded-2xl border border-sky-500 px-3 py-2 text-sm text-sky-200 transition hover:bg-sky-500/10"
                            onClick={() => handleEdit(university)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-2xl border border-rose-500 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10"
                            onClick={() => handleDelete(university.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
