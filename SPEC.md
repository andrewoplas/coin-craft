# SPEC.md — CoinCraft

## Overview

**CoinCraft** is a modular expense tracker where users choose a financial "character" that shapes their experience, then customize further by enabling modules. The character is your origin story, not your permanent class. The app adapts to how you think about money.

**Design Vibe:** Duolingo-style — clean, modern, colorful, friendly with subtle game elements. Not cartoonish, not corporate. Approachable and fun.

**Currency:** PHP (Philippine Peso) as default. Multi-currency support planned.

**Platform:** Web (NextJS). Mobile planned for future.

**Users:** Multi-user with authentication. Each user has their own data, characters, and module configuration.

---

## Core Concepts

The core engine owns four primitives. Everything else is a module.

### 1. Transactions (Records)

The atomic unit. Money moves in, out, or between places. Every module reads from transactions.

| Field            | Type     | Required | Notes                                      |
| ---------------- | -------- | -------- | ------------------------------------------ |
| `id`             | uuid     | auto     | Primary key                                |
| `user_id`        | uuid     | auto     | Owner (from Supabase Auth)                 |
| `type`           | enum     | yes      | `expense`, `income`, `transfer`            |
| `amount`         | integer  | yes      | Always positive, in centavos               |
| `currency`       | string   | yes      | Default: `PHP`                             |
| `category_id`    | uuid     | yes      | Links to category                          |
| `account_id`     | uuid     | yes      | Source account                             |
| `to_account_id`  | uuid     | no       | Destination account (transfers only)       |
| `date`           | date     | yes      | When it happened                           |
| `note`           | text     | no       | Optional description                       |
| `created_at`     | datetime | auto     |                                            |
| `updated_at`     | datetime | auto     |                                            |

**Rules:**
- Amounts stored as integers in centavos (₱150.50 = 15050)
- Transfers create a single transaction record with both `account_id` and `to_account_id`
- Deleting a transaction recalculates affected account balances
- Transactions are the single source of truth — all balances and reports derive from them

### 2. Accounts

Where money physically lives. Real-world financial accounts.

| Field             | Type    | Required | Notes                                         |
| ----------------- | ------- | -------- | --------------------------------------------- |
| `id`              | uuid    | auto     |                                               |
| `user_id`         | uuid    | auto     | Owner                                         |
| `name`            | string  | yes      | e.g. "GCash", "BDO Savings"                  |
| `type`            | enum    | yes      | `cash`, `bank`, `e_wallet`, `credit_card`     |
| `currency`        | string  | yes      | Default: `PHP`                                |
| `initial_balance` | integer | yes      | Starting balance in centavos                  |
| `icon`            | string  | no       | Emoji placeholder (e.g. "💵", "🏦")           |
| `color`           | string  | no       | Hex color for UI                              |
| `is_archived`     | boolean | no       | Soft delete — hide but keep data              |
| `sort_order`      | integer | no       | Custom ordering                               |
| `created_at`      | datetime| auto     |                                               |

**Computed:**
- `current_balance` = `initial_balance` + sum(income to this account) - sum(expenses from this account) + sum(transfers in) - sum(transfers out)

**Rules:**
- Credit card accounts can have negative balances
- Archived accounts are hidden from selectors but retain all transaction history
- Cannot delete an account that has transactions — must archive instead

### 3. Categories

What the money was for. Hierarchical: main categories with subcategories.

| Field        | Type    | Required | Notes                                |
| ------------ | ------- | -------- | ------------------------------------ |
| `id`         | uuid    | auto     |                                      |
| `user_id`    | uuid    | auto     | Owner (null for system defaults)     |
| `name`       | string  | yes      |                                      |
| `type`       | enum    | yes      | `expense`, `income`                  |
| `icon`       | string  | no       | Emoji (e.g. "🍽️", "🚗")             |
| `color`      | string  | no       | Hex color                            |
| `parent_id`  | uuid    | no       | null = main category, otherwise sub  |
| `sort_order` | integer | no       | Custom ordering                      |
| `is_system`  | boolean | no       | true = default, cannot delete        |
| `is_hidden`  | boolean | no       | Hide without deleting                |
| `created_at` | datetime| auto     |                                      |

