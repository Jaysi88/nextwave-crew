'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAuthClient } from '@neondatabase/auth/next';

const authClient = createAuthClient();

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setMessage(result.error.message || 'Unable to sign in.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setMessage('Neon Auth is not configured in this environment yet.');
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
          <span className="microLabel">MEMBER ACCESS</span>
          <h1>Welcome aboard.</h1>
          <p>Sign in to continue your voyage.</p>

          <label>Email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
          </label>
          <label>Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="••••••••" />
          </label>

          {message && <div className="authMessage" role="status">{message}</div>}
          <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Opening member deck…' : 'Enter member deck'}</button>

          <div className="authMeta"><span>New to NextWave Crew?</span><Link href="/membership">Explore membership</Link></div>
          <div className="authSecurity"><div>Private CrewID</div><div>Secure wallet</div><div>Member-only spaces</div></div>
          <Link href="/dashboard" className="textButton">Preview dashboard without signing in →</Link>
        </form>
      </section>
    </main>
  );
}
