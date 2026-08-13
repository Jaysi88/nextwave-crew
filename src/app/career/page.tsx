import AppShell from '@/components/AppShell';
import { opportunities } from '@/lib/demo';

export default function CareerPage() {
  return <AppShell title="Career Center" kicker="CAREER MOBILITY">
    <div className="demoBanner">Opportunity data shown here is demonstration data, not live job postings.</div>
    <div className="careerStats"><div><b>82%</b><span>Profile strength</span></div><div><b>12</b><span>Demo matches</span></div><div><b>4</b><span>Saved roles</span></div><div><b>3</b><span>Documents expiring</span></div></div>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">OPPORTUNITIES</span><h2>Matched to your real sea service</h2></div><button className="ghostButton small">Edit preferences</button></div><div className="jobList">{opportunities.map(j=><article className="jobCard" key={j.title}><div><span className="microLabel">{j.region}</span><h3>{j.title}</h3><p>{j.company}</p><div className="tagRow"><span>Passenger ship</span><span>Management</span><span>Demo listing</span></div></div><div className="matchScore"><b>{j.match}%</b><span>match</span><button className="primaryButton small">View role</button></div></article>)}</div></section>
  </AppShell>;
}
