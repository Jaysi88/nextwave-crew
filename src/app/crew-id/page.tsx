'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Profile = {
  id: string; display_name?: string; avatar_url?: string; cover_url?: string; nationality?: string; country_of_residence?: string;
  department?: string; current_position?: string; ship_segment?: string; career_summary?: string; open_to_work?: boolean;
  open_to_mentor?: boolean; looking_for_mentor?: boolean; verification?: string; points_balance?: number | string;
  membership_plan?: string; follower_count?: number | string; following_count?: number | string; error?: string;
};

export default function CrewIDPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');
  async function refresh() { const r = await fetch('/api/me'); const j = await r.json(); setProfile(r.ok ? j.member : { id: '', error: j.error }); }
  useEffect(() => { void refresh(); }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Saving CrewID…');
    const form = new FormData(event.currentTarget);
    const body = {
      displayName: String(form.get('displayName') || ''), nationality: String(form.get('nationality') || ''),
      countryOfResidence: String(form.get('countryOfResidence') || ''), department: String(form.get('department') || ''),
      currentPosition: String(form.get('currentPosition') || ''), shipSegment: String(form.get('shipSegment') || ''),
      careerSummary: String(form.get('careerSummary') || ''), avatarUrl: String(form.get('avatarUrl') || ''), coverUrl: String(form.get('coverUrl') || ''),
      openToWork: form.get('openToWork') === 'on', openToMentor: form.get('openToMentor') === 'on', lookingForMentor: form.get('lookingForMentor') === 'on'
    };
    const r = await fetch('/api/me', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    setMessage(r.ok ? 'CrewID saved.' : j.error || 'Unable to save CrewID.');
    if (r.ok) await refresh();
  }

  return <AppShell title="CrewID" kicker="PROFESSIONAL IDENTITY">
    <div className="demoBanner">Your CrewID is the professional profile you carry between ships, contracts and companies. Sensitive identity documents are never exposed here.</div>
    {!profile && <p>Loading CrewID…</p>}{profile?.error && <p>{profile.error} Sign in and connect Neon to activate your live CrewID.</p>}
    {profile && !profile.error && <>
      <section className="crewProfilePreview"><div className="profileCover" style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : undefined} /><div className="profileHeroBody"><div className="profileAvatarLarge" style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}>{!profile.avatar_url && (profile.display_name || 'NW').slice(0,2).toUpperCase()}</div><div className="profileIdentity"><span className="microLabel">YOUR PUBLIC CREW PROFILE</span><h2>{profile.display_name || 'Crew Member'}</h2><p>{profile.current_position || 'Add your current position'}{profile.department ? ` · ${profile.department}` : ''}</p></div></div></section>
      <div className="statGrid"><article className="statCard"><span>Verification</span><strong>{profile.verification || 'unverified'}</strong><small>CrewID status</small></article><article className="statCard"><span>Network</span><strong>{Number(profile.follower_count || 0).toLocaleString()}</strong><small>Followers</small></article><article className="statCard"><span>SeaPoints</span><strong>{Number(profile.points_balance || 0).toLocaleString()} SP</strong><small>Member rewards</small></article></div>
      <section className="panel"><div className="panelHead"><div><span className="microLabel">EDIT PROFILE</span><h2>Your professional details</h2><p>Profile and cover images currently accept HTTPS image URLs; private upload storage comes with the document-storage package.</p></div></div><form className="supportForm profileEditForm" onSubmit={save} key={JSON.stringify(profile)}>
        <label>Display name<input name="displayName" defaultValue={profile.display_name || ''} maxLength={100} required /></label>
        <label>Profile image URL<input name="avatarUrl" type="url" defaultValue={profile.avatar_url || ''} placeholder="https://…" /></label>
        <label>Cover image URL<input name="coverUrl" type="url" defaultValue={profile.cover_url || ''} placeholder="https://…" /></label>
        <label>Nationality<input name="nationality" defaultValue={profile.nationality || ''} maxLength={80} required /></label>
        <label>Country of residence<input name="countryOfResidence" defaultValue={profile.country_of_residence || ''} maxLength={80} /></label>
        <label>Department<input name="department" defaultValue={profile.department || ''} maxLength={80} required /></label>
        <label>Current position<input name="currentPosition" defaultValue={profile.current_position || ''} maxLength={120} required /></label>
        <label>Ship segment<input name="shipSegment" defaultValue={profile.ship_segment || ''} placeholder="Cruise, Cargo, Offshore…" maxLength={80} /></label>
        <label className="spanForm">Career summary<textarea name="careerSummary" defaultValue={profile.career_summary || ''} rows={6} maxLength={1200} /></label>
        <div className="profileToggleGroup spanForm"><label><input type="checkbox" name="openToWork" defaultChecked={Boolean(profile.open_to_work)} /> Open to new opportunities</label><label><input type="checkbox" name="openToMentor" defaultChecked={Boolean(profile.open_to_mentor)} /> Available to mentor crew</label><label><input type="checkbox" name="lookingForMentor" defaultChecked={Boolean(profile.looking_for_mentor)} /> Looking for a mentor</label></div>
        <button className="primaryButton" type="submit">Save CrewID</button><p>{message}</p>
      </form></section>
    </>}
  </AppShell>;
}
