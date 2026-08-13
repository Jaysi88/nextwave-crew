import { requireMember } from '@/lib/member';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const { id } = await context.params;
  if (!id) return Response.json({ error: 'Member id is required.' }, { status: 400 });

  const rows = await member.sql`select p.id, p.display_name, p.avatar_url, p.cover_url, p.nationality, p.country_of_residence,
      p.verification, cp.department, cp.current_position, cp.ship_segment, cp.years_at_sea, cp.career_summary,
      cp.open_to_work, cp.open_to_mentor, cp.looking_for_mentor,
      (select count(*)::int from member_follows mf where mf.following_id = p.id) as follower_count,
      (select count(*)::int from member_follows mf where mf.follower_id = p.id) as following_count,
      (select count(*)::int from posts po where po.author_id = p.id and po.status = 'published') as post_count,
      exists(select 1 from member_follows mf where mf.follower_id = ${member.user.id} and mf.following_id = p.id) as is_following
    from profiles p join crew_profiles cp on cp.user_id = p.id
    where p.id = ${id} and (p.id = ${member.user.id} or p.visibility in ('members','public')) limit 1`;
  if (!rows.length) return Response.json({ error: 'Member is not available.' }, { status: 404 });

  const recentPosts = await member.sql`select po.id, po.body, po.created_at, c.name as community_name,
      (select count(*)::int from comments co where co.post_id = po.id and co.status = 'published') as comment_count,
      (select count(*)::int from post_reactions pr where pr.post_id = po.id) as reaction_count
    from posts po
    join communities c on c.id = po.community_id
    join community_members viewer on viewer.community_id = po.community_id and viewer.user_id = ${member.user.id}
    where po.author_id = ${id} and po.status = 'published'
    order by po.created_at desc limit 12`;

  return Response.json({ member: rows[0], recentPosts });
}
