'use client';

import { FormEvent, useState } from 'react';
import AppShell from '@/components/AppShell';

export default function OnboardingPage() {
  const [status, setStatus] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('Saving…');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch('/api/me', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    setStatus(response.ok ? 'Profile saved. Complete core fields to earn 100 SeaPoints.' : result.error || 'Could not save profile.');
  }
  return <AppShell title="Welcome aboard" kicker="MEMBER ONBOARDING">
    <section className="panel"><div className="panelHead"><div><span className="microLabel">CREW ID</span><h2>Build your maritime identity</h2></div></div>
      <form onSubmit={submit} className="supportForm">
        <label>Display name<input name="displayName" maxLength={100} required /></label>
        <label>Nationality<input name="nationality" maxLength={80} required /></label>
        <label>Country of residence<input name="countryOfResidence" maxLength={80} /></label>
        <label>Department<input name="department" placeholder="Casino, Deck, Engine, Hotel…" maxLength={80} required /></label>
        <label>Current position<input name="currentPosition" maxLength={120} required /></label>
        <label>Ship segment<input name="shipSegment" placeholder="Cruise, Cargo, Offshore…" maxLength={80} /></label>
        <label>Career summary<textarea name="careerSummary" maxLength={1200} rows={5} /></label>
        <button className="primaryButton" type="submit">Save CrewID</button><p>{status}</p>
      </form>
    </section>
  </AppShell>;
}
