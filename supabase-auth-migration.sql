-- AkuKaya Authentication Migration
-- Run this AFTER setting up your first user account in Supabase Auth

-- Step 1: Add user_id columns (nullable first to preserve existing data)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE pocket_savings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Drop old "Allow all" policies
DROP POLICY IF EXISTS "Allow all" ON transactions;
DROP POLICY IF EXISTS "Allow all" ON pockets;
DROP POLICY IF EXISTS "Allow all" ON pocket_savings;

-- Step 3: Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pocket_savings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new auth-based RLS policies
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

-- Step 5: Create function to assign existing data to first user
-- IMPORTANT: Run this AFTER you create your first user account
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from Supabase Auth

-- To get your user ID, after sign up, run in SQL Editor:
-- SELECT id FROM auth.users;

-- Then run this with your user ID:
-- UPDATE transactions SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE pockets SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE pocket_savings SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;

-- Step 6: After confirming data is assigned, make user_id required
-- ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE pockets ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE pocket_savings ALTER COLUMN user_id SET NOT NULL;
