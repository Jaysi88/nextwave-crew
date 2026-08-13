# Financial Product Boundaries

## MVP

CrewWealth is a financial planning and education workspace. It can calculate budgets, shore-leave reserves, savings goals, debt scenarios, retirement projections and learning paths. It may store user-entered totals and goals.

It must not:

- hold or transmit member investment money;
- pool member capital;
- execute trades;
- provide individualized regulated investment advice;
- promise returns;
- market SeaPoints as an investment;
- allow SeaPoints to trade for cash or crypto.

## Future regulated integrations

Banking, brokerage, remittance, insurance, investment and digital-asset services should be delivered through appropriately licensed providers for the jurisdictions served. Legal review is a launch gate before adding custody, execution, pooled investing or transferable tokens.

## SeaPoints

SeaPoints begins as a closed-loop, non-transferable loyalty/reputation reward redeemable only for defined platform benefits. Product copy must avoid appreciation, yield, staking or investment language.

## Voluntary support payments

The Support page can accept voluntary contributions without creating a member deposit balance or investment product.

### BNB Smart Chain USDC

- Accept only the configured **Binance-Peg USDC (BEP-20)** contract on BNB Smart Chain.
- Verify the ERC-20 `Transfer` event server-side before marking a contribution as verified.
- Match the token contract, recipient wallet and exact amount.
- Store transaction hashes and public blockchain addresses as payment evidence, not as a user deposit balance.
- Never ask a supporter for a seed phrase or private key.
- Display the BNB Smart Chain network and recipient clearly before wallet confirmation.
- Warn users that crypto transfers are irreversible and that sending on the wrong network can cause loss.

### Binance Pay

- The QR/deep-link payment is completed inside Binance.
- Do not claim an on-site Binance Pay payment is verified unless the server has a supported API-based reconciliation method.
- Never request a supporter’s Binance password, 2FA code, seed phrase or private key.

Obtain tax, accounting and jurisdiction-specific legal advice before representing support payments as charitable donations or offering tax receipts.
