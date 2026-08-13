'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type SavedPost = { id: string; body: string; created_at: string; community_name: string; author_id: string; display_name: string; avatar_url?: string; verification?: string; comment_count?: number | string; reaction_count?: number | string };

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => { void fetch('/api/community/saved').then(async r => { const j = await r.json(); if (r.ok) setPosts(j.posts || []); else setMessage(j.error || 'Unable to load saved posts.'); }); }, []);
  return <AppShell title="Saved Posts" kicker="YOUR CREW LIBRARY">
    <div className="demoBanner">Save useful community knowledge for your next contract, training session or career move.</div>
    {message && <p>{message}</p>}
    <div className="socialFeedList">{posts.map(post => <article className="socialFeedCard" key={post.id}><div className="socialFeedHeader"><div className="socialAvatar">{post.display_name.slice(0,2).toUpperCase()}</div><div><Link href={`/members/${post.author_id}`}><b>{post.display_name}{post.verification === 'verified' ? ' ✓' : ''}</b></Link><small>{post.community_name} · {new Date(post.created_at).toLocaleDateString()}</small></div></div><p>{post.body}</p><div className="socialActions"><span>♡ {Number(post.reaction_count || 0)}</span><span>◌ {Number(post.comment_count || 0)} comments</span><Link href="/community">Open community →</Link></div></article>)}</div>
    {!posts.length && !message && <section className="panel"><p>You have not saved any posts yet. Use the bookmark action on a community post.</p></section>}
  </AppShell>;
}
