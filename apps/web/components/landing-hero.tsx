import Link from 'next/link';

export function LandingHero() {
  return (
    <section className="rounded-3xl border border-sky-500/30 bg-slate-900/80 p-10 shadow-2xl shadow-sky-900/20 backdrop-blur">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">KUSF Athlete Eligibility & Management System</p>
      <h1 className="text-5xl font-bold leading-tight">Professional athlete verification, eligibility, and squad operations in one platform.</h1>
      <p className="mt-5 max-w-3xl text-lg text-slate-300">
        Centralized verification, compliance dashboards, digital athlete identities, and secure administration for KUSF competitions.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Open Login
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-emerald-400 px-5 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
        >
          Create Account
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-800"
        >
          View Dashboard
        </Link>
      </div>
    </section>
  );
}
