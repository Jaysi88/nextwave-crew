import { requireMember } from '@/lib/member';

export async function GET(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  const department = (url.searchParams.get('department') || '').trim().slice(0, 80);
  const vesselType = (url.searchParams.get('vesselType') || '').trim().slice(0, 80);
  const pattern = `%${q}%`;
  const rows = await member.sql`select j.id, j.title, j.department, j.vessel_type, j.region, j.description,
      j.salary_min, j.salary_max, j.salary_currency, j.contract_months, j.published_at, j.closes_at,
      co.name as company_name, co.verification as company_verification, a.status as application_status
    from jobs j
    left join companies co on co.id = j.company_id
    left join applications a on a.job_id = j.id and a.user_id = ${member.user.id}
    where j.status = 'published' and (j.published_at is null or j.published_at <= now())
      and (j.closes_at is null or j.closes_at > now())
      and (${department} = '' or j.department = ${department})
      and (${vesselType} = '' or j.vessel_type = ${vesselType})
      and (${q} = '' or j.title ilike ${pattern} or j.description ilike ${pattern} or co.name ilike ${pattern})
    order by j.published_at desc nulls last, j.created_at desc limit 100`;
  return Response.json({ jobs: rows });
}
