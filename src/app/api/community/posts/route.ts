import { requireMember } from '@/lib/member';
function selectPosts(member: Awaited<ReturnType<typeof requireMember>>, communityId:string, authorId:string){ if(!member.ok) throw new Error('member required'); const sql=member.sql; return sql`select po.id,po.author_id,po.body,po.created_at,c.name as community_name,p.display_name,p.avatar_url,p.verification,
  (select count(*)::int from post_reactions r where r.post_id=po.id) reaction_count,
  (select count(*)::int from comments co where co.post_id=po.id and co.status='published') comment_count,
  exists(select 1 from saved_posts s where s.post_id=po.id and s.user_id=${member.user.id}) as saved,
  (select reaction from post_reactions r where r.post_id=po.id and r.user_id=${member.user.id}) as my_reaction
  from posts po join communities c on c.id=po.community_id join profiles p on p.id=po.author_id
  where po.status='published' and exists(select 1 from community_members cm where cm.community_id=po.community_id and cm.user_id=${member.user.id})
    and (${communityId}='' or po.community_id::text=${communityId}) and (${authorId}='' or po.author_id=${authorId})
  order by po.created_at desc limit 50`; }
export async function GET(request:Request){ const member=await requireMember(); if(!member.ok) return member.response; const u=new URL(request.url); const rows=await selectPosts(member,(u.searchParams.get('communityId')||'').slice(0,50),(u.searchParams.get('authorId')||'').slice(0,120)); return Response.json({posts:rows}); }
export async function POST(request:Request){ const member=await requireMember(); if(!member.ok) return member.response; const input=await request.json().catch(()=>({})); const communityId=typeof input.communityId==='string'?input.communityId:''; const body=typeof input.body==='string'?input.body.trim():''; if(!communityId||body.length<1||body.length>10000) return Response.json({error:'Valid communityId and post body are required.'},{status:400}); const rows=await member.sql`insert into posts(community_id,author_id,body) select ${communityId},${member.user.id},${body} where exists(select 1 from community_members where community_id=${communityId} and user_id=${member.user.id}) returning id,body,created_at`; if(!rows.length) return Response.json({error:'Join this community before posting.'},{status:403}); return Response.json({post:rows[0]},{status:201}); }
