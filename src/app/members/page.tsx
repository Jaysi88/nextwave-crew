'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Member = {
  id: string; display_name: string; avatar_url?: string; cover_url?: string; nationality?: string; country_of_residence?: string;
  verification?: string; department?: string; current_position?: string; ship_segment?: string; years_at_sea?: number | string;
  career_summary?: string; open_to_work?: boolean; open_to_mentor?: boolean; looking_for_mentor?: boolean;
  follower_count?: number | string; is_following?: boolean;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState('');

  async function search(q = '', department = '') {
    const r = await fetch(`/api/members?q=${encodeURIComponent(q)}&department=${encodeURIComponent(department)}`);
    const j = await r.json();
    if (r.ok) setMembers(j.members); else setMessage(j.error || 'Unable to load members.');
  }

  useEffect(() => {
    void fetch('/api/members').then(async r => {
      const j = await r.json();
      if (r.ok) setMembers(j.members); else setMessage(j.error || 'Connect Neon and sign in to activate the member directory.');
    });
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void search(String(form.get('q') || ''), String(form.get('department') || ''));
  }

  return <AppShell title="Crew Directory" kicker="GLOBAL MEMBERS">
    <div className="demoBanner">Discover members through professional details only. Email addresses, identity numbers, private documents and financial data are excluded.</div>
    <section className="panel directorySearch"><form className="supportForm" onSubmit={submit}>
      <label>Search<input name="q" placeholder="Name, position or department" /></label>
      <label>Department<input name="department" placeholder="Casino, Deck, Engine, Hotel…" /></label>
      <button className="primaryButton" type="submit">Search members</button>
    </form></section>
    {message && <p>{message}</p>}
    <div className="memberDirectoryGrid">{members.map(member => <Link className="memberDirectoryCard" href={`/members/${member.id}`} key={member.id}>
      <div className="memberCardCover" style={member.cover_url ? { backgroundImage: `url(${member.cover_url})` } : undefined} />
      <div className="memberCardBody">
        <div className="socialAvatar large" style={member.avatar_url ? { backgroundImage: `url(${member.avatar_url})` } : undefined}>{!member.avatar_url && member.display_name.slice(0,2).toUpperCase()}</div>
        <span className="microLabel">{member.verification === 'verified' ? '✓ VERIFIED CREW' : 'CREW MEMBER'}</span>
        <h3>{member.display_name}</h3>
        <p><b>{member.current_position || 'Maritime professional'}</b>{member.department ? ` · ${member.department}` : ''}</p>
        <p>{member.ship_segment || 'Maritime'}{member.nationality ? ` · ${member.nationality}` : ''}</p>
        <div className="socialBadges">{member.open_to_work && <span>Open to work</span>}{member.open_to_mentor && <span>Mentor</span>}{member.looking_for_mentor && <span>Seeking mentor</span>}</div>
        <div className="memberCardFooter"><span>{Number(member.follower_count || 0).toLocaleString()} followers</span><b>{member.is_following ? 'Following' : 'View profile'} →</b></div>
      </div>
    </Link>)}</div>
    {!members.length && !message && <p>No visible members match this search yet.</p>}
  </AppShell>;
}
