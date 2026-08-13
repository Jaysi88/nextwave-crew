'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type Notification = { id: string; type: string; title: string; body?: string; action_url?: string; read_at?: string; created_at: string };

export default function NotificationsPage() {
  const [items,setItems]=useState<Notification[]>([]); const[unread,setUnread]=useState(0); const[message,setMessage]=useState('');
  async function load(){const response=await fetch('/api/notifications');const data=await response.json();if(response.ok){setItems(data.notifications||[]);setUnread(Number(data.unreadCount||data.unread||0));}else setMessage(data.error||'Unable to load notifications.');}
  useEffect(()=>{let cancelled=false;void fetch('/api/notifications').then(async response=>{const data=await response.json();if(cancelled)return;if(response.ok){setItems(data.notifications||[]);setUnread(Number(data.unreadCount||data.unread||0));}else setMessage(data.error||'Unable to load notifications.');});return()=>{cancelled=true};},[]);
  async function markAll(){const response=await fetch('/api/notifications',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({all:true})});if(response.ok)await load();}
  async function markOne(id:string){const existing=items.find(item=>item.id===id);if(existing?.read_at)return;const response=await fetch('/api/notifications',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id})});if(response.ok){setItems(current=>current.map(item=>item.id===id?{...item,read_at:new Date().toISOString()}:item));setUnread(current=>Math.max(0,current-1));}}
  return <AppShell title="Notifications" kicker="CREW SIGNALS"><section className="panel notificationSummary"><div><span className="microLabel">{unread} UNREAD</span><h2>What changed around your network</h2><p>Follows, reactions, comments and mentoring updates arrive as crew signals.</p></div><button className="ghostButton small" onClick={markAll}>Mark all read</button></section>{message&&<p>{message}</p>}<div className="notificationList">{items.map(item=>{const card=<article className={`panel notificationItem ${!item.read_at?'unread':''}`}><div className="notificationIcon">{item.type.includes('mentor')?'⚓':item.type.includes('comment')?'💬':'✦'}</div><div><div className="notificationTitle"><b>{item.title}</b>{!item.read_at&&<span>New</span>}</div><p>{item.body}</p><small>{new Date(item.created_at).toLocaleString()}</small></div></article>;return item.action_url?<Link key={item.id} href={item.action_url} onClick={()=>void markOne(item.id)}>{card}</Link>:<div key={item.id} onClick={()=>void markOne(item.id)}>{card}</div>;})}</div>{!items.length&&!message&&<section className="panel savedEmpty"><span>✦</span><h2>All quiet on deck</h2><p>No crew signals yet.</p></section>}</AppShell>;
}
