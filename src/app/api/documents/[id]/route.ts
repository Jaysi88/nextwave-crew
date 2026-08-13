import { decryptDocument } from '@/lib/documents';
import { requireMember } from '@/lib/member';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const member = await requireMember(); if (!member.ok) return member.response;
  const { id } = await params;
  const rows = await member.sql`select f.filename,f.mime_type,f.ciphertext,f.iv,f.auth_tag
    from certificates c join document_files f on f.id::text=c.storage_key
    where c.id=${id} and c.user_id=${member.user.id} limit 1`;
  if (!rows.length) return Response.json({ error: 'Document not found.' }, { status: 404 });
  const row = rows[0];
  const bytes = decryptDocument(String(row.ciphertext), String(row.iv), String(row.auth_tag));
  return new Response(bytes, { headers: { 'content-type': String(row.mime_type), 'content-disposition': `inline; filename="${String(row.filename).replace(/["\\]/g,'_')}"`, 'cache-control': 'private, no-store' } });
}
