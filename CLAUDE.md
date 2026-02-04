# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**CoinCraft** is a modular expense tracker where users choose a financial "character" that shapes their experience, then customize by enabling/disabling modules. Built with Next.js, Supabase, and a custom module system.

**Always read these files before starting any sprint:**
- `SPEC.md` — Full product specification, data models, character definitions, module specs, UI guidelines
- `PLAN.md` — Architecture, folder structure, technical decisions, database schema
- `TASKS.md` — Sprint-by-sprint task checklist with acceptance criteria

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router) — frontend AND backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password, OAuth)
- **ORM:** Drizzle ORM (connected to Supabase Postgres)
- **Styling:** Tailwind CSS + shadcn/ui (new-york style)
- **State:** Zustand (client-side state for dashboard, modules, UI)
- **Charts:** Recharts
- **Dates:** date-fns
- **Testing:** Vitest (unit/integration), Playwright (E2E), Testing Library
- **Deploy:** Vercel

---

## Rules

### Code Style
- TypeScript strict mode. No `any` types.
- Prefer `type` over `interface` unless extending.
- Prefer named exports (except page components which use default).
- Arrow functions for components and utilities.
- File naming: kebab-case (`quick-add-modal.tsx`), PascalCase for component names.

### Architecture
- **Server Actions** for all mutations. Never create API routes.
- **Server Components** by default. Only `"use client"` when interactivity is needed.
- **Drizzle ORM** for all database queries. Connect to Supabase Postgres directly.
- **Supabase JS client** for auth operations only.
- **Module system** drives UI composition. Never hardcode module-specific logic in core.

### Module System
- Every module lives in `src/modules/[module-name]/`.
- Every module exports a `manifest.ts` following the `ModuleManifest` type.
- The module registry (`src/modules/registry.ts`) discovers active modules and provides: `getActiveRoutes()`, `getActiveWidgets()`, `getActiveFormExtensions()`.
- Sidebar, dashboard, and Quick Add form all read from the module registry.
- Module-specific components, actions, and queries live inside the module folder.
- Core components NEVER import directly from module folders. They use the registry.

### Database
- All tables in `src/db/schema/`.
- Every table has `user_id` column with RLS policy.
- **Money in centavos** (integers). ₱150.50 = 15050. Use `toCentavos()` to save, `fromCentavos()` to display.
- Timestamps as ISO strings. Dates as `YYYY-MM-DD`.
- Default currency: PHP.
- RLS policies on ALL tables: `auth.uid() = user_id`.

### UI/UX
- **Duolingo design vibe.** Clean, modern, colorful, friendly. Rounded corners. Subtle animations.
- **shadcn/ui** for all base components. Customize with Tailwind.
- **Emoji placeholders** for character avatars and category icons. Will be replaced later.
- **Character accent color** applied to sidebar accent, FAB, and key UI elements.
- **Semantic colors:** Green = income/positive, Red = expense/negative, Indigo = transfer, Amber = warning.
- Mobile-first responsive. Test at 375px, 768px, 1024px, 1440px.
- **Quick Add must be fast.** Under 5 seconds for a basic expense.

### Patterns
- Server queries: `src/server/queries/`
- Server actions: `src/server/actions/`
- Zustand stores: `src/stores/`
- Shared types: `src/lib/types.ts`
- Constants: `src/lib/constants.ts`
- Formatting: `src/lib/format.ts`
- Module manifests: `src/modules/[name]/manifest.ts`
- Module widgets: `src/modules/[name]/widgets/`
- Module form extensions: `src/modules/[name]/form-extensions/`
- Module actions/queries: `src/modules/[name]/actions/` and `src/modules/[name]/queries/`

### Don'ts
- Don't bypass the module system. All module features go through manifests and registry.
- Don't use API routes. Server Actions only.
- Don't use moment.js or dayjs. Use date-fns.
- Don't use Redux or React Query. Zustand for client state, Server Components for server state.
- Don't store money as floats. Always centavos (integers).
- Don't skip RLS policies on any table.
- Don't hardcode character or module logic in core components.

---

## Verification Rules

**CRITICAL: Run `npm run check` after every task.** Not after every sprint — after every single task. This catches errors early before they compound.

The `npm run check` command runs in sequence:
1. `npm run lint` — ESLint checks
2. `npm run typecheck` — TypeScript strict type checking (`tsc --noEmit`)
3. `npm run build` — Next.js production build

### Workflow per task:
1. Mark task `[~]` in TASKS.md
2. Implement the task
3. Run `npm run check`
4. If errors → fix them → run `npm run check` again → repeat until zero errors
5. Mark task `[x]` in TASKS.md
6. Move to next task

**Never skip verification.** Never leave lint warnings or type errors for later. Every task must result in a clean `npm run check` before moving on.

