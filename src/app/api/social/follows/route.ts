import { requireMember } from '@/lib/member';

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;

  const input = await request.json().catch(() => ({}));
  const targetUserId = typeof input.targetUserId === 'string' ? input.targetUserId.trim() : '';
  const action = input.action === 'unfollow' ? 'unfollow' : 'follow';
  if (!targetUserId || targetUserId === member.user.id) {
    return Response.json({ error: 'Choose another visible member.' }, { status: 400 });
  }

  const target = await member.sql`select id from profiles where id = ${targetUserId} and visibility in ('members','public') limit 1`;
  if (!target.length) return Response.json({ error: 'Member is not available.' }, { status: 404 });

  if (action === 'unfollow') {
    await member.sql`delete from member_follows where follower_id = ${member.user.id} and following_id = ${targetUserId}`;
    return Response.json({ following: false });
  }

  const inserted = await member.sql`insert into member_follows (follower_id, following_id)
    values (${member.user.id}, ${targetUserId}) on conflict do nothing returning following_id`;

  if (inserted.length) {
    await member.sql`insert into notifications (user_id, type, title, body, action_url)
      select ${targetUserId}, 'new_follower', 'New crew connection', p.display_name || ' started following your voyage.', '/members/' || p.id
      from profiles p where p.id = ${member.user.id}`;
  }

  return Response.json({ following: true });
}
