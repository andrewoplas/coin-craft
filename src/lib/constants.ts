// Character configurations
export type CharacterConfig = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  modules: string[];
  available: boolean;
};

export const CHARACTERS: Record<string, CharacterConfig> = {
  observer: {
    id: 'observer',
    name: 'The Observer',
    tagline: 'Track, learn, adjust. Knowledge is power.',
    description: 'Curious, reflective, low-maintenance. Perfect for those who want visibility into spending without committing to budgets.',
    icon: '👁️',
    accentColor: '#3B82F6', // blue
    modules: ['core', 'statistics'],
    available: true,
  },
  planner: {
    id: 'planner',
    name: 'The Planner',
    tagline: 'Every peso has a job. You decide where it goes.',
    description: 'Disciplined, proactive, in control. Use envelope budgeting to give every peso a purpose.',
    icon: '📋',
    accentColor: '#8B5CF6', // purple
    modules: ['core', 'statistics', 'envelope'],
    available: true,
  },
  saver: {
    id: 'saver',
    name: 'The Saver',
    tagline: 'Eyes on the prize. Every peso gets you closer.',
    description: 'Motivated, goal-oriented, patient. Save for specific things with clear targets and timelines.',
    icon: '🎯',
    accentColor: '#10B981', // green
    modules: ['core', 'statistics', 'goals'],
    available: true,
  },
  warrior: {
    id: 'warrior',
    name: 'The Warrior',
    tagline: 'Fight your way to freedom. Every payment is a victory.',
    description: 'Fierce, determined. Track debts and systematically pay them off.',
    icon: '⚔️',
    accentColor: '#EF4444', // red
    modules: ['core', 'statistics', 'debt'],
    available: false, // Phase 2
  },
  hustler: {
    id: 'hustler',
    name: 'The Hustler',
    tagline: 'Multiple streams, one clear picture. Know your real profit.',
    description: 'Energetic, resourceful. Track income by client/project and calculate true profit.',
    icon: '🚀',
    accentColor: '#F59E0B', // amber
    modules: ['core', 'statistics', 'freelancer'],
    available: false, // Phase 3
  },
  team: {
    id: 'team',
    name: 'The Team',
    tagline: 'Your money, managed together.',
    description: 'Warm, collaborative. Manage shared finances with your partner or family.',
    icon: '🤝',
    accentColor: '#EC4899', // pink
    modules: ['core', 'statistics', 'shared'],
    available: false, // Phase 3
  },
};

// Semantic colors
export const COLORS = {
  income: '#10B981', // emerald green
  expense: '#EF4444', // red
  transfer: '#6366F1', // indigo
  warning: '#F59E0B', // amber
  positive: '#10B981',
  negative: '#EF4444',
};

// Default category data (will be seeded)
export type CategoryData = {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  subcategories?: string[];
};

