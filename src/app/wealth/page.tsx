'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import WealthPlanner from '@/components/WealthPlanner';

type Snapshot = { monthly_ship_income: number | string; contract_months: number | string; planned_leave_months: number | string; monthly_family_support: number | string; emergency_fund: number | string; savings_total: number | string; investment_total: number | string; debt_total: number | string; currency: string };
type Goal = { id: string; name: string; goal_type: string; target_amount: number | string; current_amount: number | string; currency: string; target_date?: string };

const emptySnapshot: Snapshot = { monthly_ship_income: 0, contract_months: 0, planned_leave_months: 0, monthly_family_support: 0, emergency_fund: 0, savings_total: 0, investment_total: 0, debt_total: 0, currency: 'USD' };

export default function WealthPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const r = await fetch('/api/wealth'); const j = await r.json();
    if (r.ok) { setSnapshot(j.snapshot || emptySnapshot); setGoals(j.goals || []); setLoaded(true); }
    else { setMessage(j.error || 'Unable to load CrewWealth.'); setLoaded(true); }
  }
  useEffect(() => {
    void fetch('/api/wealth').then(async r => { const j = await r.json(); if (r.ok) { setSnapshot(j.snapshot || emptySnapshot); setGoals(j.goals || []); } else setMessage(j.error || 'Connect Neon and sign in to activate saved CrewWealth data.'); setLoaded(true); });
  }, []);

  const currency = snapshot.currency || 'USD';
  const nf = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }), [currency]);
  const savings = Number(snapshot.savings_total || 0); const investments = Number(snapshot.investment_total || 0); const debt = Number(snapshot.debt_total || 0);
  const netPosition = savings + investments - debt; const contractIncome = Number(snapshot.monthly_ship_income || 0) * Number(snapshot.contract_months || 0);

  async function saveSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('Saving financial snapshot…'); const form = new FormData(event.currentTarget);
    const body = { monthlyShipIncome: form.get('monthlyShipIncome'), contractMonths: form.get('contractMonths'), plannedLeaveMonths: form.get('plannedLeaveMonths'), monthlyFamilySupport: form.get('monthlyFamilySupport'), emergencyFund: form.get('emergencyFund'), savingsTotal: form.get('savingsTotal'), investmentTotal: form.get('investmentTotal'), debtTotal: form.get('debtTotal'), currency: String(form.get('currency') || 'USD').toUpperCase() };
    const r = await fetch('/api/wealth', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json(); setMessage(r.ok ? 'CrewWealth snapshot saved.' : j.error || 'Unable to save.'); if (r.ok) await refresh();
  }
  async function addGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('Creating goal…'); const form = new FormData(event.currentTarget);
    const r = await fetch('/api/wealth/goals', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), goalType: form.get('goalType'), targetAmount: form.get('targetAmount'), currency: String(form.get('currency') || currency).toUpperCase(), targetDate: form.get('targetDate') }) }); const j = await r.json(); if (r.ok) { event.currentTarget.reset(); setMessage('Savings goal created.'); await refresh(); } else setMessage(j.error || 'Unable to create goal.');
  }
  async function updateGoal(goal: Goal, value: string) {
    const r = await fetch('/api/wealth/goals', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: goal.id, currentAmount: value }) }); const j = await r.json(); setMessage(r.ok ? `${goal.name} updated.` : j.error || 'Unable to update goal.'); if (r.ok) await refresh();
  }

  return <AppShell title="CrewWealth" kicker="FINANCIAL WELLBEING">
    <div className="demoBanner">Private planning workspace for irregular contract income. NextWave Crew does not hold the money represented here.</div>
    {message && <p>{message}</p>}
    <div className="wealthHero"><div><span className="microLabel">NET POSITION</span><h2>{nf.format(netPosition)}</h2><p>Tracked savings plus investments minus debt.</p></div><div className="wealthGauge"><b>{nf.format(Number(snapshot.emergency_fund || 0))}</b><span>Emergency fund</span></div></div>
    <div className="moneyGrid large"><div><span>Contract income</span><b>{nf.format(contractIncome)}</b><small>Projected from saved inputs</small></div><div><span>Family allotment</span><b>{nf.format(Number(snapshot.monthly_family_support || 0))}</b><small>Per month</small></div><div><span>Savings</span><b>{nf.format(savings)}</b><small>Tracked balance</small></div><div><span>Investments</span><b>{nf.format(investments)}</b><small>Self-reported total</small></div></div>
    <WealthPlanner />
    <section className="panel"><div className="panelHead"><div><span className="microLabel">PRIVATE SNAPSHOT</span><h2>Save your current position</h2></div></div>{loaded && <form className="supportForm" onSubmit={saveSnapshot} key={JSON.stringify(snapshot)}><label>Monthly ship income<input type="number" min="0" step="0.01" name="monthlyShipIncome" defaultValue={Number(snapshot.monthly_ship_income || 0)} /></label><label>Contract months<input type="number" min="0" max="24" step="0.1" name="contractMonths" defaultValue={Number(snapshot.contract_months || 0)} /></label><label>Planned leave months<input type="number" min="0" max="24" step="0.1" name="plannedLeaveMonths" defaultValue={Number(snapshot.planned_leave_months || 0)} /></label><label>Family support / month<input type="number" min="0" step="0.01" name="monthlyFamilySupport" defaultValue={Number(snapshot.monthly_family_support || 0)} /></label><label>Emergency fund<input type="number" min="0" step="0.01" name="emergencyFund" defaultValue={Number(snapshot.emergency_fund || 0)} /></label><label>Total savings<input type="number" min="0" step="0.01" name="savingsTotal" defaultValue={savings} /></label><label>Investments tracked<input type="number" min="0" step="0.01" name="investmentTotal" defaultValue={investments} /></label><label>Debt total<input type="number" min="0" step="0.01" name="debtTotal" defaultValue={debt} /></label><label>Currency<input name="currency" maxLength={3} defaultValue={currency} /></label><button className="primaryButton" type="submit">Save private snapshot</button></form>}</section>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">GOAL VAULTS</span><h2>Your money has a job</h2></div></div><form className="supportForm" onSubmit={addGoal}><label>Goal name<input name="name" maxLength={120} placeholder="Emergency fund, Home, Business…" required /></label><label>Goal type<input name="goalType" maxLength={80} defaultValue="savings" /></label><label>Target amount<input type="number" min="1" step="0.01" name="targetAmount" required /></label><label>Currency<input name="currency" maxLength={3} defaultValue={currency} /></label><label>Target date<input type="date" name="targetDate" /></label><button className="primaryButton" type="submit">+ New goal</button></form><div className="vaultGrid">{goals.map(goal => { const current = Number(goal.current_amount); const target = Number(goal.target_amount); const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0; return <div className="vault" key={goal.id}><div className="vaultIcon">◈</div><b>{goal.name}</b><strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:goal.currency,maximumFractionDigits:0}).format(current)}</strong><span>of {new Intl.NumberFormat('en-US',{style:'currency',currency:goal.currency,maximumFractionDigits:0}).format(target)}</span><div className="progress"><span style={{width:`${pct}%`}} /></div><small>{pct}% funded</small><label>Update saved amount<input type="number" min="0" step="0.01" defaultValue={current} onBlur={e => { if (Number(e.target.value) !== current) void updateGoal(goal, e.target.value); }} /></label></div>; })}</div>{loaded && !goals.length && <p>No savings goals yet. Create your first goal above.</p>}</section>
    <p className="disclaimer">CrewWealth is a planning and education workspace. It does not hold customer funds or provide personalized investment advice.</p>
  </AppShell>;
}
