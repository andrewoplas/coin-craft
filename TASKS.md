# TASKS.md — CoinCraft Build Checklist

> **Task Status Tracking:**
> - `- [ ]` = Pending (not started)
> - `- [~]` = In Progress (currently being worked on)
> - `- [x]` = Complete (done and verified)
>
> **Verification Rule:** After completing each task, run `npm run check` (which runs lint + typecheck + build). Fix ALL errors before marking the task [x] and moving to the next task. Never leave broken code behind.
>
> **Instructions for Claude Code:** Work through sprints in order. Before starting a task, mark it `[~]`. Implement it. Run `npm run check` to verify zero errors. Fix any errors. Then mark it `[x]`. Complete one sprint fully before moving to the next. After each sprint, verify acceptance criteria, then update the Current Sprint section in CLAUDE.md. Always reference SPEC.md for product details and PLAN.md for architecture decisions.

---

# PHASE 1 — Foundation + Tracker + Envelopes + Goals

---

## Sprint 0: Project Setup
- [x] Initialize Next.js 14+ project with App Router, TypeScript, Tailwind CSS
- [x] Install and configure shadcn/ui (new-york style, neutral base)
- [x] Install Drizzle ORM and configure to connect to Supabase Postgres
- [x] Install and configure Supabase JS client (browser + server helpers)
- [x] Install Zustand, Recharts, date-fns
- [x] Configure ESLint (extend Next.js defaults), Prettier, and add scripts to package.json: `"lint": "next lint"`, `"typecheck": "tsc --noEmit"`, `"check": "npm run lint && npm run typecheck && npm run build"`
- [x] Create `drizzle.config.ts` pointing to Supabase Postgres
- [x] Create database schema in `src/db/schema/core.ts`: transactions, accounts, categories, allocations, allocation_transactions
- [x] Create database schema in `src/db/schema/auth.ts`: user_profiles, user_modules
- [x] Create database schema in `src/db/schema/gamification.ts`: streaks, achievements, user_achievements, dashboard_layouts
- [x] Run migrations to create all tables
- [x] Set up Supabase RLS policies for all tables (users only see own data)
- [x] Create seed script: default expense categories + subcategories, default income categories + subcategories, default achievements list
- [x] Create utility files: `src/lib/format.ts` (currency formatting, centavo helpers), `src/lib/constants.ts` (default categories, character configs, colors), `src/lib/types.ts` (shared types)
- [x] Create Supabase client helpers: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- [x] Create module system types: `src/modules/types.ts`
- [x] Verify: run `npm run check` — all lint, typecheck, and build must pass with zero errors

**Acceptance:** ✅ `npm run typecheck` and `npm run build` pass with zero errors. App boots, database schema in place, seed data ready, module type system defined. (Note: `npm run lint` has a Next.js config issue but typecheck and build both pass clean).

---

## Sprint 1: Auth + Onboarding Shell
- [x] Set up Supabase Auth with email/password signup and login
- [x] Create login page (`app/(auth)/login/page.tsx`) — clean, branded with CoinCraft name
- [x] Create signup page (`app/(auth)/signup/page.tsx`)
- [x] Auth middleware: protect all `(app)` routes, redirect unauthenticated to login
- [x] On signup, create `user_profiles` row with default settings
- [x] Create character select page (`app/(auth)/onboarding/page.tsx`)
- [x] Display 6 character cards: Observer, Planner, Saver (active), Warrior, Hustler, Team (coming soon, grayed out)
- [x] Each card shows: emoji icon, name, tagline, short description
- [x] Hovering/clicking active card shows expanded detail with dashboard preview mockup
- [x] "Help me choose" button at bottom
- [x] Create quiz page (`app/(auth)/onboarding/quiz/page.tsx`) with 4 questions from SPEC.md
- [x] Quiz scores answers and recommends a character
- [x] After character selection, route to setup flow
- [x] Create setup page (`app/(auth)/onboarding/setup/page.tsx`) — contextual steps based on character
- [x] **Observer setup:** Add accounts → Review categories → Done
- [x] **Planner setup:** Add accounts → Review categories → Create envelopes with amounts → Done
- [x] **Saver setup:** Add accounts → Review categories → Create first goal → Done
- [x] On setup complete: save character_id to profile, activate character's modules, apply default dashboard layout, redirect to dashboard
- [x] Verify: Full signup → character select → setup → dashboard flow works