export const DEFAULT_EXPENSE_CATEGORIES: CategoryData[] = [
  {
    name: 'Food & Dining',
    icon: '🍽️',
    color: '#F59E0B',
    type: 'expense',
    subcategories: ['Groceries', 'Restaurants', 'Coffee', 'Delivery', 'Snacks'],
  },
  {
    name: 'Transportation',
    icon: '🚗',
    color: '#3B82F6',
    type: 'expense',
    subcategories: ['Gas/Fuel', 'Ride-hailing', 'Parking', 'Maintenance', 'Tolls'],
  },
  {
    name: 'Health & Fitness',
    icon: '💪',
    color: '#10B981',
    type: 'expense',
    subcategories: ['Gym', 'Sports', 'Supplements', 'Medical', 'Pharmacy'],
  },
  {
    name: 'Housing',
    icon: '🏠',
    color: '#8B5CF6',
    type: 'expense',
    subcategories: ['Rent', 'Electric', 'Water', 'Internet', 'Maintenance'],
  },
  {
    name: 'Shopping',
    icon: '🛍️',
    color: '#EC4899',
    type: 'expense',
    subcategories: ['Clothing', 'Tech/Gadgets', 'Household', 'Personal Care'],
  },
  {
    name: 'Entertainment',
    icon: '🎮',
    color: '#6366F1',
    type: 'expense',
    subcategories: ['Streaming', 'Games', 'Events', 'Hobbies'],
  },
  {
    name: 'Bills & Subscriptions',
    icon: '📱',
    color: '#EF4444',
    type: 'expense',
    subcategories: ['Phone Plan', 'App Subscriptions', 'Insurance'],
  },
  {
    name: 'Education',
    icon: '📚',
    color: '#14B8A6',
    type: 'expense',
    subcategories: ['Courses', 'Books', 'Tools'],
  },
  {
    name: 'Social',
    icon: '🎁',
    color: '#F472B6',
    type: 'expense',
    subcategories: ['Gifts', 'Celebrations', 'Dates', 'Hangouts'],
  },
  {
    name: 'Other',
    icon: '📦',
    color: '#6B7280',
    type: 'expense',
    subcategories: ['Uncategorized'],
  },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryData[] = [
  {
    name: 'Salary',
    icon: '💰',
    color: '#10B981',
    type: 'income',
    subcategories: ['Base Pay', 'Bonuses', '13th Month'],
  },
  {
    name: 'Freelance',
    icon: '💻',
    color: '#3B82F6',
    type: 'income',
    subcategories: ['Client Work', 'Side Projects'],
  },
  {
    name: 'Investments',
    icon: '📈',
    color: '#8B5CF6',
    type: 'income',
    subcategories: ['Dividends', 'Interest', 'Capital Gains'],
  },
  {
    name: 'Other Income',
    icon: '🎯',
    color: '#F59E0B',
    type: 'income',
    subcategories: ['Refunds', 'Cash Back', 'Gifts Received'],
  },
];

// Default achievements
export type AchievementData = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
};

export const DEFAULT_ACHIEVEMENTS: AchievementData[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Log your first transaction',
    icon: '🎯',
    category: 'streak',
    requirement: 'Log 1 transaction',
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Keep a 7-day logging streak',
    icon: '🔥',
    category: 'streak',
    requirement: '7-day streak',
  },
  {
    id: 'habit-formed',
    name: 'Habit Formed',
    description: 'Keep a 30-day logging streak',
    icon: '⭐',
    category: 'streak',
    requirement: '30-day streak',
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Keep a 100-day logging streak',
    icon: '👑',
    category: 'streak',
    requirement: '100-day streak',
  },
  {
    id: 'budget-keeper',
    name: 'Budget Keeper',
    description: 'Stay within all envelopes for a full month',
    icon: '📋',
    category: 'budget',
    requirement: 'Stay within budget for 1 month',
  },
  {
    id: 'goal-getter',
    name: 'Goal Getter',
    description: 'Complete your first savings goal',
    icon: '🎯',
    category: 'savings',
    requirement: 'Complete 1 goal',
  },
  {
    id: 'penny-pincher',
    name: 'Penny Pincher',
    description: 'Spend less than last month',
    icon: '💰',
    category: 'savings',
    requirement: 'Reduce spending month-over-month',
  },
  {
    id: 'big-saver',
    name: 'Big Saver',
    description: 'Save more than 20% of income in a month',
    icon: '💎',
    category: 'savings',
    requirement: 'Save 20%+ of monthly income',
  },
  {
    id: 'category-king',
    name: 'Category King',
    description: 'Categorize 100 transactions',
    icon: '📊',
    category: 'milestone',
    requirement: 'Categorize 100 transactions',
  },
  {
    id: 'multi-crafter',
    name: 'Multi-Crafter',
    description: 'Enable 3 or more modules',
    icon: '🎨',
    category: 'milestone',
    requirement: 'Enable 3+ modules',
  },
];
