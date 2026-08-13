import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rows = await member.sql`select c.id, c.slug, c.name, c.description, c.community_type, c.department, c.vessel_type,
      count(cm_all.user_id)::int as member_count,
      exists(select 1 from community_members mine where mine.community_id = c.id and mine.user_id = ${member.user.id}) as joined
    from communities c
    left join community_members cm_all on cm_all.community_id = c.id
    where c.status = 'active'
    group by c.id
    order by c.name`;
  return Response.json({ communities: rows });
}
