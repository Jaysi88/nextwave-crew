'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Community = { id: string; name: string; description?: string; department?: string; member_count: number; joined: boolean };
type Post = { id: string; body: string; created_at: string; community_name: string; display_name: string };

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [active, setActive] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState('');

  async function loadCommunities() {
    const r = await fetch('/api/communities');
    const j = await r.json();
    if (r.ok) {
      setCommunities(j.communities);
      setActive((current: Community | null) => current ? j.communities.find((c: Community) => c.id === current.id) ?? current : j.communities[0] ?? null);
    } else setMessage(j.error || 'Connect Neon and sign in to activate community data.');
  }

  async function loadPosts(community?: Community | null) {
    if (!community?.joined) return;
    const r = await fetch(`/api/community/posts?communityId=${encodeURIComponent(community.id)}`);
    const j = await r.json();
    if (r.ok) setPosts(j.posts);
  }

  useEffect(() => {
    void fetch('/api/communities').then(async r => {
      const j = await r.json();
      if (r.ok) {
        setCommunities(j.communities);
        setActive(j.communities[0] ?? null);
      } else setMessage(j.error || 'Connect Neon and sign in to activate community data.');
    });
  }, []);

  useEffect(() => {
    if (!active?.joined) return;
    void fetch(`/api/community/posts?communityId=${encodeURIComponent(active.id)}`).then(async r => {
      const j = await r.json();
      if (r.ok) setPosts(j.posts);
    });
  }, [active]);

  async function toggleJoin(c: Community) {
    const r = await fetch('/api/community/memberships', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ communityId: c.id, action: c.joined ? 'leave' : 'join' }) });
    const j = await r.json();
    if (!r.ok) setMessage(j.error || 'Unable to update membership.');
    else {
      setMessage(c.joined ? 'Community left.' : 'Welcome to the community.');
      if (c.joined) setPosts([]);
      await loadCommunities();
    }
  }

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const form = new FormData(event.currentTarget);
    const body = String(form.get('body') || '').trim();
    if (!body) return;
    const r = await fetch('/api/community/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ communityId: active.id, body }) });
    const j = await r.json();
    if (!r.ok) setMessage(j.error || 'Unable to post.');
    else {
      event.currentTarget.reset();
      setMessage('Post published.');
      await loadPosts(active);
    }
  }

  return <AppShell title="Crew Community" kicker="PROFESSIONAL NETWORK">
    <div className="demoBanner">Private department communities for people who understand life at sea. Live data activates with Neon Auth and the database migrations.</div>
    {message && <p>{message}</p>}
    <div className="communityGrid">{communities.map((c, i) => <article className={`communityCard ${active?.id === c.id ? 'featuredPrice' : ''}`} key={c.id}>
      <div className="communityIcon">{['♠','◫','⚓','⚙','✦'][i % 5]}</div><span className="microLabel">{c.department || 'CREW COMMUNITY'}</span><h3>{c.name}</h3><p>{c.description}</p><small>{c.member_count} members</small>
      <div><button className="ghostButton small" onClick={() => { setPosts([]); setActive(c); }}>Open space</button> <button className="ghostButton small" onClick={() => toggleJoin(c)}>{c.joined ? 'Leave' : 'Join'}</button></div>
    </article>)}</div>
    {active && <section className="panel"><div className="panelHead"><div><span className="microLabel">{active.joined ? 'MEMBER SPACE' : 'JOIN TO PARTICIPATE'}</span><h2>{active.name}</h2></div></div>
      {active.joined ? <><form className="supportForm" onSubmit={post}><label>Share with the crew<textarea name="body" rows={4} maxLength={10000} required /></label><button className="primaryButton" type="submit">Publish post</button></form>
      {posts.length ? posts.map(p => <div className="feedItem" key={p.id}><span className="avatar">{p.display_name.slice(0,2).toUpperCase()}</span><div><b>{p.display_name} · {p.community_name}</b><p>{p.body}</p><small>{new Date(p.created_at).toLocaleString()}</small></div></div>) : <p>No posts yet. Start the conversation.</p>}</> : <p>Join this space to read and publish member posts.</p>}
    </section>}
  </AppShell>;
}
