'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export type SocialPost = { id: string; author_id: string; body: string; created_at: string; community_name: string; display_name: string; avatar_url?: string; verification?: string; reaction_count: number | string; comment_count: number | string; saved: boolean; my_reaction?: string | null };
type Comment = { id: string; body: string; created_at: string; author_id: string; display_name: string; avatar_url?: string; verification?: string };
const reactions = [{ id: 'like', icon: '♡', label: 'Like' }, { id: 'helpful', icon: '✦', label: 'Helpful' }, { id: 'respect', icon: '⚓', label: 'Respect' }, { id: 'celebrate', icon: '◉', label: 'Celebrate' }] as const;

export default function SocialPostCard({ post: initial }: { post: SocialPost }) {
  const [post, setPost] = useState(initial);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [message, setMessage] = useState('');
  const avatarStyle = post.avatar_url ? { backgroundImage: `url(${post.avatar_url})` } : undefined;

  async function react(reaction: string) {
    const response = await fetch('/api/social/reactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId: post.id, reaction }) });
    const data = await response.json();
    if (response.ok) setPost(value => ({ ...value, my_reaction: data.myReaction, reaction_count: data.reactionCount })); else setMessage(data.error || 'Unable to react.');
  }

  async function save() {
    const response = await fetch('/api/social/saves', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId: post.id }) });
    const data = await response.json();
    if (response.ok) setPost(value => ({ ...value, saved: data.saved })); else setMessage(data.error || 'Unable to save.');
  }

  async function openComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && !comments.length) {
      const response = await fetch(`/api/community/comments?postId=${encodeURIComponent(post.id)}`);
      const data = await response.json();
      if (response.ok) setComments(data.comments);
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const body = String(new FormData(formElement).get('body') || '').trim();
    if (!body) return;
    const response = await fetch('/api/community/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId: post.id, body }) });
    const data = await response.json();
    if (response.ok) {
      formElement.reset();
      setPost(value => ({ ...value, comment_count: Number(value.comment_count || 0) + 1 }));
      const refresh = await fetch(`/api/community/comments?postId=${encodeURIComponent(post.id)}`);
      const refreshed = await refresh.json();
      if (refresh.ok) setComments(refreshed.comments);
    } else setMessage(data.error || 'Unable to comment.');
  }

  return <article className="panel socialPost"><div className="socialPostHead"><span className="miniAvatar" style={avatarStyle}>{!post.avatar_url && post.display_name.slice(0,2).toUpperCase()}</span><div><Link href={`/members/${post.author_id}`}><b>{post.display_name}</b>{post.verification === 'verified' && <span className="verifiedBadge"> ✓</span>}</Link><small>{post.community_name} · {new Date(post.created_at).toLocaleString()}</small></div><button className={`postSaveButton ${post.saved ? 'active' : ''}`} onClick={save} aria-label={post.saved ? 'Remove from saved posts' : 'Save post'}>{post.saved ? '◆' : '◇'}</button></div><div className="socialPostBody">{post.body}</div><div className="socialActions socialReactionActions"><div className="reactionStrip">{reactions.map(item => <button key={item.id} className={post.my_reaction === item.id ? 'active' : ''} onClick={() => react(item.id)} title={item.label}><span>{item.icon}</span><small>{item.label}</small></button>)}</div><button onClick={openComments}>💬 Reply · {Number(post.comment_count || 0)}</button><button className={post.saved ? 'active' : ''} onClick={save}>🔖 {post.saved ? 'Saved' : 'Save'}</button></div><div className="reactionCount">{Number(post.reaction_count || 0)} crew reaction{Number(post.reaction_count || 0) === 1 ? '' : 's'}</div>{message && <small className="socialMessage">{message}</small>}{showComments && <div className="commentBox">{comments.map(comment => <div className="commentRow" key={comment.id}><div><Link href={`/members/${comment.author_id}`}><b>{comment.display_name}{comment.verification === 'verified' ? ' ✓' : ''}</b></Link><p>{comment.body}</p><small>{new Date(comment.created_at).toLocaleString()}</small></div></div>)}<form className="commentComposer" onSubmit={addComment}><input name="body" maxLength={5000} placeholder="Add a crew reply…" required /><button className="primaryButton small">Reply</button></form></div>}</article>;
}
