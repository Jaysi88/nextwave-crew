import { getAuth } from '@/lib/auth';

function unavailable() { return Response.json({ error: 'Neon Auth is not configured.' }, { status: 503 }); }
const auth = getAuth();
const handlers = auth?.handler();
export const GET = handlers?.GET ?? unavailable;
export const POST = handlers?.POST ?? unavailable;
