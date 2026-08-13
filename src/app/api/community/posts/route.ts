import { requireMember } from '@/lib/member';

export async function GET(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const communityId = new URL(request.url).searchParams.get('communityId');

  const rows = communityId
    ? await member.sql`select po.id, po.author_id, po.body, po.created_at, c.name as community_name,
        p.display_name, p.avatar_url, p.verification, cp.current_position,
        (select count(*)::int from comments co where co.post_id = po.id and co.status = 'published') as comment_count,
        (select count(*)::int from post_reactions pr where pr.post_id = po.id) as reaction_count,
        (select pr.reaction from post_reactions pr where pr.post_id = po.id and pr.user_id = ${member.user.id}) as viewer_reaction,
        exists(select 1 from saved_posts sp where sp.post_id = po.id and sp.user_id = ${member.user.id}) as saved
      from posts po
      join communities c on c.id = po.community_id
      join profiles p on p.id = po.author_id
      left join crew_profiles cp on cp.user_id = po.author_id
      join community_members viewer on viewer.community_id = po.community_id and viewer.user_id = ${member.user.id}
      where po.community_id = ${communityId} and po.status = 'published'
      order by po.created_at desc limit 50`
    : await member.sql`select po.id, po.author_id, po.body, po.created_at, c.name as community_name,
        p.display_name, p.avatar_url, p.verification, cp.current_position,
        (select count(*)::int from comments co where co.post_id = po.id and co.status = 'published') as comment_count,
        (select count(*)::int from post_reactions pr where pr.post_id = po.id) as reaction_count,
        (select pr.reaction from post_reactions pr where pr.post_id = po.id and pr.user_id = ${member.user.id}) as viewer_reaction,
        exists(select 1 from saved_posts sp where sp.post_id = po.id and sp.user_id = ${member.user.id}) as saved
      from posts po
      join communities c on c.id = po.community_id
      join profiles p on p.id = po.author_id
      left join crew_profiles cp on cp.user_id = po.author_id
      join community_members viewer on viewer.community_id = po.community_id and viewer.user_id = ${member.user.id}
      where po.status = 'published'
      order by po.created_at desc limit 50`;
  return Response.json({ posts: rows });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const communityId = typeof input.communityId === 'string' ? input.communityId : '';
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  if (!communityId || body.length < 1 || body.length > 10000) {
    return Response.json({ error: 'Valid communityId and post body are required.' }, { status: 400 });
  }
  const rows = await member.sql`insert into posts (community_id, author_id, body)
    select ${communityId}, ${member.user.id}, ${body}
    where exists (select 1 from community_members where community_id = ${communityId} and user_id = ${member.user.id})
    returning id, body, created_at`;
  if (!rows.length) return Response.json({ error: 'Join this community before posting.' }, { status: 403 });
  return Response.json({ post: rows[0] }, { status: 201 });
}
