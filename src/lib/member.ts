import { getAuth } from '@/lib/auth';
import { db, hasDatabase } from '@/lib/db';

export async function requireMember() {
  const auth = getAuth();
  if (!auth) return { ok: false as const, response: Response.json({ error: 'Authentication is not configured.' }, { status: 503 }) };
  if (!hasDatabase()) return { ok: false as const, response: Response.json({ error: 'Database is not configured.' }, { status: 503 }) };

  const { data, error } = await auth.getSession();
  const user = data?.user;
  if (error || !user) return { ok: false as const, response: Response.json({ error: 'Sign in required.' }, { status: 401 }) };

  const sql = db();
  const email = user.email ?? '';
  const displayName = user.name || email.split('@')[0] || 'Crew Member';
  const image = user.image ?? null;

  await sql`insert into profiles (id, email, display_name, avatar_url, last_seen_at)
    values (${user.id}, ${email}, ${displayName}, ${image}, now())
    on conflict (id) do update set email = excluded.email, avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url), last_seen_at = now(), updated_at = now()`;
  const access = await sql`select platform_role, account_status from profiles where id = ${user.id} limit 1`;
  if (access[0]?.account_status !== 'active') return { ok: false as const, response: Response.json({ error: 'This account is not active. Contact support.' }, { status: 403 }) };
  await sql`insert into crew_profiles (user_id) values (${user.id}) on conflict (user_id) do nothing`;
  await sql`insert into memberships (user_id, plan, status)
    select ${user.id}, 'free', 'active'
    where not exists (select 1 from memberships where user_id = ${user.id} and status in ('trial','active','past_due','paused'))`;
  await sql`insert into reward_accounts (user_id) values (${user.id}) on conflict (user_id) do nothing`;

  return { ok: true as const, user, sql, platformRole: String(access[0]?.platform_role || 'member') };
}

export async function requireStaff(roles: string[] = ['moderator','verification_officer','admin','owner']) {
  const member = await requireMember();
  if (!member.ok) return member;
  if (!roles.includes(member.platformRole)) return { ok: false as const, response: Response.json({ error: 'Staff access required.' }, { status: 403 }) };
  return member;
}

export async function awardPointsOnce(userId: string, amount: number, reasonCode: string, referenceId: string) {
  const sql = db();
  await sql`with inserted as (
      insert into reward_transactions (user_id, amount, reason_code, reference_type, reference_id)
      values (${userId}, ${amount}, ${reasonCode}, 'system', ${referenceId})
      on conflict (user_id, reference_type, reference_id) where reference_id is not null do nothing
      returning amount
    )
    update reward_accounts
    set points_balance = points_balance + coalesce((select amount from inserted), 0),
        lifetime_earned = lifetime_earned + coalesce((select amount from inserted), 0),
        updated_at = now()
    where user_id = ${userId}`;
}
