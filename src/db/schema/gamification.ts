import { pgTable, uuid, text, integer, boolean, timestamp, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Streaks table
export const streaks = pgTable('streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastLogDate: date('last_log_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Achievements table (system-defined)
export const achievements = pgTable('achievements', {
  id: text('id').primaryKey(), // 'first-steps', 'consistency', etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category').notNull(), // 'streak', 'savings', 'budget', etc.
  requirement: text('requirement').notNull(), // Human-readable
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Achievements (earned badges)
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

// Dashboard Layouts (saved widget configurations)
export const dashboardLayouts = pgTable('dashboard_layouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  layout: text('layout').notNull(), // JSON string of widget positions and sizes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(userAchievements, {
    fields: [streaks.userId],
    references: [userAchievements.userId],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));