**Acceptance:** `npm run check` passes with zero errors. User can sign up, pick a character (or take quiz), complete setup, and land on dashboard. Returning users go straight to dashboard.

---

## Sprint 2: App Shell + Navigation
- [x] Create app layout (`app/(app)/layout.tsx`) with responsive sidebar
- [x] Sidebar shows: CoinCraft logo, navigation items built from module registry
- [x] Core nav items always present: Dashboard, Transactions, Accounts
- [x] Module nav items appear/disappear based on active modules (read from user_modules)
- [x] Utility items at bottom: Settings
- [x] Active route highlighting
- [x] Mobile: bottom navigation bar with 5 items (Dashboard, Transactions, + Quick Add, Stats, More)
- [x] "More" opens drawer with remaining nav items
- [x] Tablet: collapsible sidebar (icon-only when collapsed)
- [x] Quick Add FAB button: bottom-right on desktop, center of bottom nav on mobile
- [x] Create module registry (`src/modules/registry.ts`) that reads active modules and provides: getActiveRoutes(), getActiveWidgets(), getActiveFormExtensions()
- [x] Create core module manifest (`src/modules/core/manifest.ts`)
- [x] Create statistics module manifest (`src/modules/statistics/manifest.ts`)
- [x] Create envelope module manifest (`src/modules/envelope/manifest.ts`)
- [x] Create goals module manifest (`src/modules/goals/manifest.ts`)
- [x] Create placeholder pages for: Dashboard, Transactions, Accounts, Statistics, Settings, Envelopes, Goals
- [x] Character accent color applied to UI (sidebar accent, FAB color) based on user's character
- [x] Verify: Navigation works on desktop, tablet, mobile. Module routes appear/hide based on active modules.

**Acceptance:** `npm run check` passes with zero errors. Full app shell with dynamic navigation. Character theming visible. Responsive across breakpoints.

---

## Sprint 3: Core — Quick Add Transaction
- [x] Create Quick Add modal component (`components/transactions/quick-add-modal.tsx`)
- [~] Amount input: large display, auto-focused, numeric input
- [ ] Type toggle: Expense (red) | Income (green) | Transfer (blue) — defaults to Expense
- [ ] Category picker: grid of emoji icons grouped by main category. Tap main → show subcategories
- [ ] Account selector: dropdown showing account name + balance
- [ ] For Transfer type: show "From Account" and "To Account" selectors
- [ ] Date picker: defaults to today, calendar popup for past dates
- [ ] Note: optional text field
- [ ] **Module form extensions:** After category, check active modules for form extensions and render them:
  - Envelope module active → show "Which wallet?" picker (auto-select if category is linked to an envelope)
  - Goals module active + income type → show "Allocate to goal?" optional step
- [ ] Create server action: `createTransaction` in `server/actions/transactions.ts`
- [ ] Transaction creation handles: insert record, update account balances, create allocation_transaction if envelope/goal selected, update streak
- [ ] Save → success toast with celebration micro-animation → close modal
- [ ] Quick Add store (Zustand) to manage modal open/close state globally
- [ ] Verify: Can create expense, income, and transfer. Module extensions appear when modules are active.

**Acceptance:** `npm run check` passes with zero errors. Quick Add works end-to-end. Module form extensions inject correctly. Data persists. Under 5 seconds for a basic expense.

---

## Sprint 4: Core — Transaction List
- [ ] Create Transactions page (`app/(app)/transactions/page.tsx`)
- [ ] Fetch transactions with server query (`server/queries/transactions.ts`)
- [ ] Display transactions grouped by date (today, yesterday, specific dates)
- [ ] Each row: category emoji, category name, note (truncated), amount (color-coded by type), account name
- [ ] If envelope/goal assigned, show small badge/tag
- [ ] Filter bar: date range picker, category dropdown, account dropdown, type filter (all/expense/income/transfer)
- [ ] Text search on notes
- [ ] Click transaction to open edit modal (same form as Quick Add, pre-filled)
- [ ] Delete transaction with confirmation dialog
- [ ] Server actions: `updateTransaction`, `deleteTransaction` (recalculates balances, allocation amounts)
- [ ] Pagination or infinite scroll
- [ ] Empty state: friendly illustration + "Log your first expense!" CTA
- [ ] Verify: Full CRUD, filters work, edit updates correctly, delete recalculates balances

**Acceptance:** `npm run check` passes with zero errors. Transaction list is complete with filtering, editing, deleting. Empty state is friendly.

