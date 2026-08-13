'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type RewardData = { account?: { points_balance?: number | string; lifetime_earned?: number | string }; history?: Array<{ amount: number | string; reason_code: string; created_at: string }>; error?: string };
type CatalogItem = { id: string; title: string; description?: string; cost_points: number | string };

export default function WalletPage() {
  const [data, setData] = useState<RewardData | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [wallet, rewards] = await Promise.all([fetch('/api/rewards'), fetch('/api/rewards/catalog')]);
    const walletJson = await wallet.json();
    const rewardsJson = await rewards.json();
    setData(walletJson);
    if (rewards.ok) setCatalog(rewardsJson.items || []);
  }

  useEffect(() => {
    void Promise.all([fetch('/api/rewards'), fetch('/api/rewards/catalog')]).then(async ([wallet, rewards]) => {
      const walletJson = await wallet.json();
      const rewardsJson = await rewards.json();
      setData(walletJson);
      if (rewards.ok) setCatalog(rewardsJson.items || []);
    }).catch(() => setData({ error: 'Unable to load wallet.' }));
  }, []);

  async function redeem(item: CatalogItem) {
    setMessage('Processing redemption…');
    const r = await fetch('/api/rewards/redeem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ itemId: item.id }) });
    const j = await r.json();
    setMessage(r.ok ? `${item.title} requested successfully.` : j.error || 'Unable to redeem reward.');
    if (r.ok) await load();
  }

  const balance = Number(data?.account?.points_balance ?? 0);
  const lifetime = Number(data?.account?.lifetime_earned ?? 0);
  return <AppShell title="Crew Wallet" kicker="SEAPOINTS">
    <div className="demoBanner">SeaPoints are internal loyalty points for member benefits. They are not cryptocurrency, cash, or an investment product.</div>
    {message && <p>{message}</p>}
    <div className="statGrid"><article className="statCard"><span>SeaPoints balance</span><strong>{balance.toLocaleString()} SP</strong><small>Available rewards balance</small></article><article className="statCard"><span>Lifetime earned</span><strong>{lifetime.toLocaleString()} SP</strong><small>Member contribution history</small></article><article className="statCard"><span>Profile reward</span><strong>+100 SP</strong><small>Complete core CrewID fields once</small></article></div>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">REWARDS CATALOGUE</span><h2>Use your SeaPoints</h2></div></div><div className="communityGrid">{catalog.map(item => <article className="communityCard" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><strong>{Number(item.cost_points).toLocaleString()} SP</strong><div><button className="primaryButton" disabled={balance < Number(item.cost_points)} onClick={() => redeem(item)}>Redeem</button></div></article>)}</div>{!catalog.length && <p>Connect Neon and apply the reward catalogue migration to activate redemptions.</p>}</section>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">LEDGER</span><h2>Recent activity</h2></div></div>{!data && <p>Loading wallet…</p>}{data?.error && <p>{data.error} Sign in and connect Neon to activate the live wallet.</p>}{data?.history?.length ? data.history.map((item, i) => <div className="feedItem" key={`${item.created_at}-${i}`}><span className="avatar">SP</span><div><b>{Number(item.amount) > 0 ? '+' : ''}{Number(item.amount)} SP · {item.reason_code}</b><p>{new Date(item.created_at).toLocaleString()}</p></div></div>) : data && !data.error && <p>No SeaPoints activity yet.</p>}</section>
  </AppShell>;
}
