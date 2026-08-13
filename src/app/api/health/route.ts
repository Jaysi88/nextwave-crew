import { hasDatabase } from '@/lib/db';
export function GET(){return Response.json({status:'ok',app:'nextwave-crew',databaseConfigured:hasDatabase(),timestamp:new Date().toISOString()});}
