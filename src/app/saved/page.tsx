'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import SocialPostCard, { SocialPost } from '@/components/SocialPostCard';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    void fetch('/api/social/saves').then(async response => {
      const data = await response.json();
      if (cancelled) return;
      if (response.ok) setPosts(data.posts || []); else setMessage(data.error || 'Unable to load saved posts.');
    });
    return () => { cancelled = true; };
  }, []);
  return <AppShell title="Saved Posts" kicker="CREW LIBRARY">
    <div className="demoBanner">Keep useful crew knowledge, career advice and training discussions within easy reach.</div>
    {message && <p>{message}</p>}
    <div className="savedPostsGrid">{posts.map(post => <SocialPostCard key={post.id} post={post} />)}</div>
    {!posts.length && !message && <section className="panel savedEmpty"><span>◇</span><h2>Your crew library is empty</h2><p>Save a useful community post and it will appear here.</p></section>}
  </AppShell>;
}
