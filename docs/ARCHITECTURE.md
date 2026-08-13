# Architecture

## Runtime
- Next.js 16 App Router
- React 19
- TypeScript
- Neon Postgres via `@neondatabase/serverless`
- Neon Auth v0.2+ via `createNeonAuth()`
- GitHub for source control and CI
- Hostinger Node.js application hosting for production

## Boundaries
The web application is split into member, recruiter/company and administrative surfaces. Sensitive member and financial-planning records are never rendered into public profile payloads by default.

## Data strategy
Postgres is the source of truth. Documents belong in private object storage and the database stores metadata/storage keys only. Production should use a restricted runtime role and RLS after JWT claims are mapped to database request context.

## Environment model
Use separate Neon branches/databases for development, preview/staging and production. Never reuse production secrets in local or pull-request environments.

## API strategy
Route handlers validate identity, role, ownership and input before data access. Audit events are written for security-sensitive and administrative mutations.
