CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_usd NUMERIC(20,8) NOT NULL CHECK (price_usd > 0),
  mining_speed TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  supported_coins TEXT[] NOT NULL DEFAULT ARRAY['BTC','ETH'],
  description TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  amount_usd NUMERIC(20,8) NOT NULL CHECK (amount_usd > 0),
  asset TEXT NOT NULL DEFAULT 'USDT' CHECK (asset = 'USDT'),
  network TEXT NOT NULL CHECK (network IN ('TRC20','ERC20')),
  payment_address TEXT NOT NULL,
  transaction_hash TEXT,
  sender_address TEXT,
  confirmations INTEGER NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','verified','failed')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Under Review','Approved','Rejected','Cancelled','Completed')),
  UNIQUE (transaction_hash)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS mining_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  coin TEXT CHECK (coin IN ('BTC','ETH')),
  mining_speed TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ready' CHECK (status IN ('Ready','Mining','Paused','Completed','Expired')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  total_mined NUMERIC(40,20) NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,
  provider_contract_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_user_status ON mining_contracts(user_id, status);

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('MINING_CREDIT','WITHDRAWAL_RESERVE','WITHDRAWAL_FEE','WITHDRAWAL_COMPLETED','WITHDRAWAL_REVERSED','ADJUSTMENT')),
  currency TEXT NOT NULL CHECK (currency IN ('BTC','ETH')),
  amount NUMERIC(40,20) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_user_currency_created ON wallet_ledger(user_id, currency, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON wallet_ledger(reference_type, reference_id);

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(40,20) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('BTC','ETH')),
  network TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  fee NUMERIC(40,20) NOT NULL DEFAULT 0,
  net_amount NUMERIC(40,20) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Under Review','Approved','Processing','Completed','Rejected','Cancelled')),
  blockchain_txid TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  confirmation_count INTEGER NOT NULL DEFAULT 0,
  provider_reference TEXT
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_created ON withdrawals(user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_withdrawal_provider_txid ON withdrawals(blockchain_txid) WHERE blockchain_txid IS NOT NULL;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS price_cache (
  symbol TEXT PRIMARY KEY,
  price_usd NUMERIC(30,12) NOT NULL CHECK (price_usd > 0),
  fetched_at TIMESTAMPTZ NOT NULL
);

INSERT INTO plans (name, price_usd, mining_speed, duration_days, supported_coins, description, features)
SELECT 'Starter', 20, '50 TH/s', 30, ARRAY['BTC','ETH'], 'Configurable starter plan.', '["BTC/ETH selection","Server-authoritative accounting"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name='Starter');

INSERT INTO plans (name, price_usd, mining_speed, duration_days, supported_coins, description, features)
SELECT 'Standard', 40, '100 TH/s', 30, ARRAY['BTC','ETH'], 'Configurable standard plan.', '["BTC/ETH selection","Server-authoritative accounting"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name='Standard');

INSERT INTO plans (name, price_usd, mining_speed, duration_days, supported_coins, description, features)
SELECT 'Advanced', 100, '250 TH/s', 30, ARRAY['BTC','ETH'], 'Configurable advanced plan.', '["BTC/ETH selection","Server-authoritative accounting"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name='Advanced');

INSERT INTO plans (name, price_usd, mining_speed, duration_days, supported_coins, description, features)
SELECT 'Professional', 200, '500 TH/s', 30, ARRAY['BTC','ETH'], 'Configurable professional plan.', '["BTC/ETH selection","Server-authoritative accounting"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name='Professional');

INSERT INTO plans (name, price_usd, mining_speed, duration_days, supported_coins, description, features)
SELECT 'Enterprise', 400, '1 PH/s', 30, ARRAY['BTC','ETH'], 'Configurable enterprise plan.', '["BTC/ETH selection","Server-authoritative accounting"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name='Enterprise');
