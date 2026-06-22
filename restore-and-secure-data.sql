-- =====================================================
-- BACKUP DATA EXISTING (Optional, untuk jaga-jaga)
-- =====================================================
-- Run ini dulu untuk backup data ke JSON/temp table
-- Nanti bisa di-restore kalau ada masalah

CREATE TABLE IF NOT EXISTS transactions_backup AS SELECT * FROM transactions;
CREATE TABLE IF NOT EXISTS pockets_backup AS SELECT * FROM pockets;
CREATE TABLE IF NOT EXISTS pocket_savings_backup AS SELECT * FROM pocket_savings;

-- =====================================================
-- STEP 1: Cek User ID kamu
-- =====================================================
-- Jalankan query ini untuk lihat User ID kamu
SELECT id, email, raw_user_meta_data->>'username' as username FROM auth.users;

-- Copy User ID kamu (UUID format seperti: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
-- Ganti 'YOUR_USER_ID' di bawah dengan ID kamu

-- =====================================================
-- STEP 2: Tambah kolom user_id (jika belum ada)
-- =====================================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE pocket_savings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 3: Assign semua data existing ke user kamu
-- =====================================================
-- GANTI 'YOUR_USER_ID' dengan User ID kamu dari STEP 1

UPDATE transactions 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id IS NULL;

UPDATE pockets 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id IS NULL;

-- pocket_savings di-assign berdasarkan pocket parent-nya
UPDATE pocket_savings 
SET user_id = (SELECT user_id FROM pockets WHERE id = pocket_savings.pocket_id)
WHERE user_id IS NULL;

-- =====================================================
-- STEP 4: Cek hasilnya
-- =====================================================
-- Pastikan semua data sudah punya user_id
SELECT 
  (SELECT COUNT(*) FROM transactions WHERE user_id IS NULL) as transactions_null,
  (SELECT COUNT(*) FROM pockets WHERE user_id IS NULL) as pockets_null,
  (SELECT COUNT(*) FROM pocket_savings WHERE user_id IS NULL) as savings_null;

-- Harusnya semua return 0

-- =====================================================
-- STEP 5: Drop policy lama dan enable RLS
-- =====================================================
-- Drop policy "Allow all" yang lama
DROP POLICY IF EXISTS "Allow all" ON transactions;
DROP POLICY IF EXISTS "Allow all" ON pockets;
DROP POLICY IF EXISTS "Allow all" ON pocket_savings;

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pocket_savings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Buat RLS policies baru (auth-based)
-- =====================================================

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Pockets policies
CREATE POLICY "Users can view their own pockets"
  ON pockets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pockets"
  ON pockets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pockets"
  ON pockets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pockets"
  ON pockets FOR DELETE
  USING (auth.uid() = user_id);

-- Pocket savings policies
CREATE POLICY "Users can view their own pocket savings"
  ON pocket_savings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM pockets WHERE id = pocket_savings.pocket_id
    )
  );

CREATE POLICY "Users can insert their own pocket savings"
  ON pocket_savings FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM pockets WHERE id = pocket_savings.pocket_id
    )
  );

CREATE POLICY "Users can update their own pocket savings"
  ON pocket_savings FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM pockets WHERE id = pocket_savings.pocket_id
    )
  );

CREATE POLICY "Users can delete their own pocket savings"
  ON pocket_savings FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM pockets WHERE id = pocket_savings.pocket_id
    )
  );

-- =====================================================
-- STEP 7: Verifikasi RLS works
-- =====================================================
-- Test query (pastikan hanya return data user kamu)
SELECT COUNT(*) as my_transactions FROM transactions WHERE user_id = auth.uid();
SELECT COUNT(*) as my_pockets FROM pockets WHERE user_id = auth.uid();

-- =====================================================
-- SELESAI!
-- =====================================================
-- Data kamu sekarang sudah:
-- 1. Ter-assign ke user kamu
-- 2. Protected dengan RLS
-- 3. Hanya bisa diakses oleh kamu

-- Kalau ada masalah, bisa restore dari backup:
-- INSERT INTO transactions SELECT * FROM transactions_backup WHERE user_id IS NULL;
