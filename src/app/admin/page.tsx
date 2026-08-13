import AppShell from '@/components/AppShell';
import { requireAdminPage } from '@/lib/admin';
import AdminConsole from '@/components/AdminConsole';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { sql, role } = await requireAdminPage();
  const [members, paid, communities, verificationQueue, reports] = await Promise.all([
    sql`select count(*)::int as total from profiles`,
    sql`select count(distinct user_id)::int as total from memberships where status in ('trial','active') and plan <> 'free'`,
    sql`select count(*)::int as total from communities where status = 'active'`,
    sql`select count(*)::int as total from profiles where verification = 'pending'`,
    sql`select count(*)::int as total from moderation_cases where status in ('open','reviewing')`,
  ]);

  return <AppShell title="Platform Administration" kicker="OWNER CONTROL CENTER">
    <div className="demoBanner">Secure production console · Signed in with {role} access</div>
    <div className="adminMetrics">
      <div><span>Members</span><b>{members[0]?.total ?? 0}</b><small>Registered profiles</small></div>
      <div><span>Paid members</span><b>{paid[0]?.total ?? 0}</b><small>Active paid plans</small></div>
      <div><span>Communities</span><b>{communities[0]?.total ?? 0}</b><small>Active spaces</small></div>
      <div><span>Verification queue</span><b>{verificationQueue[0]?.total ?? 0}</b><small>Awaiting review</small></div>
    </div>
    <div className="twoCol">
      <section className="panel"><span className="microLabel">OPERATIONS</span><h2>Admin queues</h2><div className="miniList"><div><span>Profile verification</span><b>{verificationQueue[0]?.total ?? 0}</b></div><div><span>Community reports</span><b>{reports[0]?.total ?? 0}</b></div></div></section>
      <section className="panel"><span className="microLabel">SECURITY</span><h2>System posture</h2><div className="checkList"><p>✓ Server-side owner/admin authorization</p><p>✓ Isolated Neon production database</p><p>✓ Sensitive fields remain private</p><p>✓ Secrets are stored outside Git</p></div></section>
    </div>
    <AdminConsole />
  </AppShell>;
}