**Default Expense Categories:**

| Main Category         | Icon | Subcategories                                          |
| --------------------- | ---- | ------------------------------------------------------ |
| Food & Dining         | 🍽️  | Groceries, Restaurants, Coffee, Delivery, Snacks       |
| Transportation        | 🚗  | Gas/Fuel, Ride-hailing, Parking, Maintenance, Tolls    |
| Health & Fitness      | 💪  | Gym, Sports, Supplements, Medical, Pharmacy            |
| Housing               | 🏠  | Rent, Electric, Water, Internet, Maintenance           |
| Shopping              | 🛍️  | Clothing, Tech/Gadgets, Household, Personal Care       |
| Entertainment         | 🎮  | Streaming, Games, Events, Hobbies                      |
| Bills & Subscriptions | 📱  | Phone Plan, App Subscriptions, Insurance               |
| Education             | 📚  | Courses, Books, Tools                                  |
| Social                | 🎁  | Gifts, Celebrations, Dates, Hangouts                   |
| Other                 | 📦  | Uncategorized                                          |

**Default Income Categories:**

| Main Category   | Icon | Subcategories                       |
| --------------- | ---- | ----------------------------------- |
| Salary          | 💰  | Base Pay, Bonuses, 13th Month       |
| Freelance       | 💻  | Client Work, Side Projects          |
| Investments     | 📈  | Dividends, Interest, Capital Gains  |
| Other Income    | 🎯  | Refunds, Cash Back, Gifts Received  |

**Rules:**
- System default categories cannot be deleted, only hidden
- Users can add custom subcategories under any main category
- Users can add entirely new main categories
- Each category belongs to a type (expense or income), no mixing

### 4. Allocations

The flexible container that modules give meaning to. An allocation is a named bucket that money can be assigned to. What it "means" depends on which module uses it.

| Field            | Type     | Required | Notes                                           |
| ---------------- | -------- | -------- | ----------------------------------------------- |
| `id`             | uuid     | auto     |                                                 |
| `user_id`        | uuid     | auto     | Owner                                           |
| `module_type`    | string   | yes      | Which module owns this: `envelope`, `goal`, etc |
| `name`           | string   | yes      | e.g. "Fun Money", "Japan Trip", "BPI CC Debt"  |
| `icon`           | string   | no       | Emoji                                           |
| `color`          | string   | no       | Hex color                                       |
| `target_amount`  | integer  | no       | Target in centavos (for goals, budgets)         |
| `current_amount` | integer  | no       | Current allocated amount in centavos            |
| `period`         | enum     | no       | `weekly`, `monthly`, `yearly`, `custom`, `none` |
| `period_start`   | date     | no       | When the current period started                 |
| `deadline`       | date     | no       | Target date (for goals)                         |
| `category_ids`   | uuid[]   | no       | Linked categories (for envelope auto-tracking)  |
| `is_active`      | boolean  | no       | Active or paused                                |
| `config`         | jsonb    | no       | Module-specific configuration                   |
| `sort_order`     | integer  | no       | Custom ordering                                 |
| `created_at`     | datetime | auto     |                                                 |
| `updated_at`     | datetime | auto     |                                                 |

**How modules use allocations:**

| Module    | Allocation means | target_amount        | current_amount          | period    | category_ids         |
| --------- | ---------------- | -------------------- | ----------------------- | --------- | -------------------- |
| Envelope  | Wallet/Envelope  | Monthly budget limit | Remaining balance       | monthly   | Linked categories    |
| Goals     | Savings Goal     | Target savings       | Amount saved so far     | none      | Not used             |
| Debt      | A debt to pay off | Total debt amount    | Remaining debt          | none      | Not used             |

