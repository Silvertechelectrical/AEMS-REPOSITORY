"use client";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Student access</h1>
        <p className="mt-2 text-slate-300">This portal is for students and athletes who have been enrolled by their university sports office or KUSF administrators.</p>
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Public athlete self-registration is disabled.
          <br />
          Please contact your university sports officer or KUSF admin to request account creation and verification.
        </div>
        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-6 text-slate-300">
          <p className="font-semibold text-slate-100">Need access?</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>Captain and officer accounts are created by authorised staff.</li>
            <li>Athlete accounts are created after university verification.</li>
            <li>If you are already enrolled, please use the login page.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
