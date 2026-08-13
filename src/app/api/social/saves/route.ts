import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rows = await member.sql`select po.id,po.author_id,po.body,po.created_at,c.name as community_name,p.display_name,p.avatar_url,p.verification,
      (select count(*)::int from post_reactions r where r.post_id=po.id) reaction_count,
      (select count(*)::int from comments co where co.post_id=po.id and co.status='published') comment_count,
      true as saved,
      (select reaction from post_reactions r where r.post_id=po.id and r.user_id=${member.user.id}) as my_reaction
    from saved_posts s
    join posts po on po.id=s.post_id and po.status='published'
    join communities c on c.id=po.community_id
    join profiles p on p.id=po.author_id
    join community_members cm on cm.community_id=po.community_id and cm.user_id=${member.user.id}
    where s.user_id=${member.user.id}
    order by s.created_at desc limit 100`;
  return Response.json({ posts: rows });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const postId = typeof input.postId === 'string' ? input.postId : '';
  if (!postId) return Response.json({ error: 'postId required' }, { status: 400 });
  const accessible = await member.sql`select 1 from posts po where po.id=${postId} and po.status='published'
    and exists(select 1 from community_members cm where cm.community_id=po.community_id and cm.user_id=${member.user.id})`;
  if (!accessible.length) return Response.json({ error: 'Post unavailable.' }, { status: 403 });
  const existing = await member.sql`select 1 from saved_posts where post_id=${postId} and user_id=${member.user.id}`;
  if (existing.length) {
    await member.sql`delete from saved_posts where post_id=${postId} and user_id=${member.user.id}`;
    return Response.json({ saved: false });
  }
  await member.sql`insert into saved_posts(post_id,user_id) values (${postId},${member.user.id}) on conflict do nothing`;
  return Response.json({ saved: true });
}
