'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

type DashboardData = { profile?: Record<string, unknown>; voyage?: Record<string, unknown> | null; wealth?: Record<string, unknown> | null; jobs?: Array<Record<string, unknown>>; communities?: Array<Record<string, unknown>>; documents?: Record<string, unknown> };
const money = (value: unknown, currency = 'USD') => new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0}).format(Number(value || 0));

export default function Dashboard() {
  const [data,setData]=useState<DashboardData>({}); const [message,setMessage]=useState('Loading your member command center…');
  useEffect(()=>{void fetch('/api/dashboard').then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||'Unable to load dashboard.');setData(body);setMessage('');}).catch(error=>setMessage(error.message));},[]);
  const profile=data.profile||{}, wealth=data.wealth||{}, voyage=data.voyage||{}, documents=data.documents||{};
  const currency=String(wealth.currency||'USD'); const score=Number(profile.profile_score||0);
  const income=Number(wealth.monthly_ship_income||0)*Number(wealth.contract_months||0);
  return <AppShell title={`Welcome, ${String(profile.display_name||'crew member')}`} kicker="MEMBER COMMAND CENTER">
    {message&&<div className="demoBanner">{message}</div>}
    <div className="dashboardGrid">
      <section className="panel span2"><div className="panelHead"><div><span className="microLabel">CURRENT VOYAGE</span><h2>{String(voyage.position_title||profile.current_position||'Add your current role')}</h2><p>{voyage.vessel_name_snapshot?`${voyage.vessel_name_snapshot} · ${voyage.company_name_snapshot}`:'Add sea service to build your verified career record.'}</p></div><div className="oceanOrb" aria-hidden="true"><span className="orbRing"/><span className="orbDot"/></div></div><div className="panelFooter"><span>{voyage.started_on?`Started ${new Date(String(voyage.started_on)).toLocaleDateString()}`:'No active voyage recorded'}</span><Link href="/crew-id">Update record →</Link></div></section>
      <section className="panel wealthMini"><span className="microLabel">CREWWEALTH</span><h2>{money(wealth.emergency_fund,currency)}</h2><p>Emergency reserve</p><small>{money(wealth.savings_total,currency)} total savings tracked</small></section>
      <section className="panel"><span className="microLabel">CREWID HEALTH</span><div className="bigScore">{score}<span>/100</span></div><p>{Number(documents.verified||0)} verified · {Number(documents.expiring||0)} expiring documents.</p><Link className="textButton" href="/crew-id">Review CrewID →</Link></section>
      <section className="panel span2"><div className="panelHead"><div><span className="microLabel">CAREER RADAR</span><h2>Current matches</h2></div><Link className="textButton" href="/career">View all</Link></div><div className="opportunityList">{(data.jobs||[]).map(job=><div key={String(job.id)} className="opportunity"><div><b>{String(job.title)}</b><span>{String(job.company_name||'Verified employer')} · {String(job.region||job.department||'Worldwide')}</span></div></div>)}{!(data.jobs||[]).length&&<p>No published roles match yet.</p>}</div></section>
      <section className="panel"><span className="microLabel">YOUR COMMUNITIES</span><div className="miniList">{(data.communities||[]).map(c=><div key={String(c.id)}><span>{String(c.name)}</span><b>{Number(c.post_count||0)} recent posts</b></div>)}{!(data.communities||[]).length&&<p>Join your first department space.</p>}</div></section>
      <section className="panel span3"><div className="panelHead"><div><span className="microLabel">THIS CONTRACT</span><h2>Financial flight plan</h2></div><span className="statusPill positive"><span className="liveDot"/> Private planning data</span></div><div className="moneyGrid"><div><span>Contract income</span><b>{money(income,currency)}</b><small>Projected</small></div><div><span>Savings</span><b>{money(wealth.savings_total,currency)}</b><small>Tracked</small></div><div><span>Emergency fund</span><b>{money(wealth.emergency_fund,currency)}</b><small>Safety buffer</small></div><div><span>Invested</span><b>{money(wealth.investment_total,currency)}</b><small>Tracked assets</small></div></div></section>
    </div>
  </AppShell>;
}
