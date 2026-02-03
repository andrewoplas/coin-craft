import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User Profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(), // Same as auth.uid()
  displayName: text('display_name'),
  characterId: text('character_id'), // 'observer', 'planner', 'saver', etc.
  defaultCurrency: text('default_currency').notNull().default('PHP'),
  settings: text('settings'), // JSON string for user preferences
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Modules table (which modules are active for the user)
export const userModules = pgTable('user_modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  moduleId: text('module_id').notNull(), // 'envelope', 'goals', 'statistics', etc.
  isActive: boolean('is_active').notNull().default(true),
  config: text('config'), // JSON string for module-specific user config
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  userModules: many(userModules),
}));

export const userModulesRelations = relations(userModules, ({ one }) => ({
  user: one(userProfiles, {
    fields: [userModules.userId],
    references: [userProfiles.id],
  }),
}));
