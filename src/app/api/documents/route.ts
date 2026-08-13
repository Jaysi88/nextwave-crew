import { encryptDocument } from '@/lib/documents';
import { awardPointsOnce, requireMember } from '@/lib/member';

const allowedTypes = new Set(['application/pdf','image/jpeg','image/png','image/webp']);
const clean = (value: FormDataEntryValue | null, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET() {
  const member = await requireMember(); if (!member.ok) return member.response;
  const rows = await member.sql`select c.id, c.certificate_type, c.certificate_name, c.issuing_authority, c.issued_on, c.expires_on,
      c.verification, c.visibility, c.created_at, f.filename, f.mime_type, f.byte_size
    from certificates c left join document_files f on f.id::text = c.storage_key
    where c.user_id=${member.user.id} order by c.expires_on asc nulls last, c.created_at desc`;
  return Response.json({ documents: rows });
}

export async function POST(request: Request) {
  const member = await requireMember(); if (!member.ok) return member.response;
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'Choose a PDF or image document.' }, { status: 400 });
  if (!allowedTypes.has(file.type)) return Response.json({ error: 'Only PDF, JPEG, PNG and WebP files are accepted.' }, { status: 415 });
  if (file.size < 1 || file.size > 10 * 1024 * 1024) return Response.json({ error: 'Documents must be smaller than 10 MB.' }, { status: 413 });
  const certificateType = clean(form?.get('certificateType') ?? null, 80);
  const certificateName = clean(form?.get('certificateName') ?? null, 160);
  if (!certificateType || !certificateName) return Response.json({ error: 'Document type and name are required.' }, { status: 400 });
  const authority = clean(form?.get('issuingAuthority') ?? null, 160) || null;
  const issuedOn = clean(form?.get('issuedOn') ?? null, 10) || null;
  const expiresOn = clean(form?.get('expiresOn') ?? null, 10) || null;
  const encrypted = encryptDocument(new Uint8Array(await file.arrayBuffer()));
  const stored = await member.sql`insert into document_files (user_id,filename,mime_type,byte_size,ciphertext,iv,auth_tag)
    values (${member.user.id},${file.name.slice(0,200)},${file.type},${file.size},${encrypted.ciphertext},${encrypted.iv},${encrypted.authTag}) returning id`;
  const rows = await member.sql`insert into certificates (user_id,certificate_type,certificate_name,issuing_authority,issued_on,expires_on,storage_key,visibility)
    values (${member.user.id},${certificateType},${certificateName},${authority},${issuedOn},${expiresOn},${String(stored[0].id)},'private')
    returning id,certificate_name,verification`;
  await awardPointsOnce(member.user.id, 25, 'DOCUMENT_ADDED', String(rows[0].id));
  return Response.json({ document: rows[0] }, { status: 201 });
}

export async function DELETE(request: Request) {
  const member = await requireMember(); if (!member.ok) return member.response;
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  const rows = await member.sql`delete from certificates where id=${id} and user_id=${member.user.id} and verification <> 'verified' returning storage_key`;
  if (!rows.length) return Response.json({ error: 'Only your unverified documents can be removed.' }, { status: 409 });
  if (rows[0].storage_key) await member.sql`delete from document_files where id=${String(rows[0].storage_key)} and user_id=${member.user.id}`;
  return Response.json({ ok: true });
}
