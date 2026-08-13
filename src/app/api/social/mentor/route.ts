import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const incoming = await member.sql`select mr.id,mr.message,mr.status,mr.created_at,mr.updated_at,
      p.id as member_id,p.display_name,p.avatar_url,p.verification,cp.department,cp.current_position
    from mentor_requests mr
    join profiles p on p.id=mr.requester_id
    left join crew_profiles cp on cp.user_id=p.id
    where mr.mentor_id=${member.user.id}
    order by mr.status='pending' desc,mr.updated_at desc limit 60`;
  const outgoing = await member.sql`select mr.id,mr.message,mr.status,mr.created_at,mr.updated_at,
      p.id as member_id,p.display_name,p.avatar_url,p.verification,cp.department,cp.current_position
    from mentor_requests mr
    join profiles p on p.id=mr.mentor_id
    left join crew_profiles cp on cp.user_id=p.id
    where mr.requester_id=${member.user.id}
    order by mr.status='pending' desc,mr.updated_at desc limit 60`;
  return Response.json({ incoming, outgoing });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const mentorId = typeof input.mentorId === 'string' ? input.mentorId : '';
  const message = typeof input.message === 'string' ? input.message.trim().slice(0, 1000) : '';
  if (!mentorId || mentorId === member.user.id) return Response.json({ error: 'Choose another mentor.' }, { status: 400 });
  const target = await member.sql`select p.display_name from profiles p join crew_profiles cp on cp.user_id=p.id
    where p.id=${mentorId} and p.visibility in ('members','public') and cp.open_to_mentor=true`;
  if (!target.length) return Response.json({ error: 'This member is not accepting mentor requests.' }, { status: 409 });
  await member.sql`insert into mentor_requests(requester_id,mentor_id,message,status)
    values (${member.user.id},${mentorId},${message || null},'pending')
    on conflict(requester_id,mentor_id) do update set message=excluded.message,status='pending',updated_at=now()`;
  await member.sql`insert into notifications(user_id,type,title,body,action_url)
    values (${mentorId},'mentor_request','New mentoring request','A crew member asked to connect with you as a mentor.','/mentoring')`;
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const id = typeof input.id === 'string' ? input.id : '';
  const action = typeof input.action === 'string' ? input.action : '';
  if (!id || !['accept','decline','cancel'].includes(action)) return Response.json({ error: 'Valid request and action required.' }, { status: 400 });

  if (action === 'cancel') {
    const updated = await member.sql`update mentor_requests set status='cancelled',updated_at=now()
      where id=${id} and requester_id=${member.user.id} and status='pending' returning id`;
    if (!updated.length) return Response.json({ error: 'Pending request not found.' }, { status: 404 });
    return Response.json({ ok: true, status: 'cancelled' });
  }

  const status = action === 'accept' ? 'accepted' : 'declined';
  const updated = await member.sql`update mentor_requests set status=${status},updated_at=now()
    where id=${id} and mentor_id=${member.user.id} and status='pending' returning requester_id`;
  if (!updated.length) return Response.json({ error: 'Pending request not found.' }, { status: 404 });
  if (status === 'accepted') {
    await member.sql`insert into notifications(user_id,type,title,body,action_url)
      values (${String(updated[0].requester_id)},'mentor_accepted','Mentor request accepted','A crew mentor accepted your request.','/mentoring')`;
  }
  return Response.json({ ok: true, status });
}
