import { requireMember } from '@/lib/member';

export async function GET(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  const department = (url.searchParams.get('department') || '').trim().slice(0, 80);
  const pattern = `%${q}%`;
  const rows = await member.sql`select p.id, p.display_name, p.avatar_url, p.nationality, p.country_of_residence, p.verification,
      cp.department, cp.current_position, cp.ship_segment, cp.years_at_sea, cp.career_summary, cp.open_to_work
    from profiles p join crew_profiles cp on cp.user_id = p.id
    where p.id <> ${member.user.id}
      and p.visibility in ('members','public')
      and (${department} = '' or cp.department = ${department})
      and (${q} = '' or p.display_name ilike ${pattern} or cp.current_position ilike ${pattern} or cp.department ilike ${pattern})
    order by p.verification = 'verified' desc, cp.open_to_work desc, p.display_name asc
    limit 100`;
  return Response.json({ members: rows });
}
