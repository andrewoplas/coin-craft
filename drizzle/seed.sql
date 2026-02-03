-- Seed default categories
-- Expense Categories
INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
VALUES
  -- Food & Dining
  (NULL, 'Food & Dining', 'expense', '🍽️', '#F59E0B', NULL, 0, true, false),
  -- Transportation
  (NULL, 'Transportation', 'expense', '🚗', '#3B82F6', NULL, 0, true, false),
  -- Health & Fitness
  (NULL, 'Health & Fitness', 'expense', '💪', '#10B981', NULL, 0, true, false),
  -- Housing
  (NULL, 'Housing', 'expense', '🏠', '#8B5CF6', NULL, 0, true, false),
  -- Shopping
  (NULL, 'Shopping', 'expense', '🛍️', '#EC4899', NULL, 0, true, false),
  -- Entertainment
  (NULL, 'Entertainment', 'expense', '🎮', '#6366F1', NULL, 0, true, false),
  -- Bills & Subscriptions
  (NULL, 'Bills & Subscriptions', 'expense', '📱', '#EF4444', NULL, 0, true, false),
  -- Education
  (NULL, 'Education', 'expense', '📚', '#14B8A6', NULL, 0, true, false),
  -- Social
  (NULL, 'Social', 'expense', '🎁', '#F472B6', NULL, 0, true, false),
  -- Other
  (NULL, 'Other', 'expense', '📦', '#6B7280', NULL, 0, true, false);

-- Income Categories
INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
VALUES
  (NULL, 'Salary', 'income', '💰', '#10B981', NULL, 0, true, false),
  (NULL, 'Freelance', 'income', '💻', '#3B82F6', NULL, 0, true, false),
  (NULL, 'Investments', 'income', '📈', '#8B5CF6', NULL, 0, true, false),
  (NULL, 'Other Income', 'income', '🎯', '#F59E0B', NULL, 0, true, false);

-- Expense Subcategories
INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Groceries', 'Restaurants', 'Coffee', 'Delivery', 'Snacks']), 'expense', '🍽️', '#F59E0B', id, 0, true, false
FROM categories WHERE name = 'Food & Dining' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Gas/Fuel', 'Ride-hailing', 'Parking', 'Maintenance', 'Tolls']), 'expense', '🚗', '#3B82F6', id, 0, true, false
FROM categories WHERE name = 'Transportation' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Gym', 'Sports', 'Supplements', 'Medical', 'Pharmacy']), 'expense', '💪', '#10B981', id, 0, true, false
FROM categories WHERE name = 'Health & Fitness' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Rent', 'Electric', 'Water', 'Internet', 'Maintenance']), 'expense', '🏠', '#8B5CF6', id, 0, true, false
FROM categories WHERE name = 'Housing' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Clothing', 'Tech/Gadgets', 'Household', 'Personal Care']), 'expense', '🛍️', '#EC4899', id, 0, true, false
FROM categories WHERE name = 'Shopping' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Streaming', 'Games', 'Events', 'Hobbies']), 'expense', '🎮', '#6366F1', id, 0, true, false
FROM categories WHERE name = 'Entertainment' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Phone Plan', 'App Subscriptions', 'Insurance']), 'expense', '📱', '#EF4444', id, 0, true, false
FROM categories WHERE name = 'Bills & Subscriptions' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Courses', 'Books', 'Tools']), 'expense', '📚', '#14B8A6', id, 0, true, false
FROM categories WHERE name = 'Education' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Gifts', 'Celebrations', 'Dates', 'Hangouts']), 'expense', '🎁', '#F472B6', id, 0, true, false
FROM categories WHERE name = 'Social' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, 'Uncategorized', 'expense', '📦', '#6B7280', id, 0, true, false
FROM categories WHERE name = 'Other' AND user_id IS NULL;

-- Income Subcategories
INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Base Pay', 'Bonuses', '13th Month']), 'income', '💰', '#10B981', id, 0, true, false
FROM categories WHERE name = 'Salary' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Client Work', 'Side Projects']), 'income', '💻', '#3B82F6', id, 0, true, false
FROM categories WHERE name = 'Freelance' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Dividends', 'Interest', 'Capital Gains']), 'income', '📈', '#8B5CF6', id, 0, true, false
FROM categories WHERE name = 'Investments' AND user_id IS NULL;

INSERT INTO categories (user_id, name, type, icon, color, parent_id, sort_order, is_system, is_hidden)
SELECT NULL, unnest(ARRAY['Refunds', 'Cash Back', 'Gifts Received']), 'income', '🎯', '#F59E0B', id, 0, true, false
FROM categories WHERE name = 'Other Income' AND user_id IS NULL;

-- Seed Achievements
INSERT INTO achievements (id, name, description, icon, category, requirement, sort_order)
VALUES
  ('first-steps', 'First Steps', 'Log your first transaction', '🎯', 'streak', 'Log 1 transaction', 0),
  ('consistency', 'Consistency', 'Keep a 7-day logging streak', '🔥', 'streak', '7-day streak', 0),
  ('habit-formed', 'Habit Formed', 'Keep a 30-day logging streak', '⭐', 'streak', '30-day streak', 0),
  ('legendary', 'Legendary', 'Keep a 100-day logging streak', '👑', 'streak', '100-day streak', 0),
  ('budget-keeper', 'Budget Keeper', 'Stay within all envelopes for a full month', '📋', 'budget', 'Stay within budget for 1 month', 0),
  ('goal-getter', 'Goal Getter', 'Complete your first savings goal', '🎯', 'savings', 'Complete 1 goal', 0),
  ('penny-pincher', 'Penny Pincher', 'Spend less than last month', '💰', 'savings', 'Reduce spending month-over-month', 0),
  ('big-saver', 'Big Saver', 'Save more than 20% of income in a month', '💎', 'savings', 'Save 20%+ of monthly income', 0),
  ('category-king', 'Category King', 'Categorize 100 transactions', '📊', 'milestone', 'Categorize 100 transactions', 0),
  ('multi-crafter', 'Multi-Crafter', 'Enable 3 or more modules', '🎨', 'milestone', 'Enable 3+ modules', 0);
