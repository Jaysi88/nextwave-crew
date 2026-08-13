import { requireMember } from '@/lib/member';

export async function GET(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rawLimit = Number(new URL(request.url).searchParams.get('limit') || 50);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.trunc(rawLimit))) : 50;
  const rows = await member.sql`select id, type, title, body, action_url, read_at, created_at
    from notifications where user_id = ${member.user.id} order by created_at desc limit ${limit}`;
  const unread = await member.sql`select count(*)::int as count from notifications where user_id = ${member.user.id} and read_at is null`;
  return Response.json({ notifications: rows, unreadCount: Number(unread[0]?.count || 0) });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  if (input.action === 'mark_all_read') {
    await member.sql`update notifications set read_at = coalesce(read_at, now()) where user_id = ${member.user.id}`;
    return Response.json({ ok: true });
  }
  const id = typeof input.id === 'string' ? input.id : '';
  if (!id) return Response.json({ error: 'Notification id is required.' }, { status: 400 });
  await member.sql`update notifications set read_at = coalesce(read_at, now()) where id = ${id} and user_id = ${member.user.id}`;
  return Response.json({ ok: true });
}
