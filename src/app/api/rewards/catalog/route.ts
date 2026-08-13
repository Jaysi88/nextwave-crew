import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rows = await member.sql`select id, code, title, description, cost_points, fulfillment_type
    from reward_catalog_items where active = true order by sort_order, cost_points, title`;
  return Response.json({ items: rows });
}
