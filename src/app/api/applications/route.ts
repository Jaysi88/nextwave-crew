import { requireMember } from '@/lib/member';

export async function GET() {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const rows = await member.sql`select a.id, a.status, a.applied_at, a.updated_at, j.id as job_id, j.title, j.department, j.vessel_type, co.name as company_name
    from applications a join jobs j on j.id = a.job_id left join companies co on co.id = j.company_id
    where a.user_id = ${member.user.id} order by a.updated_at desc`;
  return Response.json({ applications: rows });
}

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const jobId = typeof input.jobId === 'string' ? input.jobId : '';
  if (!jobId) return Response.json({ error: 'jobId is required.' }, { status: 400 });
  const openJob = await member.sql`select id from jobs where id = ${jobId} and status = 'published' and (closes_at is null or closes_at > now())`;
  if (!openJob.length) return Response.json({ error: 'This vacancy is not open.' }, { status: 404 });
  const rows = await member.sql`insert into applications (job_id, user_id, status, applied_at)
    values (${jobId}, ${member.user.id}, 'applied', now())
    on conflict (job_id, user_id) do update set status = 'applied', applied_at = now(), updated_at = now()
      where applications.status in ('saved','withdrawn')
    returning id, status, applied_at`;
  if (!rows.length) return Response.json({ error: 'You already have an active or completed application for this vacancy.' }, { status: 409 });
  return Response.json({ application: rows[0] }, { status: 201 });
}

export async function DELETE(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const input = await request.json().catch(() => ({}));
  const jobId = typeof input.jobId === 'string' ? input.jobId : '';
  if (!jobId) return Response.json({ error: 'jobId is required.' }, { status: 400 });
  const rows = await member.sql`update applications set status = 'withdrawn', updated_at = now()
    where job_id = ${jobId} and user_id = ${member.user.id} and status in ('applied','screening','interview','offer')
    returning id, status`;
  if (!rows.length) return Response.json({ error: 'This application cannot be withdrawn.' }, { status: 409 });
  return Response.json({ application: rows[0] });
}