**If `npm run check` is not yet available** (early in Sprint 0 before package.json exists), skip verification for those initial setup tasks. Once the check script is configured, verify everything from that point forward.

---

## Testing Strategy

**CRITICAL: All implementations must include automated tests. No manual testing required.**

### Test Levels

**Unit Tests (Vitest)**
- All utility functions (`src/lib/`)
- Formatting functions (money, dates)
- Helper functions and constants
- Module manifest validation
- Coverage target: 90%+

**Integration Tests (Vitest)**
- Server actions (`src/server/actions/`)
- Database queries (`src/server/queries/`)
- Module registry functions
- Auth flows
- Test against real Supabase (test project)

**E2E Tests (Playwright)**
- Critical user flows (auth, onboarding, Quick Add)
- Character selection and module activation
- Transaction creation (expense, income, transfer)
- Dashboard and widget rendering
- Responsive design (mobile, tablet, desktop)
- Character-specific theming
- All module features

### Testing Rules

**Every feature must have:**
1. Unit tests for all new utility functions
2. Integration tests for all server actions and queries
3. E2E tests for all user-facing flows
4. Tests must pass before considering implementation complete

**Test file locations:**
- Unit tests: `src/lib/__tests__/`
- Integration tests: `src/server/__tests__/`
- E2E tests: `e2e/`
- Component tests: co-located `__tests__/` folders

**CI/CD:**
- All tests run on every commit
- E2E tests run in headless mode
- Block merge if any test fails
- Run against Supabase test project

**Test Data:**
- Use factories/fixtures for test data
- Seed test database before E2E runs
- Clean up after each test
- Never use production data

---

## Common Commands

```bash
npm run dev                      # Start dev server
npm run build                    # Production build
npm run lint                     # Run ESLint
npm run typecheck                # Run TypeScript type checking (tsc --noEmit)
npm run check                    # Run ALL checks: lint + typecheck + build

# Testing
npm run test                     # Run all unit + integration tests
npm run test:watch               # Run tests in watch mode
npm run test:coverage            # Run tests with coverage report
npm run test:e2e                 # Run Playwright E2E tests
npm run test:e2e:ui              # Run E2E tests with UI
npm run test:all                 # Run all tests (unit + integration + E2E)

# Database (Drizzle + Supabase)
npx drizzle-kit generate         # Generate migration from schema changes
npx drizzle-kit migrate          # Apply migrations
npx drizzle-kit studio           # Open Drizzle Studio (database GUI)
npx tsx src/db/seed.ts           # Run seed script

# Supabase (if using local dev)
npx supabase start               # Start local Supabase
npx supabase stop                # Stop local Supabase
npx supabase db reset            # Reset local database
```

---

## Key Architecture Concepts

### Module Registry Pattern
Core components (sidebar, dashboard, Quick Add form) **never** import module code directly. Instead:
1. Each module has a `manifest.ts` defining its routes, widgets, and form extensions
2. `src/modules/registry.ts` discovers modules and exposes: `getActiveRoutes()`, `getActiveWidgets()`, `getActiveFormExtensions()`
3. User's active modules stored in `user_modules` table
4. UI components read from registry to compose dynamically

### Allocations (Flexible Buckets)
The `allocations` table is a polymorphic container used differently by each module:
- **Envelope module:** Allocations = spending wallets with monthly budgets
- **Goals module:** Allocations = savings targets with optional deadlines
- **Debt module (Phase 2):** Allocations = debts to pay off

The `module_type` column identifies which module owns each allocation. The `allocation_transactions` table links transactions to allocations for tracking.

### Account Balance Computation
Account balances are **always computed** from transactions, never stored directly:
```
current_balance = initial_balance
  + sum(income to this account)
  - sum(expenses from this account)
  + sum(transfers in)
  - sum(transfers out)
```

---

## Character Configs Reference

| Character    | ID         | Accent Color | Modules                          | Available |
| ------------ | ---------- | ------------ | -------------------------------- | --------- |
| The Observer | `observer` | `#3B82F6`    | core, statistics                 | Phase 1   |
| The Planner  | `planner`  | `#8B5CF6`    | core, statistics, envelope       | Phase 1   |
| The Saver    | `saver`    | `#10B981`    | core, statistics, goals          | Phase 1   |
| The Warrior  | `warrior`  | `#EF4444`    | core, statistics, debt           | Phase 2   |
| The Hustler  | `hustler`  | `#F59E0B`    | core, statistics, freelancer     | Phase 3   |
| The Team     | `team`     | `#EC4899`    | core, statistics, shared         | Phase 3   |

---

## Current Sprint

Update this section every time you start or complete a sprint.

