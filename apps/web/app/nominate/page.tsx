'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiBaseUrl } from '../../lib/api';

interface Team {
  id: string;
  name: string;
  universityId: string;
  sportId: string;
  coachId: string;
}

interface Sport {
  id: string;
  name: string;
}

export default function NominatePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [form, setForm] = useState({ studentNumber: '', teamId: '', sportId: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('kusf_token') : null;
  const authHeaders = useMemo(
    () => ({ Authorization: token ? `Bearer ${token}` : '' }),
    [token],
  );

  const loadLookups = async () => {
    setLoading(true);
    setMessage(null);

    if (!token) {
      setMessage('Login required to nominate an athlete.');
      setLoading(false);
      return;
    }

    try {
      const [teamsRes, sportsRes] = await Promise.all([
        fetch(`${apiBase}/teams`, { headers: authHeaders }),
        fetch(`${apiBase}/sports`, { headers: authHeaders }),
      ]);

      const [teamsBody, sportsBody] = await Promise.all([teamsRes.json(), sportsRes.json()]);
      if (!teamsRes.ok || !sportsRes.ok) {
        throw new Error(teamsBody.message || sportsBody.message || 'Unable to load lookups');
      }

      setTeams(teamsBody.data || []);
      setSports(sportsBody.data || []);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load team and sport options.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, [apiBase, authHeaders]);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!token) {
      setMessage('Login required to nominate an athlete.');
      setSubmitting(false);
      return;
    }

    if (!form.studentNumber || !form.teamId || !form.sportId) {
      setMessage('Student registration number, sport, and team are required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/athletes/nominate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) {
        setMessage(body.message || 'Unable to nominate athlete.');
        return;
      }

      if (body.data?.nominated) {
        setMessage('Athlete nominated successfully.');
        setForm({ studentNumber: '', teamId: '', sportId: '' });
      } else {
        setMessage(body.data?.reason?.join(', ') || 'Nomination failed.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Unable to nominate athlete.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Nominate an Athlete</h1>
              <p className="mt-2 text-slate-300">Use your university team context to nominate an athlete for verification.</p>
            </div>
            <Link href="/dashboard" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          {message ? <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">{message}</div> : null}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-300">Loading nomination options…</div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-300">
                Student registration number
                <input
                  type="text"
                  value={form.studentNumber}
                  onChange={handleChange('studentNumber')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  placeholder="UON/CS/2024/001"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Sport
                <select
                  value={form.sportId}
                  onChange={handleChange('sportId')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                >
                  <option value="">Select a sport</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>{sport.name}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-slate-300">
                Team
                <select
                  value={form.teamId}
                  onChange={handleChange('teamId')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
              >
                {submitting ? 'Nominating…' : 'Nominate Athlete'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
