'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type IconName = 'overview' | 'id' | 'members' | 'community' | 'career' | 'wealth' | 'wallet' | 'membership' | 'support' | 'admin';

const links: Array<{ label: string; href: string; icon: IconName }> = [
  { label: 'Overview', href: '/dashboard', icon: 'overview' },
  { label: 'CrewID', href: '/crew-id', icon: 'id' },
  { label: 'Members', href: '/members', icon: 'members' },
  { label: 'Community', href: '/community', icon: 'community' },
  { label: 'Career', href: '/career', icon: 'career' },
  { label: 'CrewWealth', href: '/wealth', icon: 'wealth' },
  { label: 'Crew Wallet', href: '/wallet', icon: 'wallet' },
  { label: 'Membership', href: '/membership', icon: 'membership' },
  { label: 'Support', href: '/support', icon: 'support' },
  { label: 'Admin', href: '/admin', icon: 'admin' },
];

const mobileLinks = links.filter(link => ['/dashboard', '/community', '/career', '/wallet', '/crew-id'].includes(link.href));

function SeaIcon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes: Record<IconName, React.ReactNode> = {
    overview: <><path {...common} d="M4 13h6V4H4zM14 20h6V11h-6zM4 20h6v-4H4zM14 8h6V4h-6z" /></>,
    id: <><rect {...common} x="3" y="5" width="18" height="14" rx="3" /><circle {...common} cx="8" cy="11" r="2" /><path {...common} d="M6 16c.7-1.4 3.3-1.4 4 0M13 10h5M13 14h4" /></>,
    members: <><path {...common} d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle {...common} cx="9.5" cy="7" r="3.5" /><path {...common} d="M17 11a3 3 0 1 0-1.4-5.6M18 14.5a4 4 0 0 1 3 3.9V20" /></>,
    community: <><path {...common} d="M4 5h16v11H9l-5 4z" /><path {...common} d="M8 9h8M8 12h5" /></>,
    career: <><rect {...common} x="3" y="7" width="18" height="12" rx="2" /><path {...common} d="M8 7V5h8v2M3 11h18M10 11v2h4v-2" /></>,
    wealth: <><path {...common} d="M4 19V9M10 19V5M16 19v-7M22 19H2" /><path {...common} d="m4 8 6-4 6 7 5-5" /></>,
    wallet: <><path {...common} d="M4 6h14a2 2 0 0 1 2 2v10H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h11" /><path {...common} d="M15 11h7v4h-7a2 2 0 1 1 0-4z" /></>,
    membership: <><path {...common} d="m12 3 2.5 3.2 4-.2-.2 4L21 13l-2.7 3 .2 4-4-.2L12 23l-2.5-3.2-4 .2.2-4L3 13l2.7-3-.2-4 4 .2z" /><path {...common} d="m9 13 2 2 4-5" /></>,
    support: <><path {...common} d="M4 5h16v14H4z" /><path {...common} d="m4 7 8 6 8-6" /><path {...common} d="M8 4V2M16 4V2" /></>,
    admin: <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1z" /></>,
  };
  return <span className="navIcon" aria-hidden="true"><svg viewBox="0 0 24 24">{shapes[name]}</svg></span>;
}

function UtilityIcon({ type }: { type: 'search' | 'community' | 'wallet' }) {
  if (type === 'search') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor"/><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeLinecap="round"/></svg>;
  if (type === 'wallet') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h14a2 2 0 0 1 2 2v10H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12h7v4h-7a2 2 0 1 1 0-4Z" fill="none" stroke="currentColor"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4Z" fill="none" stroke="currentColor" strokeLinejoin="round"/><path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" strokeLinecap="round"/></svg>;
}

export default function AppShell({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));

  return (
    <main className="appPage">
      <aside className="sidebar">
        <div className="sideBrand"><span className="brandMark">NW</span><div><b>NextWave Crew</b><small>Member OS · At sea</small></div></div>
        <nav aria-label="Member navigation">
          {links.map(({ label, href, icon }) => {
            const active = isActive(href);
            return <Link key={href} href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}><SeaIcon name={icon} /><span>{label}</span></Link>;
          })}
        </nav>
        <div className="sideBottom"><span className="avatar">NW</span><div><b>Member deck</b><small>Signal connected</small></div></div>
      </aside>

      <section className="appContent">
        <div className="appUtilityBar" aria-label="Quick actions">
          <Link className="appUtilitySearch" href="/members"><UtilityIcon type="search" /><span>Search crew, roles and communities</span></Link>
          <Link className="appUtilityIcon" href="/community" aria-label="Open community"><UtilityIcon type="community" /></Link>
          <Link className="appUtilityIcon" href="/wallet" aria-label="Open Crew Wallet"><UtilityIcon type="wallet" /></Link>
          <Link className="appUtilityProfile" href="/crew-id"><span className="avatar">NW</span><span>My CrewID</span></Link>
        </div>
        <div className="appHeader">
          <div><span className="microLabel">{kicker}</span><h1>{title}</h1></div>
          <div className="statusPill"><span className="liveDot" /> Member workspace</div>
        </div>
        {children}
      </section>

      <nav className="mobileDock" aria-label="Mobile member navigation">
        {mobileLinks.map(({ label, href, icon }) => {
          const active = isActive(href);
          return <Link key={href} href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}><SeaIcon name={icon} /><span>{label}</span></Link>;
        })}
      </nav>
    </main>
  );
}
