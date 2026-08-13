import { requireMember } from '@/lib/member';

const allowed = new Set(['support', 'useful', 'celebrate']);

export async function POST(request: Request) {
  const member = await requireMember();
  if (!member.ok) return member.response;

  const input = await request.json().catch(() => ({}));
  const postId = typeof input.postId === 'string' ? input.postId : '';
  const reaction = typeof input.reaction === 'string' && allowed.has(input.reaction) ? input.reaction : 'support';
  if (!postId) return Response.json({ error: 'postId is required.' }, { status: 400 });

  const post = await member.sql`select po.id, po.author_id
    from posts po
    join community_members cm on cm.community_id = po.community_id and cm.user_id = ${member.user.id}
    where po.id = ${postId} and po.status = 'published' limit 1`;
  if (!post.length) return Response.json({ error: 'Post is not available in your communities.' }, { status: 404 });

  const existing = await member.sql`select reaction from post_reactions where post_id = ${postId} and user_id = ${member.user.id}`;
  let reacted = true;
  if (existing[0]?.reaction === reaction) {
    await member.sql`delete from post_reactions where post_id = ${postId} and user_id = ${member.user.id}`;
    reacted = false;
  } else {
    await member.sql`insert into post_reactions (post_id, user_id, reaction) values (${postId}, ${member.user.id}, ${reaction})
      on conflict (post_id, user_id) do update set reaction = excluded.reaction, created_at = now()`;
    const authorId = String(post[0].author_id || '');
    if (authorId && authorId !== member.user.id) {
      await member.sql`insert into notifications (user_id, type, title, body, action_url)
        select ${authorId}, 'post_reaction', 'Your post received support', p.display_name || ' reacted to your community post.', '/community'
        from profiles p where p.id = ${member.user.id}`;
    }
  }

  const counts = await member.sql`select count(*)::int as count from post_reactions where post_id = ${postId}`;
  return Response.json({ reacted, reaction: reacted ? reaction : null, reactionCount: Number(counts[0]?.count || 0) });
}
