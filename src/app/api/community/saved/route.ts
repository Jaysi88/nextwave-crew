import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rows = await member.sql`select po.id, po.body, po.created_at, c.name as community_name,
      p.id as author_id, p.display_name, p.avatar_url, p.verification,
      (select count(*)::int from comments co where co.post_id = po.id and co.status = 'published') as comment_count,
      (select count(*)::int from post_reactions pr where pr.post_id = po.id) as reaction_count
    from saved_posts sp
    join posts po on po.id = sp.post_id and po.status = 'published'
    join communities c on c.id = po.community_id
    join community_members cm on cm.community_id = po.community_id and cm.user_id = ${member.user.id}
    join profiles p on p.id = po.author_id
    where sp.user_id = ${member.user.id}
    order by sp.created_at desc limit 100`;
  return Response.json({ posts: rows });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const postId = typeof input.postId === 'string' ? input.postId : '';
  if (!postId) return Response.json({ error: 'postId is required.' }, { status: 400 });

  const available = await member.sql`select po.id from posts po
    join community_members cm on cm.community_id = po.community_id and cm.user_id = ${member.user.id}
    where po.id = ${postId} and po.status = 'published' limit 1`;
  if (!available.length) return Response.json({ error: 'Post is not available in your communities.' }, { status: 404 });

  const existing = await member.sql`select post_id from saved_posts where post_id = ${postId} and user_id = ${member.user.id}`;
  if (existing.length) {
    await member.sql`delete from saved_posts where post_id = ${postId} and user_id = ${member.user.id}`;
    return Response.json({ saved: false });
  }
  await member.sql`insert into saved_posts (post_id, user_id) values (${postId}, ${member.user.id}) on conflict do nothing`;
  return Response.json({ saved: true });
}
