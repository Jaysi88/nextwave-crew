import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember(); if (!member.ok) return member.response;
  const userId = member.user.id;
  const [profile, voyage, wealth, jobs, communities, documents] = await Promise.all([
    member.sql`select p.display_name,p.verification,cp.current_position,cp.department,cp.profile_score,ra.points_balance,
      m.plan as membership_plan from profiles p join crew_profiles cp on cp.user_id=p.id
      left join reward_accounts ra on ra.user_id=p.id
      left join lateral (select plan from memberships where user_id=p.id and status in ('trial','active') order by created_at desc limit 1) m on true
      where p.id=${userId}`,
    member.sql`select company_name_snapshot,vessel_name_snapshot,position_title,started_on,ended_on
      from sea_service where user_id=${userId} order by started_on desc limit 1`,
    member.sql`select monthly_ship_income,contract_months,planned_leave_months,emergency_fund,savings_total,investment_total,debt_total,currency
      from financial_snapshots where user_id=${userId} order by snapshot_date desc limit 1`,
    member.sql`select j.id,j.title,j.region,j.department,co.name as company_name
      from jobs j left join companies co on co.id=j.company_id
      where j.status='published' and (j.closes_at is null or j.closes_at>now())
      order by (j.department=(select department from crew_profiles where user_id=${userId})) desc,j.published_at desc nulls last limit 3`,
    member.sql`select c.id,c.name,count(p.id)::int as post_count from community_members cm join communities c on c.id=cm.community_id
      left join posts p on p.community_id=c.id and p.created_at>now()-interval '30 days'
      where cm.user_id=${userId} group by c.id,c.name order by post_count desc,c.name limit 3`,
    member.sql`select count(*)::int as total,count(*) filter (where verification='verified')::int as verified,
      count(*) filter (where expires_on is not null and expires_on<current_date+interval '90 days')::int as expiring
      from certificates where user_id=${userId}`,
  ]);
  return Response.json({ profile: profile[0], voyage: voyage[0] ?? null, wealth: wealth[0] ?? null, jobs, communities, documents: documents[0] });
}