**Rules:**
- The `config` JSONB field holds module-specific data that doesn't fit the common fields
- Allocations are always owned by a specific module type
- Deleting a module deactivates its allocations but doesn't delete them (user can reactivate)

### Allocation Transactions

Links transactions to allocations. A transaction can be split across multiple allocations.

| Field            | Type    | Required | Notes                                |
| ---------------- | ------- | -------- | ------------------------------------ |
| `id`             | uuid    | auto     |                                      |
| `transaction_id` | uuid    | yes      | Links to transaction                 |
| `allocation_id`  | uuid    | yes      | Links to allocation                  |
| `amount`         | integer | yes      | Amount in centavos assigned to this  |
| `created_at`     | datetime| auto     |                                      |

---

## Characters & Systems

### Overview

Characters are the onboarding entry point. Each character pre-configures a system (set of modules + dashboard layout + setup flow). Users can always customize after.

Characters are **origin stories, not permanent classes.** Switching or mixing is always possible.

### The Observer 👁️ (Tracker System)

**Tagline:** "Track, learn, adjust. Knowledge is power."

**Personality:** Curious, reflective, low-maintenance.

**What it enables:**
- Core only (transactions, accounts, categories)
- Statistics module (basic charts and reports)
- Smart nudges based on spending patterns

**Dashboard shows:**
- Recent transactions
- This month: total income, total expenses, net cash flow
- Spending by category (pie/bar chart)
- Week-over-week spending comparison

**Onboarding setup:**
1. Add your accounts (where does your money live?)
2. Review default categories (tweak if you want)
3. Done — start logging

**Best for:** People who just want visibility into their spending without committing to budgets or plans.

### The Planner 📋 (Envelope System)

**Tagline:** "Every peso has a job. You decide where it goes."

**Personality:** Disciplined, proactive, in control.

**What it enables:**
- Core + Envelope module
- Statistics module
- Smart nudges for wallet balances

**Dashboard shows:**
- Wallet/envelope overview with remaining balances (primary view)
- Total allocated vs total income
- Wallets running low (warnings)
- Recent transactions with wallet labels

**Onboarding setup:**
1. Add your accounts
2. Review categories
3. Create your wallets (suggest common ones: Bills, Food, Fun, Transport, Savings)
4. Set monthly amounts per wallet
5. Done — start spending from wallets

**Envelope module specifics:**
- Each envelope/wallet has a monthly allocation amount
- When you log an expense, you pick which wallet it comes from
- Wallets can be linked to categories for auto-assignment (Food expense auto-pulls from Food wallet)
- Wallets reset each period (weekly/monthly) — unspent amount can roll over or reset to zero (user preference)
- Transfer between wallets is a conscious action
- Visual: progress bars showing remaining balance per wallet

**Best for:** People who tend to overspend and want hard limits on spending categories.

### The Saver 🎯 (Goals System)

**Tagline:** "Eyes on the prize. Every peso gets you closer."

**Personality:** Motivated, goal-oriented, patient.

**What it enables:**
- Core + Goals module
- Statistics module
- Smart nudges for savings progress

**Dashboard shows:**
- Goal progress bars (primary view)
- Projected completion dates
- How much to save per month to hit each goal
- Recent savings contributions
- Total saved across all goals

**Onboarding setup:**
1. Add your accounts
2. Review categories
3. Create your first goal (what are you saving for? how much? by when?)
4. Done — start saving

**Goals module specifics:**
- Each goal has a name, target amount, optional deadline, and icon
- Users manually allocate money to goals (from income or transfers)
- If a deadline is set, the app calculates required monthly savings rate
- Progress shown as visual progress bar with percentage
- Projected completion date based on current savings rate
- Goals can be paused, completed (celebrated! 🎉), or abandoned
- No goal? Income just goes to general balance — no pressure

