# NextWave Crew Agent Instructions

## Product standard
Build NextWave Crew as serious maritime software, not a generic social template. Preserve the visual system: midnight ocean base, restrained teal signal color, warm metallic secondary accent, editorial typography, compact data surfaces and excellent mobile behavior.

## Architecture
- Next.js App Router and TypeScript.
- Neon Postgres is the production source of truth.
- Neon Auth is the identity layer.
- Keep public, member, recruiter/company and admin authorization boundaries explicit.
- No sensitive personal or financial field becomes public by default.
- Use server-side authorization for every protected mutation. UI role hiding is never sufficient.

## Financial boundary
CrewWealth is planning and education until a licensed provider is explicitly integrated. Do not add customer-money custody, pooled investments, trading execution, promised yield, transferable SeaPoints or token sale mechanics without an approved legal/product workstream.

## Quality gates
Before calling a feature complete:
1. Validate mobile and desktop layouts.
2. Add loading, empty and error states.
3. Validate inputs server-side.
4. Confirm authorization and ownership checks.
5. Add audit logging for privileged mutations.
6. Run typecheck, lint and build.
7. Avoid fake production metrics. Demo data must be identifiable as demo data.

## Git
Use small feature branches and pull requests. Never commit `.env*`, credentials, private member data or real identity documents.
