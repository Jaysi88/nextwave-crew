'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createAuthClient } from '@neondatabase/auth/next';

const authClient = createAuthClient();

export default function SignInPage(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const result=await authClient.signIn.email({email,password});if(result.error){setMessage(result.error.message||'Unable to sign in.');}else{window.location.href='/dashboard';}}catch{setMessage('Neon Auth is not configured in this environment yet.');}finally{setBusy(false)}}
  return <main className="authPage"><form className="authCard" onSubmit={submit}><Link className="brand" href="/"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></Link><span className="microLabel">MEMBER ACCESS</span><h1>Welcome aboard.</h1><p>Sign in to your CrewID, community and CrewWealth workspace.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"/></label>{message&&<div className="authMessage">{message}</div>}<button className="primaryButton" disabled={busy}>{busy?'Signing in…':'Sign in'}</button><small>Authentication becomes live after Neon Auth environment variables are added.</small><Link href="/dashboard">Preview dashboard without signing in →</Link></form></main>
}
