import Link from 'next/link';

const links = [
  ['Overview', '/dashboard'], ['CrewID', '/crew-id'], ['Community', '/community'], ['Career', '/career'], ['CrewWealth', '/wealth'], ['Membership', '/membership'], ['Support', '/support'], ['Admin', '/admin'],
];

export default function AppShell({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <main className="appPage">
      <aside className="sidebar">
        <div className="sideBrand"><span className="brandMark">NW</span><div><b>NextWave Crew</b><small>Member OS</small></div></div>
        <nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
        <div className="sideBottom"><span className="avatar">JS</span><div><b>Jay</b><small>Founding Member</small></div></div>
      </aside>
      <section className="appContent"><div className="appHeader"><div><span className="microLabel">{kicker}</span><h1>{title}</h1></div><div className="statusPill"><span className="liveDot"/> Demo workspace</div></div>{children}</section>
    </main>
  );
}
