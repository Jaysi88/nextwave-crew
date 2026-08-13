'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAuthClient } from '@neondatabase/auth/next';

const authClient = createAuthClient();

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'forgot') {
        const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/auth/reset-password` });
        setMessage(result.error?.message || 'If that account exists, a secure password link has been sent.');
        return;
      }
      const result = mode === 'sign-up' ? await authClient.signUp.email({ email, password, name }) : await authClient.signIn.email({ email, password });
      if (result.error) {
        setMessage(result.error.message || `Unable to ${mode === 'sign-up' ? 'create your account' : 'sign in'}.`);
      } else if (mode === 'sign-up') {
        setMessage('Account created. Check your email for the verification code, then sign in.');
        setMode('sign-in');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setMessage('Secure member access is temporarily unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authExperience">
        <div className="authVisual">
          <div className="authVisualContent">
            <Link className="brand" href="/"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></Link>
            <span className="microLabel">GLOBAL SEAFARER NETWORK</span>
            <h2>Your career at sea. <span>Your future ashore.</span></h2>
            <p>One private member deck for CrewID, professional community, career opportunities, savings goals and SeaPoints.</p>
            <div className="oceanOrb" aria-hidden="true"><span className="orbRing" /><span className="orbDot" /></div>
            <div className="authSignal"><span /> Secure member signal · encrypted session</div>
          </div>
        </div>

        <form className="authCard" onSubmit={submit}>
          <Link className="brand" href="/"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></Link>
          <span className="microLabel">{mode === 'sign-up' ? 'JOIN THE CREW' : mode === 'forgot' ? 'ACCOUNT RECOVERY' : 'MEMBER ACCESS'}</span>
          <h1>{mode === 'sign-up' ? 'Create your CrewID.' : mode === 'forgot' ? 'Reset your password.' : 'Welcome aboard.'}</h1>
          <p>{mode === 'sign-up' ? 'Start your secure NextWave Crew membership.' : mode === 'forgot' ? 'We will email you a secure reset link.' : 'Sign in to continue your voyage.'}</p>

          {mode === 'sign-up' && <label>Full name
            <input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your full name" />
          </label>}
          <label>Email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
          </label>
          {mode !== 'forgot' && <label>Password
            <input type="password" minLength={8} autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="••••••••" />
          </label>}

          {message && <div className="authMessage" role="status">{message}</div>}
          <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-up' ? 'Create member account' : mode === 'forgot' ? 'Send reset link' : 'Enter member deck'}</button>

          <div className="authMeta"><span>{mode === 'sign-up' ? 'Already a member?' : mode === 'forgot' ? 'Remembered it?' : 'New to NextWave Crew?'}</span><button className="textButton" type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }}>{mode === 'sign-in' ? 'Create account' : 'Sign in'}</button></div>
          {mode === 'sign-in' && <button className="textButton" type="button" onClick={() => { setMode('forgot'); setMessage(''); }}>Forgot password?</button>}
          <div className="authSecurity"><div>Private CrewID</div><div>Secure wallet</div><div>Member-only spaces</div></div>
          <Link href="/membership" className="textButton">Explore membership →</Link>
        </form>
      </section>
    </main>
  );
}
