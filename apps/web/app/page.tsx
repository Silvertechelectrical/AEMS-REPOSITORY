import { LandingHero } from '../components/landing-hero';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20">
        <LandingHero />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['University Management', 'Centralized registration, suspension, activation, and role assignment workflows.'],
            ['Eligibility Rules Engine', 'Configurable rule checks for age, academic status, registrations, and discipline.'],
            ['Digital QR Passport', 'Encrypted athlete verification with expirations and instant match-day approvals.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
