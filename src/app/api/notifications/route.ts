import { requireMember } from '@/lib/member';

export async function GET(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const raw = Number(new URL(request.url).searchParams.get('limit') || 60);
  const limit = Number.isFinite(raw) ? Math.max(1, Math.min(100, Math.trunc(raw))) : 60;
  const rows = await member.sql`select id,type,title,body,action_url,read_at,created_at from notifications
    where user_id=${member.user.id} order by created_at desc limit ${limit}`;
  const counts = await member.sql`select count(*)::int as count from notifications where user_id=${member.user.id} and read_at is null`;
  const unread = Number(counts[0]?.count || 0);
  return Response.json({ notifications: rows, unread, unreadCount: unread });
}

export async function PATCH(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  if (input.all === true) await member.sql`update notifications set read_at=coalesce(read_at,now()) where user_id=${member.user.id}`;
  else if (typeof input.id === 'string') await member.sql`update notifications set read_at=coalesce(read_at,now()) where id=${input.id} and user_id=${member.user.id}`;
  else return Response.json({ error: 'Notification id required.' }, { status: 400 });
  return Response.json({ ok: true });
}
