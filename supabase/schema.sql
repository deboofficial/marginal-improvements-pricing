-- Enable pgcrypto for secure token generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email               TEXT UNIQUE NOT NULL,
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id   TEXT UNIQUE NOT NULL,
  plan_type           TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'paid'
                        CHECK (status IN ('paid','intake_pending','intake_completed','in_progress','ready','delivered')),
  intake_token        TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE intake_forms (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
  age             INTEGER,
  weight          TEXT,
  height          TEXT,
  goal            TEXT,
  activity_level  TEXT,
  training_days   INTEGER,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plans (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
  content_url     TEXT,
  access_token    TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookups
CREATE INDEX idx_orders_intake_token   ON orders(intake_token);
CREATE INDEX idx_plans_access_token    ON plans(access_token);
CREATE INDEX idx_orders_session        ON orders(stripe_session_id);
