'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Community = { id: string; name: string; description?: string; department?: string; member_count: number; joined: boolean };
type Post = { id: string; author_id: string; body: string; created_at: string; community_name: string; display_name: string; avatar_url?: string; verification?: string; current_position?: string; comment_count?: number | string; reaction_count?: number | string; viewer_reaction?: string | null; saved?: boolean };
type Comment = { id: string; author_id: string; body: string; created_at: string; display_name: string; avatar_url?: string; verification?: string };

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [active, setActive] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');

  async function loadCommunities() {
    const r = await fetch('/api/communities');
    const j = await r.json();
    if (r.ok) {
      setCommunities(j.communities);
      setActive(current => current ? j.communities.find((c: Community) => c.id === current.id) ?? current : j.communities[0] ?? null);
    } else setMessage(j.error || 'Connect Neon and sign in to activate community data.');
  }

  async function loadPosts(community?: Community | null) {
    if (!community?.joined) { setPosts([]); return; }
    const r = await fetch(`/api/community/posts?communityId=${encodeURIComponent(community.id)}`);
    const j = await r.json();
    if (r.ok) setPosts(j.posts); else setMessage(j.error || 'Unable to load posts.');
  }

  useEffect(() => { void loadCommunities(); }, []);
  useEffect(() => { if (active) void loadPosts(active); }, [active?.id, active?.joined]);

  async function toggleJoin(c: Community) {
    const r = await fetch('/api/community/memberships', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ communityId: c.id, action: c.joined ? 'leave' : 'join' }) });
    const j = await r.json();
    if (!r.ok) setMessage(j.error || 'Unable to update membership.');
    else { setMessage(c.joined ? 'Community left.' : 'Welcome to the community.'); if (c.joined) setPosts([]); await loadCommunities(); }
  }

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = String(form.get('body') || '').trim();
    if (!body) return;
    const r = await fetch('/api/community/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ communityId: active.id, body }) });
    const j = await r.json();
    if (!r.ok) setMessage(j.error || 'Unable to post.');
    else { formElement.reset(); setMessage('Post published.'); await loadPosts(active); }
  }

  async function react(postId: string) {
    const r = await fetch('/api/community/reactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId, reaction: 'support' }) });
    const j = await r.json();
    if (!r.ok) return setMessage(j.error || 'Unable to react.');
    setPosts(current => current.map(p => p.id === postId ? { ...p, viewer_reaction: j.reacted ? j.reaction : null, reaction_count: j.reactionCount } : p));
  }

  async function save(postId: string) {
    const r = await fetch('/api/community/saved', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId }) });
    const j = await r.json();
    if (!r.ok) return setMessage(j.error || 'Unable to save post.');
    setPosts(current => current.map(p => p.id === postId ? { ...p, saved: j.saved } : p));
  }

  async function toggleComments(postId: string) {
    const willOpen = !openComments[postId];
    setOpenComments(current => ({ ...current, [postId]: willOpen }));
    if (!willOpen || comments[postId]) return;
    const r = await fetch(`/api/community/comments?postId=${encodeURIComponent(postId)}`);
    const j = await r.json();
    if (r.ok) setComments(current => ({ ...current, [postId]: j.comments || [] })); else setMessage(j.error || 'Unable to load comments.');
  }

  async function addComment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = String(form.get('comment') || '').trim();
    if (!body) return;
    const r = await fetch('/api/community/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId, body }) });
    const j = await r.json();
    if (!r.ok) return setMessage(j.error || 'Unable to comment.');
    formElement.reset();
    const refresh = await fetch(`/api/community/comments?postId=${encodeURIComponent(postId)}`);
    const data = await refresh.json();
    if (refresh.ok) setComments(current => ({ ...current, [postId]: data.comments || [] }));
    setPosts(current => current.map(p => p.id === postId ? { ...p, comment_count: Number(p.comment_count || 0) + 1 } : p));
  }

  return <AppShell title="Crew Community" kicker="PROFESSIONAL NETWORK">
    <div className="communityTabs"><button className="active" type="button">My spaces</button><Link href="/saved">Saved posts</Link><Link href="/members">Discover crew</Link></div>
    <div className="demoBanner">Private department communities for people who understand life at sea. Posts remain visible only to members of that community.</div>
    {message && <p className="inlineMessage">{message}</p>}
    <div className="communityGrid">{communities.map((c, i) => <article className={`communityCard ${active?.id === c.id ? 'featuredPrice' : ''}`} key={c.id}>
      <div className="communityIcon">{['♠','◫','⚓','⚙','✦'][i % 5]}</div><span className="microLabel">{c.department || 'CREW COMMUNITY'}</span><h3>{c.name}</h3><p>{c.description}</p><small>{c.member_count} members</small>
      <div className="communityCardActions"><button className="ghostButton small" onClick={() => setActive(c)}>Open space</button><button className="ghostButton small" onClick={() => toggleJoin(c)}>{c.joined ? 'Leave' : 'Join'}</button></div>
    </article>)}</div>

    {active && <section className="panel communitySpace"><div className="communitySpaceHeader"><div><span className="microLabel">{active.joined ? 'MEMBER SPACE' : 'JOIN TO PARTICIPATE'}</span><h2>{active.name}</h2><p>{active.description}</p></div><span className="statusPill"><span className="liveDot" /> {active.member_count} crew</span></div>
      {active.joined ? <>
        <form className="socialComposer" onSubmit={post}><div className="socialAvatar">YOU</div><label><span>Share something useful with the crew</span><textarea name="body" rows={3} maxLength={10000} required placeholder="Ask a question, share experience, recommend a resource…" /></label><div className="composerFooter"><span>Professional, useful, respectful.</span><button className="primaryButton small" type="submit">Post to crew</button></div></form>
        <div className="socialFeedList">{posts.map(p => <article className="socialFeedCard" key={p.id}>
          <div className="socialFeedHeader"><div className="socialAvatar" style={p.avatar_url ? { backgroundImage: `url(${p.avatar_url})` } : undefined}>{!p.avatar_url && p.display_name.slice(0,2).toUpperCase()}</div><div><Link href={`/members/${p.author_id}`}><b>{p.display_name}{p.verification === 'verified' ? ' ✓' : ''}</b></Link><small>{p.current_position ? `${p.current_position} · ` : ''}{p.community_name} · {new Date(p.created_at).toLocaleString()}</small></div><button className={`saveIcon ${p.saved ? 'active' : ''}`} type="button" onClick={() => save(p.id)} aria-label={p.saved ? 'Remove saved post' : 'Save post'}>{p.saved ? '◆' : '◇'}</button></div>
          <p className="socialPostBody">{p.body}</p>
          <div className="socialActions"><button className={p.viewer_reaction ? 'active' : ''} type="button" onClick={() => react(p.id)}>♡ {Number(p.reaction_count || 0)} Support</button><button type="button" onClick={() => toggleComments(p.id)}>◌ {Number(p.comment_count || 0)} Comments</button><button type="button" onClick={() => save(p.id)}>{p.saved ? '◆ Saved' : '◇ Save'}</button></div>
          {openComments[p.id] && <div className="commentsTray"><div className="commentList">{(comments[p.id] || []).map(comment => <div className="commentRow" key={comment.id}><div className="socialAvatar tiny" style={comment.avatar_url ? { backgroundImage: `url(${comment.avatar_url})` } : undefined}>{!comment.avatar_url && comment.display_name.slice(0,2).toUpperCase()}</div><div><Link href={`/members/${comment.author_id}`}><b>{comment.display_name}{comment.verification === 'verified' ? ' ✓' : ''}</b></Link><p>{comment.body}</p><small>{new Date(comment.created_at).toLocaleString()}</small></div></div>)}</div><form className="commentComposer" onSubmit={event => addComment(event, p.id)}><input name="comment" maxLength={5000} placeholder="Add a thoughtful response…" required /><button className="primaryButton small" type="submit">Reply</button></form></div>}
        </article>)}</div>
        {!posts.length && <p>No posts yet. Start the conversation.</p>}
      </> : <p>Join this space to read and publish member posts.</p>}
    </section>}
  </AppShell>;
}