**Best for:** People saving for specific things — a trip, a gadget, an emergency fund, a life milestone.

### The Warrior ⚔️ (Debt Payoff System) — Phase 2

**Tagline:** "Fight your way to freedom. Every payment is a victory."

**Sketched concept:** Track debts, payment schedules, interest rates. Snowball vs avalanche strategies. Progress visualization.

### The Hustler 🚀 (Freelancer System) — Phase 3

**Tagline:** "Multiple streams, one clear picture. Know your real profit."

**Sketched concept:** Track income by client/project, calculate profit margins, tax set-aside, irregular income smoothing.

### The Team 🤝 (Shared/Family System) — Phase 3

**Tagline:** "Your money, managed together."

**Sketched concept:** Shared accounts, split tracking, individual allowances, joint goals, activity feed.

---

## Modules

### Module Architecture

Each module is a self-contained unit that declares what it provides to the app.

**A module provides:**
- **Routes:** Pages added to the sidebar (e.g. Budgets page, Goals page)
- **Dashboard Widgets:** Components that can be placed on the dashboard canvas
- **Form Extensions:** Additional fields injected into the Quick Add transaction form
- **Allocation Type:** If the module uses allocations, what type it creates
- **Settings:** Module-specific user preferences
- **Nudges:** Smart notification rules based on module data

**Module manifest structure (conceptual):**
```
{
  id: "envelope",
  name: "Envelopes",
  description: "Allocate money into purpose-based wallets",
  icon: "📋",
  routes: [{ path: "/envelopes", label: "Envelopes", icon: "Wallet" }],
  dashboardWidgets: ["envelope-overview", "envelope-warnings", "envelope-allocation"],
  formExtensions: ["envelope-picker"],
  allocationType: "envelope",
  settings: { resetBehavior: "zero | rollover", period: "weekly | monthly" }
}
```

### Core Modules (Always Available)

**Statistics Module**
- Spending by category (pie chart, bar chart)
- Income vs expenses over time (line chart)
- Period comparisons (this month vs last month)
- Trend analysis (spending going up or down?)
- Available in all systems, adapts widgets based on active modules

### System Modules

**Envelope Module** (The Planner)
- Create/edit/delete envelopes
- Assign monthly allocation amounts
- Link envelopes to categories
- Period reset (configurable: weekly/monthly)
- Rollover toggle per envelope
- Transfer between envelopes
- Dashboard widgets: envelope overview grid, warnings for low envelopes, allocation summary

**Goals Module** (The Saver)
- Create/edit/complete/abandon goals
- Set target amount and optional deadline
- Manual contributions to goals
- Progress tracking with projections
- Dashboard widgets: goal progress bars, projected dates, savings rate

**Debt Module** (The Warrior) — Phase 2
- Track debts with balances and interest rates
- Payment scheduling
- Snowball/avalanche strategy calculator
- Dashboard widgets: debt overview, payoff timeline, total debt meter

**Freelancer Module** (The Hustler) — Phase 3
- Client/project entities
- Income tracking per client
- Profit calculation (income - business expenses)
- Tax set-aside calculator
- Dashboard widgets: profit overview, client breakdown, tax reserve

**Shared Module** (The Team) — Phase 3
- Invite partner/family members
- Shared accounts and allocations
- Split transaction tracking
- Activity feed
- Individual vs shared views

### Utility Modules (Available to All)

**Labels Module**
- Cross-cutting tags for any transaction
- Filter by label across all views
- Useful for custom grouping: "vacation", "reimbursable", "impulse"

**Planned Payments Module**
- Recurring transaction scheduling
- Calendar view of upcoming payments
- Auto-create or confirm transactions
- Dashboard widget: upcoming payments list

**Export Module**
- CSV export of transactions
- Filtered exports (by date range, category, account)

**Receipt Module** — Phase 2
- Attach photos to transactions
- Stored in Supabase Storage

---

## Onboarding Flow

### Character Select Screen

