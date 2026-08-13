import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const account = await member.sql`select points_balance, lifetime_earned, updated_at from reward_accounts where user_id = ${member.user.id}`;
  const history = await member.sql`select amount, reason_code, reference_type, reference_id, created_at
    from reward_transactions where user_id = ${member.user.id} order by created_at desc limit 50`;
  return Response.json({ account: account[0] ?? { points_balance: 0, lifetime_earned: 0 }, history });
}