**Active Sprint:** Sprint 11 — Gamification
**Phase:** 1
**Status:** Not started
**Completed Sprints:** Sprint 0, Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 5, Sprint 6, Sprint 7, Sprint 8, Sprint 9, Sprint 10

## Implementation Notes

Sprint 3 and beyond require extensive UI components, state management, and database interactions. The foundation is solid with:
- ✅ Complete authentication and onboarding flow
- ✅ Module system architecture with dynamic navigation
- ✅ Database schema with RLS policies
- ✅ Character system with theming
- ✅ Responsive app shell (desktop, tablet, mobile)

Remaining sprints (3-13) involve building out full CRUD operations for transactions, accounts, categories, and module-specific features. The architectural foundation supports these features and they can be implemented incrementally.

### Sprint Progress Log
**Sprint 0 — 2026-02-04** — Project foundation complete. Next.js 14+ with App Router, TypeScript strict mode, Tailwind CSS, and shadcn/ui configured. Database schema created with 11 tables (accounts, transactions, categories, allocations, user profiles, gamification). RLS policies applied. Default categories and achievements seeded. Drizzle ORM connected to Supabase Postgres. Module system types defined. Utility functions (money formatting, date helpers, character configs) in place. Build and typecheck passing clean.

**Sprint 1 — 2026-02-04** — Authentication and onboarding flow complete. Supabase Auth integrated with email/password signup and login. Middleware protecting app routes. Clean branded login/signup pages. Character selection with 6 characters (3 available, 3 coming soon). Interactive character cards with hover expansion. Help-me-choose quiz with 4 questions recommending best character. Contextual setup flow creating user profile, activating modules, and adding accounts. Full flow: signup → character select/quiz → setup → dashboard.

**Sprint 2 — 2026-02-04** — App shell and dynamic navigation complete. Module registry system built with getActiveRoutes(), getActiveWidgets(), getActiveFormExtensions(). Manifests created for core, statistics, envelope, and goals modules. Responsive sidebar with CoinCraft logo, collapsible on tablet, icon-only mode. Active route highlighting with character accent colors. Mobile bottom nav with Dashboard, Transactions, Quick Add FAB, Stats, More drawer. All placeholder pages created: Dashboard (with character greeting), Transactions, Accounts, Categories, Statistics, Settings, Envelopes, Goals. Navigation dynamically shows/hides based on user's active modules from database.

**Sprint 3 — 2026-02-04** — Quick Add transaction flow complete. Full-featured modal with amount input (large display, auto-focused), transaction type toggle (Expense/Income/Transfer with color coding), category picker (grid of emoji icons), account selectors (dropdown with balances), date picker (defaults to today), and optional note field. Transfer type shows From/To account selectors with validation preventing same-account transfers. Module form extensions system built: Envelope module adds wallet picker after category (auto-selects if category linked), Goals module adds allocation picker after account for income. createTransaction server action handles all transaction types, updates account balances, creates allocation links, and updates streaks. Success toast with celebration animation. Form resets on close. Zustand store manages modal state. Under 5 seconds for basic expense. npm run check passes clean.

**Sprint 4 — 2026-02-04** — Transaction List complete with full CRUD operations. Transactions page displays all transactions grouped by date (Today, Yesterday, specific dates) with category emoji, name, note, amount (color-coded by type), and account name. Allocation badges show envelope/goal assignments. Comprehensive filter bar with date range picker, category dropdown, account dropdown, type filter, and text search on notes. Infinite scroll with cursor-based pagination loads more transactions as user scrolls. Click transaction row to open Quick Add modal pre-filled with transaction data for editing. Delete transaction with confirmation dialog. updateTransaction and deleteTransaction server actions recalculate account balances and allocation amounts. Empty state with friendly message and CTA. All filtering works correctly. npm run check passes clean.

**Sprint 5 — 2026-02-04** — Account management system complete with full CRUD operations. Accounts page displays total balance summary across all accounts. Account cards show icon, name, type badge (Cash/Bank/E-Wallet/Credit Card), and computed balance (calculated from initialBalance + income - expenses + transfers). Add Account modal with validation for name, type, currency, initial balance, icon (emoji picker), and color. Edit Account modal (limited to name, icon, color - type and initial balance locked after creation). Archive Account dialog with confirmation (soft delete via isArchived flag preserves all data). Server actions: createAccount, updateAccount, archiveAccount with auth verification and revalidation. getAccountsWithBalances query computes balances from transactions (not stored). Click account card navigates to filtered transactions (/transactions?account={id}). Empty state with polished design and CTA. Zustand stores for modal state management. All components follow established patterns from Sprints 3-4. npm run check passes clean.

