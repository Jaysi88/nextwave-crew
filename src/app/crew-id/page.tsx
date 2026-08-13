import AppShell from '@/components/AppShell';

export default function CrewIdPage() {
  return <AppShell title="CrewID" kicker="PROFESSIONAL IDENTITY">
    <div className="demoBanner">Demo CrewID · Production profiles will be private by default and editable after Neon Auth is connected.</div>
    <div className="crewIdCard"><div className="idTop"><div className="profilePhoto">JS</div><div><span className="verified">✓ VERIFIED MEMBER</span><h2>Jay Si Thu Tun</h2><p>Casino Pit Manager · Passenger Ships</p></div><div className="idCode">NW-CRW-00281</div></div><div className="idGrid"><div><span>Sea service</span><b>12+ years</b></div><div><span>Departments</span><b>Casino Operations</b></div><div><span>Languages</span><b>English · Myanmar</b></div><div><span>Profile visibility</span><b>Members only</b></div></div></div>
    <div className="twoCol"><section className="panel"><span className="microLabel">PROFILE COMPLETENESS</span><div className="bigScore">82<span>/100</span></div><div className="checkList"><p>✓ Employment history</p><p>✓ Current role</p><p>✓ Core skills</p><p>! 3 credentials need review</p></div></section><section className="panel"><span className="microLabel">RECENT SEA SERVICE</span><div className="timeline"><div><b>Casino Pit Manager</b><span>Passenger Ship · 2025–Present</span></div><div><b>Pit Boss</b><span>International Cruise · Previous contract</span></div><div><b>Table Games Operations</b><span>Multiple vessels</span></div></div></section></div>
  </AppShell>;
}
