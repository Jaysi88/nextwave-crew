'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

type RewardData = { account?: { points_balance?: number | string; lifetime_earned?: number | string }; history?: Array<{ amount: number | string; reason_code: string; created_at: string }>; error?: string };

export default function WalletPage() {
  const [data, setData] = useState<RewardData | null>(null);
  useEffect(() => { fetch('/api/rewards').then(async r => setData(await r.json())).catch(() => setData({ error: 'Unable to load wallet.' })); }, []);
  const balance = Number(data?.account?.points_balance ?? 0);
  const lifetime = Number(data?.account?.lifetime_earned ?? 0);
  return <AppShell title="Crew Wallet" kicker="SEAPOINTS">
    <div className="demoBanner">SeaPoints are internal loyalty points. They are not cryptocurrency, cash, or an investment product.</div>
    <div className="statGrid">
      <article className="statCard"><span>SeaPoints balance</span><strong>{balance.toLocaleString()} SP</strong><small>Available rewards balance</small></article>
      <article className="statCard"><span>Lifetime earned</span><strong>{lifetime.toLocaleString()} SP</strong><small>Member contribution history</small></article>
      <article className="statCard"><span>Profile reward</span><strong>+100 SP</strong><small>Complete core CrewID fields once</small></article>
    </div>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">EARN & USE</span><h2>Member reward economy</h2></div></div>
      <p>SeaPoints will reward verified learning, mentoring, useful community participation, referrals and selected partner activity. Redemption rules will be controlled by the platform so points cannot be self-minted or manipulated.</p>
    </section>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">LEDGER</span><h2>Recent activity</h2></div></div>
      {!data && <p>Loading wallet…</p>}{data?.error && <p>{data.error} Sign in and connect Neon to activate the live wallet.</p>}
      {data?.history?.length ? data.history.map((item, i) => <div className="feedItem" key={`${item.created_at}-${i}`}><span className="avatar">SP</span><div><b>{Number(item.amount) > 0 ? '+' : ''}{Number(item.amount)} SP · {item.reason_code}</b><p>{new Date(item.created_at).toLocaleString()}</p></div></div>) : data && !data.error && <p>No SeaPoints activity yet.</p>}
    </section>
  </AppShell>;
}
