'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Profile = { id: string; display_name?: string; nationality?: string; country_of_residence?: string; department?: string; current_position?: string; ship_segment?: string; career_summary?: string; open_to_work?: boolean; verification?: string; points_balance?: number | string; membership_plan?: string; error?: string };

export default function CrewIDPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');
  async function refresh() { const r = await fetch('/api/me'); const j = await r.json(); setProfile(r.ok ? j.member : { id: '', error: j.error }); }
  useEffect(() => { void fetch('/api/me').then(async r => { const j = await r.json(); setProfile(r.ok ? j.member : { id: '', error: j.error }); }); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('Saving CrewID…');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.openToWork = form.get('openToWork') === 'on' ? 'true' : 'false';
    const body = { ...payload, openToWork: payload.openToWork === 'true' };
    const r = await fetch('/api/me', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json(); setMessage(r.ok ? 'CrewID saved.' : j.error || 'Unable to save CrewID.'); if (r.ok) await refresh();
  }
  return <AppShell title="CrewID" kicker="PROFESSIONAL IDENTITY">
    <div className="demoBanner">Your CrewID is the professional profile you carry between ships, contracts and companies. Sensitive identity documents are never exposed here.</div>
    {!profile && <p>Loading CrewID…</p>}{profile?.error && <p>{profile.error} Sign in and connect Neon to activate your live CrewID.</p>}
    {profile && !profile.error && <><div className="statGrid"><article className="statCard"><span>Verification</span><strong>{profile.verification || 'unverified'}</strong><small>CrewID status</small></article><article className="statCard"><span>Membership</span><strong>{profile.membership_plan || 'free'}</strong><small>Current plan</small></article><article className="statCard"><span>SeaPoints</span><strong>{Number(profile.points_balance || 0).toLocaleString()} SP</strong><small>Member rewards</small></article></div>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">EDIT PROFILE</span><h2>Your professional details</h2></div></div><form className="supportForm" onSubmit={save} key={JSON.stringify(profile)}>
      <label>Display name<input name="displayName" defaultValue={profile.display_name || ''} maxLength={100} required /></label><label>Nationality<input name="nationality" defaultValue={profile.nationality || ''} maxLength={80} required /></label><label>Country of residence<input name="countryOfResidence" defaultValue={profile.country_of_residence || ''} maxLength={80} /></label><label>Department<input name="department" defaultValue={profile.department || ''} maxLength={80} required /></label><label>Current position<input name="currentPosition" defaultValue={profile.current_position || ''} maxLength={120} required /></label><label>Ship segment<input name="shipSegment" defaultValue={profile.ship_segment || ''} placeholder="Cruise, Cargo, Offshore…" maxLength={80} /></label><label>Career summary<textarea name="careerSummary" defaultValue={profile.career_summary || ''} rows={6} maxLength={1200} /></label><label><input type="checkbox" name="openToWork" defaultChecked={Boolean(profile.open_to_work)} /> Open to new opportunities</label><button className="primaryButton" type="submit">Save CrewID</button><p>{message}</p>
    </form></section></>}
  </AppShell>;
}
