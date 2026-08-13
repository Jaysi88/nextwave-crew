import { requireMember } from '@/lib/member';

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const body = await request.json().catch(() => ({}));
  const communityId = typeof body.communityId === 'string' ? body.communityId : '';
  const action = body.action === 'leave' ? 'leave' : 'join';
  if (!communityId) return Response.json({ error: 'communityId is required.' }, { status: 400 });
  const exists = await member.sql`select id from communities where id = ${communityId} and status = 'active'`;
  if (!exists.length) return Response.json({ error: 'Community not found.' }, { status: 404 });
  if (action === 'leave') {
    await member.sql`delete from community_members where community_id = ${communityId} and user_id = ${member.user.id}`;
  } else {
    await member.sql`insert into community_members (community_id, user_id) values (${communityId}, ${member.user.id}) on conflict do nothing`;
  }
  return Response.json({ ok: true, action });
}
