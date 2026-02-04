import { pgTable, uuid, text, integer, boolean, timestamp, date, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const accountTypeEnum = pgEnum('account_type', ['cash', 'bank', 'e_wallet', 'credit_card']);
export const transactionTypeEnum = pgEnum('transaction_type', ['expense', 'income', 'transfer']);
export const categoryTypeEnum = pgEnum('category_type', ['expense', 'income']);
export const periodEnum = pgEnum('period', ['weekly', 'monthly', 'yearly', 'custom', 'none']);

// Accounts table
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  currency: text('currency').notNull().default('PHP'),
  initialBalance: integer('initial_balance').notNull().default(0),
  icon: text('icon'),
  color: text('color'),
  isArchived: boolean('is_archived').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('accounts_user_id_idx').on(table.userId),
]);

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'), // null for system categories
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: text('icon'),
  color: text('color'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  isSystem: boolean('is_system').notNull().default(false),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('categories_user_id_idx').on(table.userId),
  index('categories_parent_id_idx').on(table.parentId),
  index('categories_type_idx').on(table.type),
]);

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // in centavos
  currency: text('currency').notNull().default('PHP'),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  toAccountId: uuid('to_account_id').references(() => accounts.id), // for transfers
  date: date('date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('transactions_user_id_idx').on(table.userId),
  index('transactions_user_id_date_idx').on(table.userId, table.date),
  index('transactions_account_id_idx').on(table.accountId),
  index('transactions_category_id_idx').on(table.categoryId),
  index('transactions_type_idx').on(table.type),
  index('transactions_date_idx').on(table.date),
]);

// Allocations table (flexible bucket for modules)
export const allocations = pgTable('allocations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  moduleType: text('module_type').notNull(), // 'envelope', 'goal', 'debt'
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  targetAmount: integer('target_amount'), // in centavos
  currentAmount: integer('current_amount').notNull().default(0), // in centavos
  period: periodEnum('period'),
  periodStart: date('period_start'),
  deadline: date('deadline'),
  categoryIds: uuid('category_ids').array(),
  isActive: boolean('is_active').notNull().default(true),
  config: text('config'), // JSON string for module-specific data
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('allocations_user_id_idx').on(table.userId),
  index('allocations_user_id_module_type_idx').on(table.userId, table.moduleType),
  index('allocations_is_active_idx').on(table.isActive),
]);

// Allocation Transactions (links transactions to allocations)
export const allocationTransactions = pgTable('allocation_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  allocationId: uuid('allocation_id').notNull().references(() => allocations.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // in centavos
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('allocation_transactions_transaction_id_idx').on(table.transactionId),
  index('allocation_transactions_allocation_id_idx').on(table.allocationId),
]);

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  subcategories: many(categories),
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
  transfersTo: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  toAccount: one(accounts, {
    fields: [transactions.toAccountId],
    references: [accounts.id],
  }),
  allocationTransactions: many(allocationTransactions),
}));

export const allocationsRelations = relations(allocations, ({ many }) => ({
  allocationTransactions: many(allocationTransactions),
}));

export const allocationTransactionsRelations = relations(allocationTransactions, ({ one }) => ({
  transaction: one(transactions, {
    fields: [allocationTransactions.transactionId],
    references: [transactions.id],
  }),
  allocation: one(allocations, {
    fields: [allocationTransactions.allocationId],
    references: [allocations.id],
  }),
}));
