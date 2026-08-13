import { requireMember } from '@/lib/member';

function amount(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000_000 ? parsed : null;
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 120) : '';
  const goalType = typeof input.goalType === 'string' ? input.goalType.trim().slice(0, 80) : 'other';
  const targetAmount = amount(input.targetAmount);
  const currency = typeof input.currency === 'string' && /^[A-Z]{3}$/.test(input.currency) ? input.currency : 'USD';
  const targetDate = typeof input.targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.targetDate) ? input.targetDate : null;
  if (!name || targetAmount === null || targetAmount <= 0) return Response.json({ error: 'Goal name and a positive target amount are required.' }, { status: 400 });
  const rows = await member.sql`insert into savings_goals (user_id, name, goal_type, target_amount, currency, target_date)
    values (${member.user.id}, ${name}, ${goalType}, ${targetAmount}, ${currency}, ${targetDate})
    returning id, name, goal_type, target_amount, current_amount, currency, target_date, status`;
  return Response.json({ goal: rows[0] }, { status: 201 });
}

export async function PATCH(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const id = typeof input.id === 'string' ? input.id : '';
  const currentAmount = amount(input.currentAmount);
  const status = input.status === 'completed' || input.status === 'archived' || input.status === 'active' ? input.status : null;
  if (!id || (currentAmount === null && !status)) return Response.json({ error: 'Goal id and an update are required.' }, { status: 400 });
  const rows = currentAmount !== null
    ? await member.sql`update savings_goals set current_amount = ${currentAmount}, status = coalesce(${status}, status), updated_at = now()
        where id = ${id} and user_id = ${member.user.id} returning id, current_amount, status`
    : await member.sql`update savings_goals set status = ${status}, updated_at = now()
        where id = ${id} and user_id = ${member.user.id} returning id, current_amount, status`;
  if (!rows.length) return Response.json({ error: 'Goal not found.' }, { status: 404 });
  return Response.json({ goal: rows[0] });
}
