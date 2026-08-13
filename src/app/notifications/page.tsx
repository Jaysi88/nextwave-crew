'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Notification = { id: string; type: string; title: string; body?: string; action_url?: string; read_at?: string; created_at: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/notifications');
    const j = await r.json();
    if (r.ok) { setItems(j.notifications || []); setUnread(j.unreadCount || 0); } else setMessage(j.error || 'Unable to load notifications.');
  }

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/notifications').then(async r => {
      const j = await r.json();
      if (cancelled) return;
      if (r.ok) { setItems(j.notifications || []); setUnread(j.unreadCount || 0); } else setMessage(j.error || 'Unable to load notifications.');
    });
    return () => { cancelled = true; };
  }, []);

  async function markAll() {
    const r = await fetch('/api/notifications', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'mark_all_read' }) });
    if (r.ok) await load();
  }

  async function markOne(id: string) {
    await fetch('/api/notifications', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    const wasUnread = !items.find(item => item.id === id)?.read_at;
    setItems(current => current.map(item => item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item));
    if (wasUnread) setUnread(current => Math.max(0, current - 1));
  }

  return <AppShell title="Notifications" kicker="CREW SIGNALS"><section className="panel notificationHeader"><div><span className="microLabel">INBOX</span><h2>{unread} unread signal{unread === 1 ? '' : 's'}</h2><p>Connections, community activity and important member updates arrive here.</p></div><button className="ghostButton" type="button" onClick={markAll}>Mark all read</button></section>{message && <div className="demoBanner">{message}</div>}<div className="notificationList">{items.map(item => { const card = <article className={`notificationCard ${item.read_at ? '' : 'unread'}`}><div className="notificationGlyph">{item.type === 'new_follower' ? '◉' : item.type === 'post_comment' ? '◌' : '♡'}</div><div><div className="notificationTitle"><b>{item.title}</b>{!item.read_at && <span>New</span>}</div>{item.body && <p>{item.body}</p>}<small>{new Date(item.created_at).toLocaleString()}</small></div></article>; return item.action_url ? <Link href={item.action_url} key={item.id} onClick={() => void markOne(item.id)}>{card}</Link> : <div key={item.id} onClick={() => void markOne(item.id)}>{card}</div>; })}</div>{!items.length && !message && <section className="panel"><p>No signals yet. Follow crew and participate in communities to start your activity stream.</p></section>}</AppShell>;
}