Full-screen, game-style character selection. Visually striking.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              Welcome to CoinCraft ✨                  │
│         How do you want to manage your money?        │
│                                                      │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│   │  👁️     │   │  📋     │   │  🎯     │          │
│   │Observer │   │ Planner │   │  Saver  │          │
│   │         │   │         │   │         │          │
│   │ Track & │   │ Budget  │   │ Save    │          │
│   │ learn   │   │ every   │   │ toward  │          │
│   │         │   │ peso    │   │ goals   │          │
│   └─────────┘   └─────────┘   └─────────┘          │
│                                                      │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│   │  ⚔️     │   │  🚀     │   │  🤝     │          │
│   │Warrior  │   │ Hustler │   │  Team   │          │
│   │         │   │         │   │         │          │
│   │ Slay    │   │ Track   │   │ Manage  │          │
│   │ debt    │   │ profit  │   │ together│          │
│   │ SOON    │   │ SOON    │   │ SOON    │          │
│   └─────────┘   └─────────┘   └─────────┘          │
│                                                      │
│            [ 🤔 Help me choose ]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Phase 2/3 characters shown but grayed out with "Coming Soon" badge
- Each character card has the emoji (placeholder for illustrated avatar), name, tagline
- Hovering/tapping a card expands to show more detail and a dashboard preview
- "Help me choose" triggers the mini quiz

### Help Me Choose Quiz (3-4 Questions)

Quick, fun, personality-style questions:

**Q1: "You just got paid. What's your first move?"**
- Divide it into categories — I like knowing where every peso goes → Planner
- Check my balance and move on — I'll deal with it as I spend → Observer
- Put some aside for something I'm saving for → Saver

**Q2: "It's the middle of the month. You want to buy something fun. What do you think?"**
- Let me check if my Fun budget still has room → Planner
- I'll buy it and see where I stand at the end of the month → Observer
- Hmm, will this slow down my savings goal? → Saver

**Q3: "What would make you feel most in control of your money?"**
- Seeing exactly how much I can still spend in each area → Planner
- Understanding my spending patterns over time → Observer
- Watching my savings grow toward a target → Saver

**Q4: "What best describes your current money situation?"**
- I need structure to stop overspending → Planner
- I honestly don't know where my money goes → Observer
- I have something specific I want to save for → Saver

Score the answers and recommend the character with the highest match. Show the recommendation with a "Sounds like you're a [Character]! Start here?" confirmation.

### Post-Character Setup

