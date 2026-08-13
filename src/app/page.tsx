import Link from 'next/link';

const departments = ['Casino', 'Hotel', 'Deck', 'Engine', 'Culinary', 'Entertainment', 'Retail', 'Spa', 'Medical', 'Security', 'HR', 'Shore-side'];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="heroGlow one"/><div className="heroGlow two"/>
        <div className="eyebrow"><span className="liveDot"/> The professional home for people who work at sea</div>
        <h1>Build your career at sea.<br/><span>Build your life on shore.</span></h1>
        <p className="heroCopy">One membership for professional identity, maritime community, career growth, contract-based saving and long-term financial planning.</p>
        <div className="heroActions"><Link className="primaryButton" href="/dashboard">Explore member dashboard</Link><Link className="ghostButton" href="/membership">View membership</Link></div>
        <div className="trustRow"><span>Passenger ships</span><span>Cargo & offshore</span><span>Every department</span><span>Global membership</span></div>
        <div className="heroPanel">
          <div className="heroPanelTop"><div><span className="microLabel">MEMBER COMMAND CENTER</span><h2>Good evening, Jay</h2><p>Your next contract, career and financial goals in one place.</p></div><div className="scoreRing"><strong>82</strong><span>CrewScore</span></div></div>
          <div className="metricGrid"><div className="metric"><span>Days at sea</span><b>126</b><small>Current contract</small></div><div className="metric"><span>Savings goal</span><b>74%</b><small>On track</small></div><div className="metric"><span>Documents</span><b>3</b><small>Expiring soon</small></div><div className="metric"><span>Career matches</span><b>12</b><small>3 above 90%</small></div></div>
        </div>
      </section>
      <section className="section"><div className="sectionHeading"><span className="microLabel">ONE MARITIME MEMBERSHIP</span><h2>Built around the full seafarer life cycle</h2><p>From the first contract to the day a member chooses to stop sailing.</p></div><div className="featureGrid"><article className="featureCard featured"><span className="featureNumber">01</span><h3>CrewID</h3><p>A living professional record for sea service, qualifications, skills, vessels and verified career history.</p><Link href="/crew-id">View CrewID →</Link></article><article className="featureCard"><span className="featureNumber">02</span><h3>Community</h3><p>Private professional spaces organized by department, vessel type, company, country and career stage.</p><Link href="/community">Enter community →</Link></article><article className="featureCard"><span className="featureNumber">03</span><h3>CrewWealth</h3><p>Plan around contract income, leave periods, family commitments, emergency reserves and long-term goals.</p><Link href="/wealth">Open CrewWealth →</Link></article><article className="featureCard"><span className="featureNumber">04</span><h3>Career</h3><p>Build a maritime CV, track credentials, compare roles and discover opportunities that fit your actual experience.</p><Link href="/career">Explore career →</Link></article></div></section>
      <section className="section departmentSection"><div className="sectionHeading"><span className="microLabel">EVERY DEPARTMENT HAS A HOME</span><h2>One community across the whole ship</h2></div><div className="chipCloud">{departments.map((d)=><span key={d}>{d}</span>)}</div></section>
      <section className="ctaSection"><div><span className="microLabel">FOUNDING MEMBERS</span><h2>Your years at sea should build more than a CV.</h2><p>Join a professional network designed around maritime careers, irregular income and life after the next contract.</p></div><div className="ctaButtons"><Link className="primaryButton" href="/membership">Become a founding member</Link><Link className="ghostButton" href="/support">Buy us a coffee in USDC</Link></div></section>
      <footer className="footer"><div className="brand"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></div><p>Work at sea. Build life on shore.</p><small>© 2026 NextWave Fusion Innovation. Financial tools are educational and planning features until regulated partners are integrated.</small></footer>
    </main>
  );
}
