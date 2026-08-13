import type { Metadata } from 'next';
import Link from 'next/link';
import OceanMotionLayer from '@/components/OceanMotionLayer';
import './globals.css';
import './ocean.css';
import './motion.css';
import './pearl.css';
import './pearl-extras.css';
import './pearl-overrides.css';
import './social.css';

export const metadata: Metadata = {
  title: 'NextWave Crew | Work at sea. Build life on shore.',
  description: 'Membership, community, career and financial wellbeing for the global maritime workforce.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <OceanMotionLayer />
    <header className="topbar">
      <Link className="brand" href="/"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></Link>
      <nav className="navLinks" aria-label="Main navigation"><Link href="/community">Community</Link><Link href="/career">Career</Link><Link href="/wealth">CrewWealth</Link><Link href="/membership">Membership</Link><Link href="/support">Support</Link></nav>
      <div className="navActions"><Link className="ghostButton" href="/auth/sign-in">Sign in</Link><Link className="primaryButton small" href="/dashboard">Open dashboard</Link></div>
    </header>
    {children}
  </body></html>;
}
