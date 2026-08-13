import AppShell from '@/components/AppShell';
import { communities } from '@/lib/demo';

export default function CommunityPage() {
  return <AppShell title="Crew Community" kicker="PROFESSIONAL NETWORK">
    <div className="demoBanner">Community preview · Posting and membership mutations activate after authentication and database setup.</div>
    <div className="communityHero"><div><span className="microLabel">GLOBAL CREW ROOM</span><h2>People who understand life at sea.</h2><p>Ask, teach, mentor and connect without mixing professional discussions into public social media.</p></div><button className="primaryButton">Create a post</button></div>
    <div className="communityGrid">{communities.map((c,i)=><article className="communityCard" key={c.name}><div className="communityIcon">{['♠','◫','⚓','⚙'][i]}</div><span className="microLabel">DEPARTMENT COMMUNITY</span><h3>{c.name}</h3><p>{c.members.toLocaleString()} demo members · {c.active} demo active</p><button className="ghostButton small">Open space</button></article>)}</div>
    <section className="panel"><div className="panelHead"><div><span className="microLabel">SAMPLE NETWORK</span><h2>Professional feed</h2></div></div><div className="feedItem"><span className="avatar">AM</span><div><b>Alex M. · Deck Officer</b><p>Has anyone completed the latest ECDIS refresher in Singapore? Looking for a provider recommendation near the port.</p><small>Sample post</small></div></div><div className="feedItem"><span className="avatar">RC</span><div><b>Rina C. · Casino Supervisor</b><p>Sharing my checklist for returning to table games after a long leave period. It helped me get sharp before embarkation.</p><small>Sample post</small></div></div></section>
  </AppShell>;
}