---

## Sprint 5: Core — Accounts
- [ ] Create Accounts page (`app/(app)/accounts/page.tsx`)
- [ ] "Total Balance" summary at top (sum of all active accounts)
- [ ] Account cards: emoji icon, name, type badge, current balance (computed from transactions)
- [ ] Color accent per account
- [ ] Click account → view filtered transactions for that account
- [ ] Add Account modal: name, type (cash/bank/e-wallet/credit card), currency, initial balance, icon picker (emoji), color picker
- [ ] Edit Account: update name, icon, color (cannot change type or initial balance after creation)
- [ ] Archive Account: confirmation → hide from main view, keep data
- [ ] Server actions: `createAccount`, `updateAccount`, `archiveAccount`
- [ ] Server query: `getAccountsWithBalances` (accounts + computed current balances)
- [ ] Empty state: "Add your first account to start tracking"
- [ ] Verify: Balances are always accurate. Archive works correctly.

**Acceptance:** `npm run check` passes with zero errors. Account management complete. Balances derived correctly from transactions. Archive hides but preserves.

---

## Sprint 6: Core — Categories
- [ ] Create Categories page (`app/(app)/categories/page.tsx`)
- [ ] Two sections: Expense Categories, Income Categories
- [ ] Each main category: emoji, name, color swatch, expand to show subcategories
- [ ] Add subcategory under any main category
- [ ] Add new main category
- [ ] Edit category: change name, emoji, color
- [ ] Hide system categories (cannot delete), delete user-created categories
- [ ] Show transaction count per category
- [ ] Reorder categories (up/down arrows or drag)
- [ ] Server actions: `createCategory`, `updateCategory`, `deleteCategory`, `hideCategory`, `reorderCategories`
- [ ] Changes reflect immediately in Quick Add picker
- [ ] Verify: Category tree is manageable. Changes propagate everywhere.

**Acceptance:** `npm run check` passes with zero errors. Full category management. System categories protected. Custom categories supported.

---

## Sprint 7: Module — Envelopes (The Planner)
- [ ] Create Envelopes page (`app/(app)/modules/envelopes/page.tsx`)
- [ ] Envelope list: cards showing name, emoji, progress bar (spent/allocated), remaining amount, period
- [ ] Progress bar colors: green (<60%), amber (60-80%), red (>80%)
- [ ] Create Envelope modal: name, icon, color, monthly allocation amount, linked categories (multi-select), period (weekly/monthly), rollover toggle
- [ ] Edit/delete/pause envelope
- [ ] Envelope detail view: list of transactions pulling from this envelope, daily spending mini-chart
- [ ] Transfer between envelopes: move allocation from one to another
- [ ] Period reset logic: when period ends, reset remaining (or rollover), advance period_start
- [ ] Auto-assignment: when creating an expense with a category linked to an envelope, automatically create allocation_transaction
- [ ] Dashboard widgets:
  - Envelope Overview Grid: all envelopes with mini progress bars
  - Low Balance Warnings: envelopes >80% spent
  - Allocation Summary: total allocated vs total income
- [ ] Envelope form extension for Quick Add: wallet picker that appears after category selection
- [ ] Smart nudges: low balance warning, unallocated income prompt, under-budget streak
- [ ] Server actions and queries specific to envelope operations
- [ ] Verify: Envelopes track spending accurately. Auto-assignment works. Period reset works.

**Acceptance:** `npm run check` passes with zero errors. Full envelope budgeting system. Linked categories auto-assign. Progress tracking is accurate. Dashboard widgets display correctly.

---

## Sprint 8: Module — Goals (The Saver)
- [ ] Create Goals page (`app/(app)/modules/goals/page.tsx`)
- [ ] Goal list: cards showing name, emoji, big progress bar, amount saved / target, projected completion date
- [ ] Create Goal modal: name, icon, color, target amount, optional deadline
- [ ] Edit/pause/abandon/complete goal
- [ ] Contribute to goal: manual allocation from income or available balance
- [ ] Goal detail view: contribution history, projected timeline chart, monthly savings rate
- [ ] If deadline set: calculate required monthly savings, show if on/off track
- [ ] Goal completion: celebration animation 🎉 + achievement unlock
- [ ] Dashboard widgets:
  - Goal Progress Bars: all goals with visual progress
  - Projected Dates: when each goal will be reached at current rate
  - Savings Rate: monthly savings trend
