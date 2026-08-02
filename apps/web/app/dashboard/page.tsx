'use client';

import { useEffect, useMemo, useState } from 'react';
import { clearStoredAuth, getStoredUser, isAthleteLikeRole, isOfficerRole, type AppUser } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState({ universities: 0, registeredAthletes: 0, pendingVerification: 0, compliance: 100 });

  useEffect(() => {
    setHydrated(true);

    const storedUser = getStoredUser();
    setUser(storedUser);

    const token = window.localStorage.getItem('kusf_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const apiBase = getApiBaseUrl();
    fetch(`${apiBase}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body?.stats) {
          setStats({
            universities: body.stats.universities ?? 0,
            registeredAthletes: body.stats.registeredAthletes ?? 0,
            pendingVerification: body.stats.pendingVerification ?? 0,
            compliance: body.stats.compliance ?? 100,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const isOfficer = isOfficerRole(user?.role);
  const isAthlete = isAthleteLikeRole(user?.role);
  const title = hydrated ? (isOfficer ? 'Operations Dashboard' : isAthlete ? 'Athlete Dashboard' : 'Dashboard') : 'Dashboard';
  const subtitle = hydrated ? (isOfficer ? 'Manage verification, captains, and compliance workflows.' : isAthlete ? 'View your eligibility and QR verification state.' : 'Access your account workspace.') : 'Loading your workspace…';

  const quickLinks = useMemo(() => {
    if (isOfficer) {
      return [
        { href: '/universities' as unknown as string, label: 'Manage Universities', tone: 'bg-emerald-500' },
        { href: '/captains' as unknown as string, label: 'Create Captains', tone: 'bg-sky-500' },
        { href: '/nominate' as unknown as string, label: 'Nominate Athlete', tone: 'bg-violet-500' },
        { href: '/qr' as unknown as string, label: 'QR Passport', tone: 'bg-fuchsia-500' },
        { href: '/staff' as unknown as string, label: 'Staff Invitations', tone: 'bg-violet-500' },
      ];
    }

    if (isAthlete) {
      return [
        { href: '/qr' as unknown as string, label: 'My QR Verification', tone: 'bg-sky-500' },
        { href: '/register' as unknown as string, label: 'Account Help', tone: 'bg-slate-700' },
      ];
    }

    return [{ href: '/login' as unknown as string, label: 'Sign In', tone: 'bg-slate-700' }];
  }, [isOfficer, isAthlete]);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-slate-300">{subtitle}</p>
              <p className="mt-2 text-sm text-slate-400">Signed in as {user?.name || user?.email || 'user'} • {user?.role || 'Unknown role'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <a key={link.href} href={link.href} className={`inline-flex rounded-2xl px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90 ${link.tone}`}>
                  {link.label}
                </a>
              ))}
              <button onClick={() => { clearStoredAuth(); window.location.href = '/login'; }} className="inline-flex rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-400">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Universities', String(stats.universities)],
            ['Registered Athletes', String(stats.registeredAthletes)],
            ['Pending Verification', String(stats.pendingVerification)],
            ['Compliance %', `${stats.compliance.toFixed(1)}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold">{value}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
