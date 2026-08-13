import { requireMember } from '@/lib/member';
export async function GET(request:Request){ const member=await requireMember(); if(!member.ok) return member.response; const userId=(new URL(request.url).searchParams.get('userId')||member.user.id).slice(0,120); const rows=await member.sql`select p.id,p.display_name,p.avatar_url,p.cover_url,p.nationality,p.country_of_residence,p.verification,p.created_at,cp.department,cp.current_position,cp.ship_segment,cp.years_at_sea,cp.career_summary,cp.profile_score,cp.open_to_work,cp.open_to_mentor,cp.seeking_mentor,
  (select count(*)::int from member_follows f where f.followed_id=p.id) follower_count,
  (select count(*)::int from member_follows f where f.follower_id=p.id) following_count,
  (select count(*)::int from posts po where po.author_id=p.id and po.status='published') post_count,
  exists(select 1 from member_follows f where f.follower_id=${member.user.id} and f.followed_id=p.id) as followed_by_me
  from profiles p join crew_profiles cp on cp.user_id=p.id where p.id=${userId} and (p.id=${member.user.id} or p.visibility in ('members','public')) limit 1`;
  if(!rows.length) return Response.json({error:'Member profile not found.'},{status:404}); return Response.json({profile:{...rows[0],is_self:userId===member.user.id}}); }