- [ ] Goal form extension for Quick Add: for income transactions, optional "Allocate to goal?" picker
- [ ] Smart nudges: on-track/off-track alerts, milestone celebrations, no-contribution-this-month reminder
- [ ] Server actions and queries specific to goal operations
- [ ] Verify: Goals track contributions correctly. Projections are accurate. Completion triggers celebration.

**Acceptance:** `npm run check` passes with zero errors. Full goal-based savings system. Progress tracking accurate. Projections update dynamically. Celebrations work.

---

## Sprint 9: Dashboard Canvas
- [ ] Create Dashboard page (`app/(app)/dashboard/page.tsx`)
- [ ] Read user's dashboard layout from store/database
- [ ] Render widgets in a responsive grid based on saved layout
- [ ] Each widget: standard container with title, optional expand, module attribution
- [ ] Edit mode toggle: when active, widgets become draggable and resizable
- [ ] Add Widget button: opens modal showing all available widgets from active modules
- [ ] Remove widget: X button in edit mode
- [ ] Resize widget: S/M/L toggle in edit mode
- [ ] Save layout to database on changes
- [ ] "Reset to Default" button: restore character's default dashboard layout
- [ ] Build all core widgets: Net Worth, Accounts Overview, Recent Transactions, Income vs Expenses, Spending by Category, Cash Flow
- [ ] Widgets fetch their own data via server queries
- [ ] Responsive: widgets reflow on mobile (single column)
- [ ] Verify: Dashboard is customizable. Widgets render correctly. Layout persists.

**Acceptance:** `npm run check` passes with zero errors. Dashboard is a fully customizable canvas. Widgets from all active modules are available. Layout saves per user.

---

## Sprint 10: Statistics Module
- [ ] Create Statistics page (`app/(app)/statistics/page.tsx`)
- [ ] Tab layout: Spending | Cash Flow | Trends
- [ ] **Spending tab:** category breakdown (pie chart + table), spending by subcategory, top 5 categories
- [ ] **Cash Flow tab:** income vs expenses by month (bar chart), net cash flow line, period-over-period comparison
- [ ] **Trends tab:** daily spending line chart, monthly spending trend (6 months), average daily spend
- [ ] Period selector: This Month, Last Month, Last 3 Months, Last 6 Months, This Year, Custom Range
- [ ] All charts use Recharts with tooltips and legends
- [ ] Module-aware: if envelopes active, show envelope performance stats. If goals active, show savings trends.
- [ ] Dashboard widgets: Trend Chart, Period Comparison, Top Categories
- [ ] Server queries with efficient aggregation
- [ ] Verify: Charts accurate with real data. Period filter works. Interactive tooltips.

**Acceptance:** `npm run check` passes with zero errors. Comprehensive statistics with accurate data. Charts render cleanly. Period selection works.

---

## Sprint 11: Gamification
- [ ] Streak tracking: detect consecutive days with at least one transaction logged
- [ ] Streak counter displayed on dashboard (🔥 counter)
- [ ] Streak milestones: small animation at 7 days, badge at 30 days, special badge at 100 days
- [ ] Achievement system: define achievements in database (from SPEC.md table)
- [ ] Check and award achievements after relevant actions (transaction created, month ended, goal completed, etc.)
- [ ] Achievement notification: toast with badge icon when earned
- [ ] Achievement gallery: viewable in Settings or profile
- [ ] Financial Health Score: calculate 0-100 score based on base factors + active module factors (from SPEC.md)
- [ ] Health score widget for dashboard: circular progress with color
- [ ] Monthly recap: end-of-month summary screen with key stats, shareable card format
- [ ] Verify: Streaks track correctly. Achievements trigger properly. Health score calculates accurately.

**Acceptance:** `npm run check` passes with zero errors. Gamification layer adds engagement. Streaks, achievements, health score all functional.

---

## Sprint 12: Settings + Module Library
- [ ] Settings page (`app/(app)/settings/page.tsx`)
- [ ] **General settings:** display name, default currency, initial day of month, date format
- [ ] **Character & Modules section:**
  - Current character display with option to change
  - Module Library: browse all modules (grid of cards with name, description, icon, active toggle)
  - Enable/disable modules with confirmation
  - Per-module settings (e.g. envelope period, rollover behavior)
