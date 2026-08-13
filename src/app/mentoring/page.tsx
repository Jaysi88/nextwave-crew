'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type RequestItem = { id: string; message?: string; status: string; created_at: string; updated_at: string; member_id: string; display_name: string; avatar_url?: string; verification?: string; department?: string; current_position?: string };

export default function MentoringPage() {
  const [incoming, setIncoming] = useState<RequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<RequestItem[]>([]);
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch('/api/social/mentor');
    const data = await response.json();
    if (response.ok) { setIncoming(data.incoming || []); setOutgoing(data.outgoing || []); setMessage(''); }
    else setMessage(data.error || 'Unable to load mentoring requests.');
  }

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/social/mentor').then(async response => {
      const data = await response.json();
      if (cancelled) return;
      if (response.ok) { setIncoming(data.incoming || []); setOutgoing(data.outgoing || []); }
      else setMessage(data.error || 'Unable to load mentoring requests.');
    });
    return () => { cancelled = true; };
  }, []);

  async function act(id: string, action: 'accept' | 'decline' | 'cancel') {
    const response = await fetch('/api/social/mentor', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, action }) });
    const data = await response.json();
    setMessage(response.ok ? `Mentoring request ${data.status}.` : data.error || 'Unable to update request.');
    if (response.ok) await load();
  }

  const items = tab === 'incoming' ? incoming : outgoing;
  const pending = incoming.filter(item => item.status === 'pending').length;
  return <AppShell title="Mentoring" kicker="CREW GROWTH">
    <section className="panel mentorHero"><div><span className="microLabel">MENTOR NETWORK</span><h2>Experience passed crew to crew.</h2><p>Ask experienced members for guidance or help another seafarer navigate their next contract and career step.</p></div><div className="mentorPending"><b>{pending}</b><span>pending for you</span></div></section>
    <div className="socialTabs mentorTabs"><button className={tab === 'incoming' ? 'active' : ''} onClick={() => setTab('incoming')}>Requests for me · {incoming.length}</button><button className={tab === 'outgoing' ? 'active' : ''} onClick={() => setTab('outgoing')}>My requests · {outgoing.length}</button><Link href="/members">Find a mentor →</Link></div>
    {message && <p className="mentorMessage">{message}</p>}
    <div className="mentorRequestList">{items.map(item => <article className={`panel mentorRequest ${item.status === 'pending' ? 'pending' : ''}`} key={item.id}><div className="mentorAvatar" style={item.avatar_url ? { backgroundImage: `url(${item.avatar_url})` } : undefined}>{!item.avatar_url && item.display_name.slice(0,2).toUpperCase()}</div><div className="mentorRequestCopy"><Link href={`/members/${item.member_id}`}><b>{item.display_name}{item.verification === 'verified' ? ' ✓' : ''}</b></Link><span>{item.current_position || 'Maritime professional'}{item.department ? ` · ${item.department}` : ''}</span>{item.message && <p>{item.message}</p>}<small>{new Date(item.updated_at || item.created_at).toLocaleString()}</small></div><div className="mentorRequestActions"><span className={`mentorStatus ${item.status}`}>{item.status}</span>{item.status === 'pending' && tab === 'incoming' && <><button className="primaryButton small" onClick={() => act(item.id, 'accept')}>Accept</button><button className="ghostButton small" onClick={() => act(item.id, 'decline')}>Decline</button></>}{item.status === 'pending' && tab === 'outgoing' && <button className="ghostButton small" onClick={() => act(item.id, 'cancel')}>Cancel</button>}</div></article>)}</div>
    {!items.length && !message && <section className="panel savedEmpty"><span>⚓</span><h2>No mentoring requests yet</h2><p>Visit the crew directory and open a member profile marked “Mentor available”.</p><Link className="primaryButton small" href="/members">Discover mentors</Link></section>}
  </AppShell>;
}
