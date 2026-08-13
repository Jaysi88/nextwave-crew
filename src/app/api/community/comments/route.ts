import { requireMember } from '@/lib/member';

export async function GET(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const postId = new URL(request.url).searchParams.get('postId');
  if (!postId) return Response.json({ error: 'postId is required.' }, { status: 400 });
  const rows = await member.sql`select co.id, co.body, co.created_at, p.display_name, p.avatar_url
    from comments co join profiles p on p.id = co.author_id
    join posts po on po.id = co.post_id
    join community_members cm on cm.community_id = po.community_id and cm.user_id = ${member.user.id}
    where co.post_id = ${postId} and co.status = 'published'
    order by co.created_at asc limit 200`;
  return Response.json({ comments: rows });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const postId = typeof input.postId === 'string' ? input.postId : '';
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  if (!postId || body.length < 1 || body.length > 5000) return Response.json({ error: 'Valid postId and comment body are required.' }, { status: 400 });
  const rows = await member.sql`insert into comments (post_id, author_id, body)
    select po.id, ${member.user.id}, ${body} from posts po
    where po.id = ${postId} and po.status = 'published'
      and exists(select 1 from community_members cm where cm.community_id = po.community_id and cm.user_id = ${member.user.id})
    returning id, body, created_at`;
  if (!rows.length) return Response.json({ error: 'Join the community before commenting.' }, { status: 403 });
  return Response.json({ comment: rows[0] }, { status: 201 });
}
