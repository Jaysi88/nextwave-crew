import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import OceanMotionLayer from '@/components/OceanMotionLayer';
import './globals.css';
import './ocean.css';
import './motion.css';
import './pearl.css';
import './pearl-extras.css';
import './pearl-overrides.css';
import './social.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://crew.nextwavefusion.com'),
  title: 'NextWave Crew | Work at sea. Build life on shore.',
  description: 'Membership, community, career and financial wellbeing for the global maritime workforce.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Script defer data-domain="crew.nextwavefusion.com" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        <OceanMotionLayer />
        <header className="topbar">
          <Link className="brand" href="/"><span className="brandMark">NW</span><span>NextWave <b>Crew</b></span></Link>
          <nav className="navLinks" aria-label="Main navigation">
            <Link href="/community">Community</Link><Link href="/members">Members</Link><Link href="/career">Career</Link><Link href="/wealth">CrewWealth</Link><Link href="/membership">Membership</Link>
          </nav>
          <div className="navActions"><Link className="ghostButton" href="/auth/sign-in">Sign in</Link><Link className="primaryButton small" href="/dashboard">Open dashboard</Link></div>
        </header>
        {children}
      </body>
    </html>
  );
}
