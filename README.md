# MineCore

MineCore is a Vercel-compatible cryptocurrency mining application scaffold with server-authoritative accounting, PostgreSQL persistence, secure cookie sessions, payment-review workflows, withdrawal reservation, audit logging, and explicit adapters for real mining, market pricing, payment verification, and blockchain payouts.

## Important production boundary

This repository **does not fabricate mining production, balances, blockchain transactions, confirmations, or TXIDs**.

The real mining, payment-verification, price, and payout adapters are intentionally explicit integration points. Until real providers are configured and tested:

- Mining displays `Mining infrastructure is not connected`.
- Payout processing refuses to complete a withdrawal.
- No synthetic BTC/ETH production is created.
- No fake TXID is generated.
- A market-price quote is only used if a configured provider returns it.

Do not present example plan speeds or prices as guaranteed returns.

## Stack

- Vercel serverless functions
- Node.js 20+
- PostgreSQL
- `pg`
- `bcryptjs`
- `jose` signed HTTP-only session cookies
- Zod validation
- Static HTML/CSS/JS frontend

## Local setup

1. Create a PostgreSQL database.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. Set the USDT deposit addresses only after independently verifying the intended destination addresses.
5. Run:
   ```bash
   npm install
   npm run migrate
   vercel dev
   ```
6. Open the URL shown by Vercel CLI.

## Admin initialization

On migration, the application upserts the administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The password is bcrypt-hashed and is never sent to the browser.

Change the admin password through your deployment secret management and rerun the initialization if required. Do not commit `.env`.

## Database

Migration files are in `db/migrations`. The migration creates:

- users
- plans
- orders
- mining_contracts
- wallet_ledger
- withdrawals
- admin_audit_logs
- sessions
- price_cache

The initial example plans are clearly marked as configurable examples. They do not imply expected returns.

## Real integrations

Implement the provider-specific HTTP/API logic in:

- `lib/paymentVerifier.js`
- `lib/miningProvider.js`
- `lib/priceProvider.js`
- `lib/payoutProvider.js`

Each adapter fails closed if its provider is not configured.

### Payment verification

A TXID submission creates a pending order. It never approves an order. The admin approval endpoint requires a verified payment record. Your provider adapter must independently verify chain/network, destination, amount, asset, and confirmation policy.

### Mining

`miningProvider.js` must return measured production from actual hardware/pool/management infrastructure. The application never increments mined amounts with a browser timer. The mining status endpoint reports the provider's authoritative amount.

### Market price

The price adapter provides a cached quote for BTC/USD or ETH/USD. USD value is a valuation only; it is not credited as USD earnings.

### Payouts

`payoutProvider.js` must submit an actual blockchain transaction through a custody/wallet service and return the real transaction ID. The withdrawal cannot become `Completed` without a real provider response containing a TXID.

## Vercel deployment

1. Import the repository into Vercel.
2. Configure all production environment variables in Vercel.
3. Use a managed PostgreSQL provider.
4. Run the migration against the production database from a trusted environment:
   ```bash
   npm run migrate
   ```
5. Configure the real mining, payment verification, price, and custody providers.
6. Set `ENABLE_REAL_MINING=true` and/or `ENABLE_REAL_PAYOUTS=true` only after integration tests pass.
7. Restrict `APP_ORIGINS` to the actual site origin(s).

## Security checklist

- Use a long random `JWT_SECRET`.
- Use a strong unique `ADMIN_PASSWORD`.
- Keep provider API keys server-side.
- Use HTTPS in production.
- Keep private keys/seed phrases out of this application unless a vetted custody system requires them; prefer custody APIs.
- Review database backups and access controls.
- Add WAF/rate-limiting at the edge for high-risk deployments.
- Verify all payment destination addresses out-of-band before accepting deposits.
- Test payout flows with provider sandbox/testnet where supported.
- Obtain legal/compliance advice before operating a real-money mining/crypto platform.

## Testing

The project includes `tests/security.test.js`, which documents critical invariants and can be extended into an integration suite against a disposable PostgreSQL database.

Because real blockchain/mining providers are external systems, their integration tests must be run against their sandbox/test environment before production activation.
