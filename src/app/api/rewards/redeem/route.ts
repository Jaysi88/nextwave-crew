import { requireMember } from '@/lib/member';

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const itemId = typeof input.itemId === 'string' ? input.itemId : '';
  if (!itemId) return Response.json({ error: 'itemId is required.' }, { status: 400 });

  const rows = await member.sql`with selected as (
      select id, cost_points from reward_catalog_items where id = ${itemId} and active = true
    ), debited as (
      update reward_accounts ra
      set points_balance = ra.points_balance - selected.cost_points, updated_at = now()
      from selected
      where ra.user_id = ${member.user.id} and ra.points_balance >= selected.cost_points
      returning selected.id as item_id, selected.cost_points
    ), redemption as (
      insert into reward_redemptions (user_id, item_id, cost_points)
      select ${member.user.id}, item_id, cost_points from debited
      returning id, item_id, cost_points, status, created_at
    ), ledger as (
      insert into reward_transactions (user_id, amount, reason_code, reference_type, reference_id)
      select ${member.user.id}, -cost_points, 'REWARD_REDEEMED', 'redemption', id::text from redemption
      returning id
    )
    select * from redemption`;
  if (!rows.length) return Response.json({ error: 'Reward unavailable or SeaPoints balance is too low.' }, { status: 409 });
  return Response.json({ redemption: rows[0] }, { status: 201 });
}
