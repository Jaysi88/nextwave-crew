# Deployment

## 1. GitHub

Use `main` as the protected production branch. Require CI checks before merge once the deployment workflow is active. Keep secrets out of the repository.

## 2. Neon

Create a production Neon project and enable the selected authentication configuration. Copy the Postgres connection string into `DATABASE_URL`, configure the auth variables, and generate `NEON_AUTH_COOKIE_SECRET` with at least 32 random characters.

Run `db/schema.sql` in Neon SQL Editor, then optionally `db/seed.sql` for initial community categories.

## 3. Hostinger

Deploy as a Node.js/Next.js application from the GitHub repository. Configure the environment variables from `.env.example` in Hostinger application settings. Do not upload `.env.local` to GitHub.

Recommended domain: `crew.nextwavefusion.com`.

## 4. Verification

Before attaching the public domain, run:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Then verify `/api/health`, authentication, member privacy, mobile layouts, error logging and database backups.

## BNB Smart Chain USDC support

Production values:

- `NEXT_PUBLIC_USDC_NETWORK=bsc`
- `NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS=0xf8766be6d62f80c7e5f37af4a07f4faca0dac9fe`
- `BSC_RPC_URL=<your production BSC RPC endpoint>`

The application verifies Binance-Peg USDC transfer logs before writing a support payment to Neon. The production token contract is `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` and uses 18 decimals.

For production traffic, use a dedicated RPC provider rather than depending entirely on a shared public endpoint.

## Binance Pay

The current support page uses the owner-provided Binance Pay universal QR link for `DreamFaith`:

`https://app.binance.com/uni-qr/2VuuSfAT`

This is a direct Binance-hosted payment path. Do not represent Binance Pay payments as automatically reconciled inside NextWave Crew until suitable Binance Pay API credentials and a verified server-side reconciliation flow are configured.
