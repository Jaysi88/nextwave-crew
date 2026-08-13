import AppShell from '@/components/AppShell';
import { communities, member, opportunities, wealth } from '@/lib/demo';

export default function Dashboard() {
  return <AppShell title={`Good evening, ${member.name}`} kicker="MEMBER COMMAND CENTER">
    <div className="demoBanner">Demo workspace · Connect Neon Auth and your production database to replace sample member data.</div>
    <div className="dashboardGrid">
      <section className="panel span2"><div className="panelHead"><div><span className="microLabel">CURRENT CONTRACT</span><h2>{member.role}</h2><p>{member.ship} · {member.country}</p></div><div className="daysBadge"><b>{member.daysAtSea}</b><span>days at sea</span></div></div><div className="progress"><span style={{width:'63%'}}/></div><div className="panelFooter"><span>126 days completed</span><span>74 days estimated remaining</span></div></section>
      <section className="panel wealthMini"><span className="microLabel">CREWWEALTH</span><h2>${wealth.emergencyFund.toLocaleString()}</h2><p>Emergency reserve</p><div className="progress"><span style={{width:`${member.savingsProgress}%`}}/></div><small>{member.savingsProgress}% of current target</small></section>
      <section className="panel"><span className="microLabel">CREWID HEALTH</span><div className="bigScore">82<span>/100</span></div><p>Complete 3 document updates to reach Excellent.</p><button className="textButton">Review CrewID →</button></section>
      <section className="panel span2"><div className="panelHead"><div><span className="microLabel">CAREER RADAR</span><h2>Best matches this week</h2></div><button className="textButton">View all</button></div><div className="opportunityList">{opportunities.map((job)=><div key={job.title} className="opportunity"><div><b>{job.title}</b><span>{job.company} · {job.region}</span></div><strong>{job.match}%</strong></div>)}</div></section>
      <section className="panel"><span className="microLabel">YOUR COMMUNITIES</span><div className="miniList">{communities.slice(0,3).map(c=><div key={c.name}><span>{c.name}</span><b>{c.active} online</b></div>)}</div></section>
      <section className="panel span3"><div className="panelHead"><div><span className="microLabel">THIS CONTRACT</span><h2>Financial flight plan</h2></div><span className="statusPill positive">On track</span></div><div className="moneyGrid"><div><span>Contract income</span><b>${wealth.contractIncome.toLocaleString()}</b></div><div><span>Shore reserve</span><b>${wealth.shoreReserve.toLocaleString()}</b></div><div><span>Emergency fund</span><b>${wealth.emergencyFund.toLocaleString()}</b></div><div><span>Invested</span><b>${wealth.invested.toLocaleString()}</b></div></div></section>
    </div>
  </AppShell>;
}
