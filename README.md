# NextWave Crew

**Work at sea. Build life on shore.**

NextWave Crew is a membership, professional community, career and financial-wellbeing platform for the global maritime workforce, including passenger/cruise, cargo and offshore crews across every department.

## Current milestone

The repository contains the production foundation for:

- premium responsive public landing page;
- member dashboard and CrewID;
- department-based professional community;
- career center and role-matching interface;
- CrewWealth contract-aware planning tools;
- membership and owner/admin shells;
- Neon-ready PostgreSQL schema;
- Neon Auth integration foundation;
- verified BEP-20 USDC support payments on BNB Smart Chain;
- Binance Pay QR support for the owner account `DreamFaith`;
- security, deployment and financial-product boundary documentation;
- standalone static prototype in `/prototype`.

## Support payments

The `/support` page offers two separate payment paths.

### BNB Smart Chain USDC

The wallet flow sends **Binance-Peg USDC (BEP-20)** directly to:

`0xf8766be6d62f80c7e5f37af4a07f4faca0dac9fe`

The production token contract is:

`0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d`

The server verifies the ERC-20 `Transfer` event, recipient and exact amount against BNB Smart Chain before a payment can be recorded as verified in Neon.

### Binance Pay

The Binance Pay card uses the owner-supplied Binance universal QR link for `DreamFaith`. Payment completion occurs inside Binance. Automatic Binance Pay reconciliation is deliberately not claimed until supported Binance Pay API/merchant credentials are configured.

## Local development

Requires Node.js 20.9+.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The UI can run with demo data. Add Neon credentials to activate database/auth integrations.

## Database

Run `db/schema.sql` in Neon SQL Editor, followed by `db/seed.sql` if desired.

## Production checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Important

CrewWealth is currently planning and education software. The schema deliberately contains no customer-funds custody ledger, pooled investment product or tradable token mechanism. See `docs/FINANCIAL-BOUNDARIES.md`.
