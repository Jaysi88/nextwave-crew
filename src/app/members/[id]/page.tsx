'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type MemberProfile = {
  id: string; display_name: string; avatar_url?: string; cover_url?: string; nationality?: string; country_of_residence?: string;
  verification?: string; department?: string; current_position?: string; ship_segment?: string; years_at_sea?: number | string;
  career_summary?: string; open_to_work?: boolean; open_to_mentor?: boolean; looking_for_mentor?: boolean;
  follower_count?: number | string; following_count?: number | string; post_count?: number | string; is_following?: boolean;
};
type RecentPost = { id: string; body: string; created_at: string; community_name: string; comment_count?: number | string; reaction_count?: number | string };

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [posts, setPosts] = useState<RecentPost[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/members/${encodeURIComponent(id)}`);
    const j = await r.json();
    if (r.ok) { setProfile(j.member); setPosts(j.recentPosts || []); setMessage(''); }
    else setMessage(j.error || 'Unable to load member profile.');
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void fetch(`/api/members/${encodeURIComponent(id)}`).then(async r => {
      const j = await r.json();
      if (cancelled) return;
      if (r.ok) { setProfile(j.member); setPosts(j.recentPosts || []); setMessage(''); }
      else setMessage(j.error || 'Unable to load member profile.');
    });
    return () => { cancelled = true; };
  }, [id]);

  async function follow() {
    if (!profile) return;
    const r = await fetch('/api/social/follows', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetUserId: profile.id, action: profile.is_following ? 'unfollow' : 'follow' }) });
    const j = await r.json();
    if (!r.ok) setMessage(j.error || 'Unable to update connection.'); else await load();
  }

  return <AppShell title={profile?.display_name || 'Crew Profile'} kicker="MEMBER PROFILE">
    {message && <div className="demoBanner">{message}</div>}
    {!profile && !message && <p>Loading crew profile…</p>}
    {profile && <>
      <section className="socialProfileHero"><div className="profileCover" style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : undefined} /><div className="profileHeroBody"><div className="profileAvatarLarge" style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}>{!profile.avatar_url && profile.display_name.slice(0,2).toUpperCase()}</div><div className="profileIdentity"><span className="microLabel">{profile.verification === 'verified' ? '✓ VERIFIED CREW' : 'NEXTWAVE CREW MEMBER'}</span><h2>{profile.display_name}</h2><p>{profile.current_position || 'Maritime professional'}{profile.department ? ` · ${profile.department}` : ''}</p></div><button className={profile.is_following ? 'ghostButton' : 'primaryButton'} type="button" onClick={follow}>{profile.is_following ? 'Following ✓' : '+ Follow voyage'}</button></div><div className="socialStats"><div><b>{Number(profile.follower_count || 0).toLocaleString()}</b><span>Followers</span></div><div><b>{Number(profile.following_count || 0).toLocaleString()}</b><span>Following</span></div><div><b>{Number(profile.post_count || 0).toLocaleString()}</b><span>Posts</span></div></div></section>
      <div className="twoCol socialProfileColumns"><section className="panel"><span className="microLabel">ABOUT</span><h2>{profile.ship_segment || 'Life at sea'}</h2><p>{profile.career_summary || 'This member has not added a career summary yet.'}</p><div className="profileFacts"><span>⚓ {profile.department || 'Maritime'}</span><span>◌ {profile.nationality || 'Nationality not shown'}</span><span>⌁ {profile.country_of_residence || 'Residence not shown'}</span><span>≈ {Number(profile.years_at_sea || 0)} years at sea</span></div><div className="socialBadges">{profile.open_to_work && <span>Open to work</span>}{profile.open_to_mentor && <span>Offers mentoring</span>}{profile.looking_for_mentor && <span>Looking for mentor</span>}</div></section><section className="panel"><span className="microLabel">VOYAGE SIGNAL</span><h2>Professional connection</h2><p>Follow members to keep their professional activity discoverable inside communities you both belong to.</p><Link className="ghostButton" href="/community">Open community</Link></section></div>
      <section className="panel"><div className="panelHead"><div><span className="microLabel">RECENT ACTIVITY</span><h2>Community posts</h2></div></div><div className="socialFeedList">{posts.map(post => <article className="socialFeedCard compact" key={post.id}><span className="microLabel">{post.community_name}</span><p>{post.body}</p><div className="socialActions"><span>♡ {Number(post.reaction_count || 0)}</span><span>◌ {Number(post.comment_count || 0)} comments</span><span>{new Date(post.created_at).toLocaleDateString()}</span></div></article>)}</div>{!posts.length && <p>No recent posts are visible in your shared communities.</p>}</section>
    </>}
  </AppShell>;
}