After selecting a character, the setup flow is contextual (see each character's onboarding setup in the Characters section above). The steps are presented as a progress bar with friendly illustrations.

After setup, the user lands on their configured dashboard, ready to go.

---

## Dashboard

### Canvas Approach

The dashboard is a customizable grid where users arrange widgets. Each module provides widgets that can be added to the dashboard.

**Default layouts are set by the chosen character** but users can always customize:
- Add/remove widgets
- Rearrange widget positions
- Resize widgets (small/medium/large)

### Core Widgets (Always Available)

| Widget                | Size Options | Description                                    |
| --------------------- | ------------ | ---------------------------------------------- |
| Net Worth             | S / M        | Total balance across all accounts              |
| Accounts Overview     | M / L        | List of accounts with balances                 |
| Recent Transactions   | M / L        | Last 5-10 transactions                         |
| Income vs Expenses    | M / L        | Bar chart for current period                   |
| Spending by Category  | M / L        | Pie or bar chart                               |
| Cash Flow             | M            | Income minus expenses for current period       |
| Quick Stats           | S            | Transaction count, avg daily spend, etc        |

### Module Widgets

| Module     | Widgets                                                          |
| ---------- | ---------------------------------------------------------------- |
| Envelope   | Envelope Overview Grid, Low Balance Warnings, Allocation Summary |
| Goals      | Goal Progress Bars, Projected Dates, Savings Rate                |
| Statistics | Trend Chart, Period Comparison, Top Categories                   |
| Planned    | Upcoming Payments, Payment Calendar                              |
| Labels     | Spending by Label                                                |
| Debt       | Debt Overview, Payoff Timeline (Phase 2)                         |

---

## Quick Add Flow

The most important interaction in the entire app. Must be fast and frictionless.

### Base Flow (Core)

```
[+ Button] → Modal/Sheet opens
  → Amount input (large, auto-focused)
  → Type toggle: Expense | Income | Transfer
  → Category picker (grid of emoji icons, tap to select, second tap for subcategory)
  → Account selector
  → For Transfer: "To Account" selector appears
  → Date (defaults to today, tap to change)
  → Note (optional)
  → [Save] ✨
```

### Module Extensions

Active modules inject additional steps into the Quick Add flow:

| Module     | What it adds                                                    |
| ---------- | --------------------------------------------------------------- |
| Envelope   | "Which wallet?" picker after category (can auto-select based on category link) |
| Goals      | For income: "Allocate to goal?" optional step                   |
| Labels     | Tag selector (multi-select) before Save                         |
| Planned    | "Mark as planned payment?" toggle                               |

The form adapts based on what modules are active. If only core is active, it's dead simple. If multiple modules are on, additional fields appear but are always optional to keep speed.

### Smart Defaults

Over time, the Quick Add learns from patterns:
- Most-used categories appear first in the picker
- If you always log coffee as ₱180 from GCash under Food → Coffee, the app pre-fills
- Recently used accounts are prioritized in the selector

---

## Smart Nudges

Context-aware notifications/insights based on active modules and user behavior.

**Core nudges:**
- "You haven't logged anything today" (if streak is active)
- "You spent ₱X more this week compared to last week"
- "Your top category this month is [Food] at ₱X"

**Envelope nudges:**
- "Your Food wallet is 80% spent and it's only the 15th"
- "You have ₱X unallocated income — want to distribute it?"
- "Your Transport wallet has been under budget 3 months in a row — consider lowering it?"

**Goals nudges:**
- "At your current rate, you'll hit [Japan Trip] by [date]"
- "You're ₱X away from your [Emergency Fund] goal!"
- "You haven't contributed to any goal this month"

**Delivery:** In-app notification banner on dashboard. Not push notifications (web only for now).

---

## Gamification Elements

### Streaks 🔥

Track consecutive days of logging at least one transaction. Display streak counter on dashboard.

- 7-day streak: small celebration animation
- 30-day streak: badge earned
- 100-day streak: badge earned + special status

### Achievements 🏆

Milestone-based badges that celebrate financial behavior:

| Achievement              | Trigger                                      |
| ------------------------ | -------------------------------------------- |
| First Steps              | Log your first transaction                   |
| Consistency              | 7-day logging streak                         |
| Habit Formed             | 30-day logging streak                        |
| Legendary                | 100-day logging streak                       |
| Budget Keeper            | Stay within all envelopes for a full month   |
| Goal Getter              | Complete your first savings goal             |
| Penny Pincher            | Spend less than last month                   |
| Big Saver                | Save more than 20% of income in a month      |
| Category King            | Categorize 100 transactions                  |
| Multi-Crafter            | Enable 3+ modules                            |

### Monthly Recap

End-of-month summary screen (inspired by Spotify Wrapped):
- Total income and expenses
- Top spending category
- Biggest single expense
- Logging streak
- Module-specific highlights (envelopes stayed in budget, goal progress, etc.)
- Shareable card format (screenshot-friendly)

### Financial Health Score

A single 0-100 score reflecting overall financial health, adapted by active modules:

**Base factors:**
- Are you spending less than you earn? (+)
- Are you logging consistently? (+)
- Is your spending trending down or stable? (+)

**Envelope factors:**
- Are you staying within wallets? (+)
- How many wallets are overspent? (-)

**Goals factors:**
- Are you making regular contributions? (+)
- Are you on track to hit deadlines? (+)

**Display:** Circular progress indicator on dashboard with color (green/amber/red) and trend arrow.

---

## UI/UX Guidelines

### Design Principles

1. **Speed first.** Quick Add must be under 5 seconds for a basic expense.
2. **Duolingo-clean.** Friendly, colorful, approachable. No corporate stiffness.
3. **Character-driven.** The UI subtly reflects the user's character through accent colors and dashboard layout.
4. **Progressive disclosure.** Simple by default, power features available when needed.
5. **Celebration.** Positive reinforcement for good financial behavior. Animations, badges, streaks.

### Color System

**Base palette:**
- Background: `#FFFFFF` / `#F7F8FA` (light)
- Text: `#1A1B25` (primary), `#6B7280` (secondary)
- Border: `#E5E7EB`

**Semantic colors:**
- Income/Positive: `#10B981` (emerald green)
- Expense/Negative: `#EF4444` (red)
- Transfer: `#6366F1` (indigo)
- Warning: `#F59E0B` (amber)

**Character accent colors:**
- The Observer: `#3B82F6` (blue) — calm, analytical
- The Planner: `#8B5CF6` (purple) — strategic, in control
- The Saver: `#10B981` (green) — growth, progress
- The Warrior: `#EF4444` (red) — fierce, determined
- The Hustler: `#F59E0B` (amber) — energetic, resourceful
- The Team: `#EC4899` (pink) — warm, collaborative

**Category colors:** Each category has a unique color from a predefined palette for chart consistency.

### Typography

- Headings: Bold, rounded sans-serif (friendly feel)
- Body: Regular weight, good readability
- Numbers/Amounts: Slightly larger, tabular figures for alignment

### Layout

**Desktop (>1024px):**
```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px)          │   Main Content      │
│  ┌─────────────────────┐  │                     │
│  │ CoinCraft logo      │  │   [Dashboard/Page]  │
│  │                     │  │                     │
│  │ 🏠 Dashboard        │  │                     │
│  │ 📝 Transactions     │  │                     │
│  │ 🏦 Accounts         │  │                     │
│  │ --- Module Routes ---│  │                     │
│  │ 📋 Envelopes        │  │                     │
│  │ 🎯 Goals            │  │                     │
│  │ 📊 Statistics       │  │                     │
│  │ --- Utility ---------│  │                     │
│  │ ⚙️ Settings          │  │                     │
│  └─────────────────────┘  │                     │
│                           │   [+ Quick Add FAB] │
└─────────────────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────┐
│  Header (app name)  │
│                     │
│   [Page Content]    │
│                     │
│                     │
│          [+ FAB]    │
│                     │
├─────────────────────┤
│ 🏠  📝  ➕  📊  ⚙️  │  ← Bottom nav
└─────────────────────┘
```

- Bottom nav: Dashboard, Transactions, Quick Add (center, prominent), Stats, More
- "More" opens drawer with remaining items

**Tablet (768-1024px):**
- Collapsible sidebar (icon-only when collapsed)

---

## Settings

### General
- Display name
- Default currency
- Initial day of month (for budget/envelope periods)
- Date format preference

### Character & Modules
- View/change character (origin story)
- Browse module library
- Enable/disable modules
- Per-module settings (e.g. envelope reset behavior, goal notification frequency)

### Dashboard
- Customize widget layout
- Add/remove widgets
- Reset to character default layout

### Data
- Export transactions (CSV)
- Delete account and all data

### Appearance
- Light / Dark / System theme

---

## Non-Goals (Explicitly Out of Scope for All Phases)

- ❌ Bank sync / Open Banking API
- ❌ Payment processing
- ❌ Investment portfolio tracking (detailed)
- ❌ Multi-language / i18n
- ❌ Offline-first / PWA (for now)
- ❌ Native mobile app (for now)
- ❌ AI-powered categorization (for now — manual is fine)
