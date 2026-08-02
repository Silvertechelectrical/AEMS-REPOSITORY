'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiBaseUrl } from '../../lib/api';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  universityId: string | null;
  createdAt: string;
}

const officerRoles = [
  { value: 'UNIVERSITY_ADMIN', label: 'University Admin' },
  { value: 'SPORTS_OFFICER', label: 'Sports Officer' },
  { value: 'COACH', label: 'Coach' },
];

export default function StaffPage() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([]);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'UNIVERSITY_ADMIN', universityId: '' });
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [approveMessage, setApproveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('kusf_token') : null;
  const authHeaders = useMemo(
    () => ({ Authorization: token ? `Bearer ${token}` : '' }),
    [token],
  );

  const loadPendingApprovals = async () => {
    setLoading(true);
    setApproveMessage(null);
    if (!token) {
      setApproveMessage('Login required to view pending approvals.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/pending-approvals`, {
        headers: { ...authHeaders },
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || 'Unable to load pending approvals');
      }
      setPendingApprovals(body.data || []);
    } catch (error: any) {
      setApproveMessage(error.message || 'Unable to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingApprovals();
  }, [apiBase, authHeaders]);

  const handleInviteChange = (field: keyof typeof inviteForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInviteForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingInvite(true);
    setInviteMessage(null);

    if (!token) {
      setInviteMessage('Login required to invite new staff.');
      setSubmittingInvite(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/invite-officer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(inviteForm),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || 'Unable to send invitation');
      }
      setInviteMessage('Invitation created. The invited user will appear in pending approvals.');
      setInviteForm({ name: '', email: '', role: 'UNIVERSITY_ADMIN', universityId: '' });
      await loadPendingApprovals();
    } catch (error: any) {
      setInviteMessage(error.message || 'Unable to send invitation');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const approveUser = async (id: string) => {
    setApprovingId(id);
    setApproveMessage(null);
    if (!token) {
      setApproveMessage('Login required to approve accounts.');
      setApprovingId(null);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/auth/users/${id}/approve`, {
        method: 'POST',
        headers: { ...authHeaders },
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || 'Unable to approve user');
      }
      setApproveMessage('User approved successfully.');
      await loadPendingApprovals();
    } catch (error: any) {
      setApproveMessage(error.message || 'Unable to approve user');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Staff Invitations & Approvals</h1>
              <p className="mt-2 text-slate-300">Invite university staff and approve pending AEMS accounts.</p>
            </div>
            <Link href="/dashboard" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Back to Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Invite Staff</h2>
            <form className="mt-6 space-y-4" onSubmit={handleInvite}>
              <label className="block text-sm text-slate-300">
                Full name
                <input
                  value={inviteForm.name}
                  onChange={handleInviteChange('name')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Email address
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={handleInviteChange('email')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Role
                <select
                  value={inviteForm.role}
                  onChange={handleInviteChange('role')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                >
                  {officerRoles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-slate-300">
                University ID (optional for global admins)
                <input
                  value={inviteForm.universityId}
                  onChange={handleInviteChange('universityId')}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                />
              </label>

              {inviteMessage ? <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-300">{inviteMessage}</div> : null}

              <button
                type="submit"
                disabled={submittingInvite}
                className="inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
              >
                {submittingInvite ? 'Sending invite…' : 'Send Invitation'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Pending Approvals</h2>
                <p className="mt-1 text-sm text-slate-400">Approve newly invited staff accounts.</p>
              </div>
              <button
                type="button"
                onClick={loadPendingApprovals}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            {approveMessage ? <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-300">{approveMessage}</div> : null}

            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-300">Loading pending approvals…</div>
            ) : pendingApprovals.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-300">No pending approvals at this time.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-slate-400">Name</th>
                      <th className="px-4 py-3 text-slate-400">Email</th>
                      <th className="px-4 py-3 text-slate-400">Role</th>
                      <th className="px-4 py-3 text-slate-400">University</th>
                      <th className="px-4 py-3 text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pendingApprovals.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-slate-100">{user.name}</td>
                        <td className="px-4 py-3 text-slate-300">{user.email}</td>
                        <td className="px-4 py-3 text-slate-300">{user.role}</td>
                        <td className="px-4 py-3 text-slate-300">{user.universityId ?? 'Global'}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={approvingId === user.id}
                            onClick={() => approveUser(user.id)}
                            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {approvingId === user.id ? 'Approving…' : 'Approve'}
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
