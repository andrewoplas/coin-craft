-- Row Level Security Policies for CoinCraft
-- Run this after running the main migration

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view their own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies (users can see system categories + their own)
CREATE POLICY "Users can view system and own categories" ON categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Allocations policies
CREATE POLICY "Users can view their own allocations" ON allocations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own allocations" ON allocations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allocations" ON allocations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allocations" ON allocations
  FOR DELETE USING (auth.uid() = user_id);

-- Allocation Transactions policies
CREATE POLICY "Users can view their own allocation_transactions" ON allocation_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = allocation_transactions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own allocation_transactions" ON allocation_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = allocation_transactions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own allocation_transactions" ON allocation_transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = allocation_transactions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- User Profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Modules policies
CREATE POLICY "Users can view their own modules" ON user_modules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own modules" ON user_modules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own modules" ON user_modules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modules" ON user_modules
  FOR DELETE USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view their own streaks" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- User Achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dashboard Layouts policies
CREATE POLICY "Users can view their own layout" ON dashboard_layouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own layout" ON dashboard_layouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own layout" ON dashboard_layouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements table is public read (no user_id column)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);
