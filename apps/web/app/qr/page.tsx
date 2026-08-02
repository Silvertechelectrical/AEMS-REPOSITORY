'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { getApiBaseUrl } from '../../lib/api';

const QR_SCAN_HELP = 'Open the device camera or paste the QR token if camera access is unavailable.';

type BarcodeDetectorLike = {
  detect(image: HTMLVideoElement | HTMLCanvasElement): Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

export default function QrPage() {
  const [athleteId, setAthleteId] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'staff' | 'athlete'>('staff');
  const [cameraState, setCameraState] = useState<'idle' | 'scanning' | 'error'>('idle');
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const authToken = typeof window !== 'undefined' ? window.localStorage.getItem('kusf_token') : null;
  const authHeaders = useMemo(() => ({ Authorization: authToken ? `Bearer ${authToken}` : '' }), [authToken]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopCamera = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const verifyToken = async (value: string) => {
    setSubmitting(true);
    setMessage(null);
    setVerificationResult(null);

    if (!value) {
      setMessage('QR token is required for verification.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/qr/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ token: value }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || 'Unable to verify QR token');
      }

      setToken(value);
      setVerificationResult(body.data);
      setMessage(body.data?.valid ? 'QR verification passed.' : `QR verification failed: ${body.data.reason}`);
    } catch (error: any) {
      setMessage(error.message || 'Unable to verify QR token.');
    } finally {
      setSubmitting(false);
    }
  };

  const startCamera = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setCameraMessage('This browser does not support camera access.');
      return;
    }

    const BarcodeDetectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      setCameraState('error');
      setCameraMessage('Camera scanning is not supported in this browser. You can still paste the QR token manually.');
      return;
    }

    try {
      stopCamera();
      setCameraState('scanning');
      setCameraMessage('Opening camera…');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current) {
          return;
        }

        try {
          const results = await detector.detect(videoRef.current);
          const value = results[0]?.rawValue?.trim();
          if (value) {
            stopCamera();
            setCameraState('idle');
            setCameraMessage('QR detected. Verifying…');
            await verifyToken(value);
          }
        } catch {
          // Ignore transient detection failures and keep scanning.
        }
      }, 800);
    } catch {
      setCameraState('error');
      setCameraMessage('Unable to access the camera. You can paste the token manually.');
    }
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setVerificationResult(null);

    if (!athleteId) {
      setMessage('Athlete ID is required to generate a QR token.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/qr/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ athleteId }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || 'Unable to generate QR token');
      }

      setToken(body.data.token);
      setMessage('QR token generated successfully. Use it for match-day verification.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to generate QR token.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await verifyToken(token);
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">QR Passport</h1>
              <p className="mt-2 text-slate-300">Generate and verify athlete QR tokens for match-day access.</p>
            </div>
            <Link href="/dashboard" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Back to Dashboard
            </Link>
          </div>
        </header>

        {message ? <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">{message}</div> : null}

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex gap-3">
            <button type="button" onClick={() => setMode('staff')} className={`rounded-2xl px-4 py-2 font-semibold ${mode === 'staff' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-200'}`}>
              Verify athlete
            </button>
            <button type="button" onClick={() => setMode('athlete')} className={`rounded-2xl px-4 py-2 font-semibold ${mode === 'athlete' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'}`}>
              Generate my QR token
            </button>
          </div>

          {mode === 'athlete' ? (
            <form className="space-y-5" onSubmit={handleGenerate}>
              <label className="block text-sm text-slate-300">
                Athlete ID
                <input
                  type="text"
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  placeholder="athlete-uuid"
                  required
                />
              </label>
              <p className="text-sm text-slate-400">Athletes and captains can use this flow to generate a one-time verification pass for authorised officers.</p>
              <button type="submit" disabled={submitting} className="inline-flex rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50">
                {submitting ? 'Generating…' : 'Generate QR Token'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-300">
                <div className="text-lg font-semibold text-white">Camera-ready verification</div>
                <p className="mt-2">{QR_SCAN_HELP}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-200">Live QR scan</div>
                  <button type="button" onClick={startCamera} className="rounded-2xl bg-sky-500 px-4 py-2 font-semibold text-slate-950">
                    Open camera
                  </button>
                </div>
                {cameraMessage ? <p className="mt-3 text-sm text-slate-400">{cameraMessage}</p> : null}
                <video ref={videoRef} className="mt-4 h-72 w-full rounded-2xl bg-black object-cover" playsInline muted />
              </div>
              <form className="space-y-5" onSubmit={handleVerify}>
                <label className="block text-sm text-slate-300">
                  QR Token
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    placeholder="Enter or paste QR token"
                    required
                  />
                </label>
                <p className="text-sm text-slate-400">Authorised officers can scan or enter the token to verify the athlete and view their university details.</p>
                <button type="submit" disabled={submitting} className="inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">
                  {submitting ? 'Verifying…' : 'Verify QR Token'}
                </button>
              </form>
            </div>
          )}

          {verificationResult ? (
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-slate-200">
              <div><strong>Valid:</strong> {verificationResult.valid ? 'Yes' : 'No'}</div>
              {verificationResult.athlete ? (
                <div className="mt-3 space-y-2">
                  <div><strong>Athlete:</strong> {verificationResult.athlete.fullName}</div>
                  <div><strong>University:</strong> {verificationResult.athlete.university}</div>
                  <div><strong>Sport:</strong> {verificationResult.athlete.sport}</div>
                  <div><strong>Eligibility:</strong> {verificationResult.athlete.eligibilityStatus}</div>
                  <div><strong>Verification:</strong> {verificationResult.athlete.verificationStatus}</div>
                  <div><strong>QR status:</strong> {verificationResult.eligible ? 'Approved for check-in' : 'Blocked'}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
