-- AkuKaya Supabase Schema (PostgreSQL)
-- Run this in the Supabase SQL Editor to create the tables

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pockets (savings goals) table
CREATE TABLE IF NOT EXISTS pockets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  platform TEXT NOT NULL,
  instrument TEXT NOT NULL,
  frequency TEXT NOT NULL,
  routine_amount NUMERIC NOT NULL,
  estimated_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pocket savings history table
CREATE TABLE IF NOT EXISTS pocket_savings (
  id BIGSERIAL PRIMARY KEY,
  pocket_id BIGINT NOT NULL REFERENCES pockets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_pocket_savings_pocket_id ON pocket_savings(pocket_id);
CREATE INDEX IF NOT EXISTS idx_pockets_created_at ON pockets(created_at DESC);

-- Enable Row Level Security (RLS) - optional for personal use
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pocket_savings ENABLE ROW LEVEL SECURITY;

-- For personal use: allow all operations (no auth required)
-- If you add auth later, replace these with proper policies
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pockets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pocket_savings FOR ALL USING (true) WITH CHECK (true);
