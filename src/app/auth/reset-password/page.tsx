'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createAuthClient } from '@neondatabase/auth/next';

const authClient = createAuthClient();

function ResetPasswordForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const token = params.get('token');
    if (!token) return setMessage('This reset link is missing its secure token. Request a new link.');
    setBusy(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setMessage(result.error?.message || 'Password updated. You can now sign in.');
    setBusy(false);
  }

  return <form className="authCard" onSubmit={submit}>
    <Link className="brand" href="/"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></Link>
    <span className="microLabel">SECURE ACCOUNT RECOVERY</span>
    <h1>Choose a new password.</h1>
    <label>New password<input type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="••••••••" /></label>
    {message && <div className="authMessage" role="status">{message}</div>}
    <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
    <Link className="textButton" href="/auth/sign-in">Return to sign in →</Link>
  </form>;
}

export default function ResetPasswordPage() {
  return <main className="authPage"><Suspense fallback={<div className="authCard">Loading secure reset…</div>}><ResetPasswordForm /></Suspense></main>;
}
