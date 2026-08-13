import AppShell from '@/components/AppShell';
import WealthPlanner from '@/components/WealthPlanner';
import { wealth } from '@/lib/demo';

const vaults = [['Shore Leave',6400,8000,80],['Emergency',11800,15000,79],['Home',7200,50000,14],['Future Business',3600,20000,18]];

export default function WealthPage() {
  return <AppShell title="CrewWealth" kicker="FINANCIAL WELLBEING">
    <div className="demoBanner">The calculator works now. Saved balances below are demonstration data until your Neon database is connected.</div>
    <div className="wealthHero"><div><span className="microLabel">DEMO NET POSITION</span><h2>$37,650</h2><p>Tracked savings and investments across your current goals.</p></div><div className="wealthGauge"><b>{wealth.savingsRate}%</b><span>Savings rate</span></div></div>
    <div className="moneyGrid large"><div><span>Contract income</span><b>${wealth.contractIncome.toLocaleString()}</b><small>Projected total</small></div><div><span>Family allotment</span><b>${wealth.monthlyFamily.toLocaleString()}</b><small>Per month</small></div><div><span>Shore reserve</span><b>${wealth.shoreReserve.toLocaleString()}</b><small>4 months planned</small></div><div><span>Invested</span><b>${wealth.invested.toLocaleString()}</b><small>Tracked assets</small></div></div>
    <WealthPlanner/>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">GOAL VAULTS</span><h2>Your money has a job</h2></div><button className="primaryButton small">+ New goal</button></div><div className="vaultGrid">{vaults.map(([name,current,target,pct])=><div className="vault" key={String(name)}><div className="vaultIcon">◈</div><b>{name}</b><strong>${Number(current).toLocaleString()}</strong><span>of ${Number(target).toLocaleString()}</span><div className="progress"><span style={{width:`${pct}%`}}/></div><small>{pct}% funded</small></div>)}</div></section>
    <p className="disclaimer">CrewWealth is a planning and education workspace. It does not hold customer funds or provide personalized investment advice.</p>
  </AppShell>;
}
