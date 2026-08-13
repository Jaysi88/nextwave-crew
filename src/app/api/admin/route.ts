import { requireStaff } from '@/lib/member';

const roles = ['member','moderator','verification_officer','recruiter','admin'];

export async function GET(){
  const staff=await requireStaff(); if(!staff.ok)return staff.response;
  const[members,documents,jobs,requests,reports]=await Promise.all([
    staff.sql`select id,email,display_name,platform_role,account_status,verification,created_at from profiles order by created_at desc limit 100`,
    staff.sql`select c.id,c.user_id,c.certificate_name,c.certificate_type,c.verification,c.expires_on,p.display_name,p.email from certificates c join profiles p on p.id=c.user_id where c.verification='pending' order by c.created_at`,
    staff.sql`select j.id,j.title,j.status,j.department,j.created_at,co.name as company_name from jobs j left join companies co on co.id=j.company_id order by j.created_at desc limit 100`,
    staff.sql`select r.id,r.requested_plan,r.billing_cycle,r.status,r.created_at,p.display_name,p.email from membership_change_requests r join profiles p on p.id=r.user_id where r.status='pending' order by r.created_at`,
    staff.sql`select id,target_type,target_id,reason,status,created_at from moderation_cases where status in ('open','reviewing') order by created_at`,
  ]);
  return Response.json({members,documents,jobs,requests,reports});
}

export async function PATCH(request:Request){
  const staff=await requireStaff(['admin','owner','verification_officer','moderator']); if(!staff.ok)return staff.response;
  const body=await request.json().catch(()=>({})); const action=typeof body.action==='string'?body.action:''; const id=typeof body.id==='string'?body.id:'';
  if(!id)return Response.json({error:'id is required.'},{status:400}); let result:unknown[]=[];
  if(action==='member-role'){
    if(!['admin','owner'].includes(staff.platformRole)||!roles.includes(body.value))return Response.json({error:'Owner/admin access is required.'},{status:403});
    result=await staff.sql`update profiles set platform_role=${body.value},updated_at=now() where id=${id} and platform_role<>'owner' returning id`;
  }else if(action==='member-status'){
    if(!['admin','owner'].includes(staff.platformRole)||!['active','suspended'].includes(body.value))return Response.json({error:'Owner/admin access is required.'},{status:403});
    result=await staff.sql`update profiles set account_status=${body.value},updated_at=now() where id=${id} and platform_role<>'owner' returning id`;
  }else if(action==='document-verification'){
    if(!['verification_officer','admin','owner'].includes(staff.platformRole)||!['verified','rejected','pending'].includes(body.value))return Response.json({error:'Verification access is required.'},{status:403});
    result=await staff.sql`update certificates set verification=${body.value},updated_at=now() where id=${id} returning id`;
  }else if(action==='membership-request'){
    if(!['admin','owner'].includes(staff.platformRole)||!['approved','declined'].includes(body.value))return Response.json({error:'Owner/admin access is required.'},{status:403});
    const requestRows=await staff.sql`update membership_change_requests set status=${body.value},reviewed_by=${staff.user.id},review_note=${typeof body.note==='string'?body.note.slice(0,500):null},reviewed_at=now() where id=${id} and status='pending' returning user_id,requested_plan`;
    if(requestRows.length&&body.value==='approved'){
      await staff.sql`update memberships set status='cancelled',updated_at=now() where user_id=${requestRows[0].user_id} and status in ('trial','active','past_due','paused')`;
      await staff.sql`insert into memberships (user_id,plan,status,provider) values (${requestRows[0].user_id},${requestRows[0].requested_plan},'active','manual')`;
    }
    result=requestRows;
  }else return Response.json({error:'Unsupported admin action.'},{status:400});
  if(!result.length)return Response.json({error:'No matching record was updated.'},{status:404});
  await staff.sql`insert into audit_logs(actor_user_id,action,entity_type,entity_id,changes) values(${staff.user.id},${action},'admin_record',${id},${JSON.stringify({value:body.value})}::jsonb)`;
  return Response.json({ok:true});
}
