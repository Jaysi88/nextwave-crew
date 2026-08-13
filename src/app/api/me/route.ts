import { awardPointsOnce, requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rows = await member.sql`select p.id, p.email, p.display_name, p.avatar_url, p.nationality, p.country_of_residence,
      p.preferred_language, p.verification, cp.department, cp.current_position, cp.ship_segment, cp.years_at_sea,
      cp.available_from, cp.career_summary, cp.profile_score, cp.open_to_work,
      m.plan as membership_plan, m.status as membership_status,
      ra.points_balance, ra.lifetime_earned
    from profiles p
    join crew_profiles cp on cp.user_id = p.id
    left join lateral (select plan, status from memberships where user_id = p.id order by created_at desc limit 1) m on true
    left join reward_accounts ra on ra.user_id = p.id
    where p.id = ${member.user.id}`;
  return Response.json({ member: rows[0] ?? null });
}

export async function PUT(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const body = await request.json().catch(() => ({}));
  const clean = (value: unknown, max = 200) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
  const displayName = clean(body.displayName, 100);
  const nationality = clean(body.nationality, 80);
  const country = clean(body.countryOfResidence, 80);
  const department = clean(body.department, 80);
  const currentPosition = clean(body.currentPosition, 120);
  const shipSegment = clean(body.shipSegment, 80);
  const careerSummary = clean(body.careerSummary, 1200);
  const openToWork = typeof body.openToWork === 'boolean' ? body.openToWork : null;

  await member.sql`update profiles set
      display_name = coalesce(${displayName}, display_name), nationality = coalesce(${nationality}, nationality),
      country_of_residence = coalesce(${country}, country_of_residence), updated_at = now()
    where id = ${member.user.id}`;
  await member.sql`update crew_profiles set
      department = coalesce(${department}, department), current_position = coalesce(${currentPosition}, current_position),
      ship_segment = coalesce(${shipSegment}, ship_segment), career_summary = coalesce(${careerSummary}, career_summary),
      open_to_work = coalesce(${openToWork}, open_to_work), updated_at = now()
    where user_id = ${member.user.id}`;

  const completion = await member.sql`select p.display_name, p.nationality, cp.department, cp.current_position
    from profiles p join crew_profiles cp on cp.user_id = p.id where p.id = ${member.user.id}`;
  const row = completion[0] as Record<string, unknown> | undefined;
  if (row?.display_name && row?.nationality && row?.department && row?.current_position) {
    await awardPointsOnce(member.user.id, 100, 'PROFILE_COMPLETE', 'onboarding-profile-v1');
  }
  return Response.json({ ok: true });
}