**Sprint 6 — 2026-02-04** — Category management system complete with full CRUD operations. Categories page displays two sections for Expense and Income categories. Category tree shows main categories with expandable subcategories, each with emoji, name, color swatch, and transaction count. Add Category modal with validation for name, type, emoji picker, color picker, and parent category selection. Edit Category modal updates name, emoji, color. System categories protected (hide only via hideCategory action), user-created categories deletable via deleteCategory action with transaction count validation and subcategory cascade. Reorder categories with up/down arrows using reorderCategories server action. Server actions handle all mutations: createCategory, updateCategory, deleteCategory, hideCategory, reorderCategories with auth verification and revalidation. Quick Add picker integration moved to server-side data fetching in layout for immediate reflection of category changes. Category stores manage modal state. All components follow established patterns from Sprints 3-5. npm run check passes clean.

**Sprint 7 — 2026-02-04** — Envelope module complete for The Planner character. Full envelope budgeting system with CRUD operations. Envelopes page displays cards with name, emoji, progress bar (color-coded: green <60%, amber 60-80%, red >80%), remaining amount, and period indicator. Create/Edit envelope modals with name, icon, target amount, period (weekly/monthly), and rollover toggle. Envelope detail view shows transactions list and daily spending mini-chart. Transfer between envelopes moves budget allocation. Period reset logic automatically advances periodStart and resets spent amount (with rollover support) when period ends. Auto-assignment backend logic links expense transactions to envelopes when category is linked. Dashboard widgets: Envelope Overview (mini progress bars), Low Balance Warnings (>80% spent), Allocation Summary (total allocated vs spent). WalletPicker form extension in Quick Add auto-selects envelope based on category. Smart nudges configured: low balance warning, unallocated income prompt, under-budget streak. All server actions and queries implemented with auth verification. npm run check passes clean.

**Sprint 8 — 2026-02-04** — Goals module complete for The Saver character. Full goal-based savings system with CRUD operations. Goals page displays cards with name, emoji, large progress bar (color gradient from cyan to green as progress increases), amount saved vs target, and projected completion date. Create/Edit goal modals with name, icon, color, target amount, and optional deadline. Goal detail view shows contribution history, savings progress area chart (cumulative vs target over time), and monthly savings stats (average, current month, projected completion). Contribute to goal functionality allows manual allocations. Deadline tracking calculates required monthly savings and shows on-track/off-track status. Goal completion triggers confetti animation and archives the goal. Dashboard widgets: Goal Progress (mini progress bars), Projected Dates (completion estimates), Savings Rate (monthly trend). GoalPicker form extension in Quick Add allows allocating income to goals. Smart nudges configured: on-track alert, off-track warning, milestone celebration, no-contribution reminder. All server actions (createGoal, updateGoal, pauseGoal, abandonGoal, completeGoal, contributeToGoal) and queries (getGoalById, getGoalContributions, getGoalSavingsStats) implemented. npm run check passes clean.

**Sprint 9 — 2026-02-04** — Dashboard Canvas complete. Fully customizable dashboard with widget grid system. Core widgets implemented: Net Worth (shows total balance across accounts), Accounts Overview (list with balances and type badges), Recent Transactions (color-coded with category icons), Income vs Expenses (6-month bar chart using Recharts), Spending by Category (pie chart with breakdown), Cash Flow (income minus expenses with progress bar). Dashboard store (Zustand) manages edit mode, layout state, and widget operations. Edit mode toggle shows/hides widget controls. Add Widget modal displays all available widgets from active modules grouped by module. Remove widget via X button in edit mode. Resize widgets with grow/shrink buttons (S/M/L sizes). Layout persists to database via saveDashboardLayout server action. Reset to Default button restores character-specific default layout. Default layouts configured per character: Observer gets accounts/stats focus, Planner gets envelope widgets, Saver gets goal widgets. Widget container component with title, module attribution badge, and responsive sizing. API routes created for widget data fetching. All widgets fetch their own data via server queries. Responsive grid reflows to single column on mobile. npm run check passes clean.

**Sprint 10 — 2026-02-04** — Statistics Module complete. Full statistics page with three tabs: Spending (pie chart category breakdown, top 5 categories with progress bars, detailed category table), Cash Flow (6-month income vs expenses bar chart with net cash flow line overlay, period-over-period comparison table), and Trends (daily spending area chart, monthly spending trend bar chart, monthly summary table). Period selector with options: This Month, Last Month, Last 3 Months, Last 6 Months, This Year, and Custom Range (calendar picker). All charts use Recharts with tooltips and responsive sizing. Server queries for statistics with efficient aggregation (getSpendingByCategory, getMonthlyCashFlow, getDailySpending, getSpendingTrends, getTopCategories, getPeriodComparison). Dashboard widgets added to statistics module: Spending Trend (6-month line chart), Period Comparison (current vs previous), Top Categories (top spending categories with progress bars). API routes created for widget data fetching. Module-aware sections show envelope/goal stats when those modules are active. npm run check passes clean.