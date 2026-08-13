import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { db, hasDatabase } from '@/lib/db';

export async function requireAdminPage() {
  const auth = getAuth();
  if (!auth || !hasDatabase()) redirect('/auth/sign-in?next=/admin');

  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user) redirect('/auth/sign-in?next=/admin');

  const sql = db();
  const rows = await sql`select platform_role from profiles where id = ${user.id} limit 1`;
  const role = rows[0]?.platform_role;
  if (role !== 'owner' && role !== 'admin') redirect('/dashboard');

  return { user, sql, role: role as 'owner' | 'admin' };
}
