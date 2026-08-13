import { db, hasDatabase } from '@/lib/db';

export async function GET(){
  if(!hasDatabase()) return Response.json({source:'demo',members:8426,paidMembers:1784,communities:48});
  const sql=db();
  const [members,paid,communities]=await Promise.all([
    sql`select count(*)::int as count from profiles`,
    sql`select count(*)::int as count from memberships where status = 'active' and plan <> 'free'`,
    sql`select count(*)::int as count from communities where status = 'active'`
  ]);
  return Response.json({source:'neon',members:members[0]?.count??0,paidMembers:paid[0]?.count??0,communities:communities[0]?.count??0});
}