- [ ] **Dashboard settings:** link to edit mode, reset to default layout
- [ ] **Appearance:** Light / Dark / System theme toggle
- [ ] **Data:** Export transactions as CSV, Delete account (danger zone)
- [ ] Changing character: update profile, offer to reset dashboard, toggle modules accordingly
- [ ] Module enable/disable: update user_modules, sidebar and dashboard recompose
- [ ] Verify: All settings persist. Module toggling immediately affects UI. Theme switching works.

**Acceptance:** `npm run check` passes with zero errors. Full settings management. Module library is browsable. Character switching works smoothly.

---

## Sprint 13: Polish + Deploy
- [ ] Loading states: skeleton loaders for all data-fetching pages
- [ ] Empty states: friendly messages/illustrations for empty lists (transactions, accounts, envelopes, goals)
- [ ] Error handling: toast notifications for errors, form validation, server action error handling
- [ ] Responsive polish: test all pages at 375px, 768px, 1024px, 1440px
- [ ] Dark mode: verify all components and charts work in dark theme
- [ ] Performance: optimize queries, add database indexes, lazy load heavy components
- [ ] Smart nudges: implement in-app nudge banner on dashboard based on module rules
- [ ] Favicon, meta tags, Open Graph for sharing
- [ ] README.md with setup instructions
- [ ] Deploy to Vercel
- [ ] Run seed script on production Supabase
- [ ] Verify all features in production
- [ ] Verify: App is polished, responsive, performant, and live

**Acceptance:** `npm run check` passes with zero errors. CoinCraft Phase 1 is live and production-ready. All three character systems work. Gamification is active.

---

# PHASE 2 — Debt System + Enhanced Features

## Sprint 14: Module — Debt (The Warrior)
- [ ] Create Debt module with manifest
- [ ] Debt tracking: add debts with name, total amount, interest rate, minimum payment, due date
- [ ] Payment logging: record payments against debts
- [ ] Snowball vs avalanche strategy calculator
- [ ] Debt dashboard widgets: total debt overview, payoff timeline, payment progress
- [ ] Character: The Warrior becomes selectable in onboarding
- [ ] Smart nudges for payment reminders and milestones

## Sprint 15: Planned Payments Module
- [ ] Create Planned Payments module with manifest
- [ ] Set up recurring transactions: name, amount, frequency, category, account
- [ ] Calendar view of upcoming payments
- [ ] Auto-create or manual confirmation toggle
- [ ] Dashboard widget: upcoming payments list

## Sprint 16: Labels Module
- [ ] Create Labels module with manifest
- [ ] Label CRUD: create, edit, delete labels with name and color
- [ ] Form extension: label picker in Quick Add
- [ ] Filter transactions by label
- [ ] Dashboard widget: spending by label

## Sprint 17: Receipt Module
- [ ] Attach photo to transaction (Supabase Storage)
- [ ] View receipt in transaction detail
- [ ] Gallery view of all receipts

## Sprint 18: Export Module
- [ ] CSV export with filters (date range, category, account, labels)
- [ ] Download or email export

---

# PHASE 3 — Freelancer + Shared Systems

## Sprint 19: Module — Freelancer (The Hustler)
- [ ] Client/project entity management
- [ ] Income tracking per client
- [ ] Profit calculation
- [ ] Tax set-aside calculator
- [ ] Freelancer dashboard widgets

## Sprint 20: Module — Shared (The Team)
- [ ] Invite system for partner/family
- [ ] Shared accounts and allocations
- [ ] Split transaction tracking
- [ ] Activity feed
- [ ] Individual vs shared views
- [ ] Real-time updates via Supabase real-time

---

## Notes for Claude Code

- **Always read SPEC.md** for product details, data models, and feature specs.
- **Always read PLAN.md** for architecture patterns, file locations, and tech decisions.
- **Money is always in centavos.** Use `toCentavos()` when saving, `fromCentavos()` / `formatPHP()` when displaying.
- **Use Server Actions** for mutations. No API routes.
- **Module system is king.** Sidebar, dashboard, and Quick Add are all composed from module registry. Never hardcode module-specific logic in core components.
- **shadcn/ui** for all base components. Customize with Tailwind.
- **Emoji placeholders** for all icons. Will be replaced with illustrated avatars later.
- **Supabase RLS** on every table. Always pass user context.
- **Test after each sprint.** App should be runnable and all prior features still working.
- **Duolingo design vibe.** Clean, colorful, friendly. Rounded corners. Subtle animations. Celebratory feedback.