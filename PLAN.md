# PLAN.md — CoinCraft Architecture & Technical Decisions

## Tech Stack

| Layer            | Choice                        | Rationale                                          |
| ---------------- | ----------------------------- | -------------------------------------------------- |
| Framework        | **Next.js 14+ (App Router)**  | Full-stack: SSR pages + Server Actions for backend |
| Database         | **Supabase (PostgreSQL)**     | DB, Auth, RLS, real-time, storage — all-in-one     |
| Auth             | **Supabase Auth**             | Email/password, OAuth. Integrated with RLS         |
| ORM              | **Drizzle ORM**               | Type-safe queries on Supabase Postgres connection  |
| Styling          | **Tailwind CSS + shadcn/ui**  | Fast iteration, consistent design system           |
| State Management | **Zustand**                   | Lightweight client state for dashboard, modules    |
| Charts           | **Recharts**                  | React-friendly, future RN compatibility            |
| Deployment       | **Vercel**                    | Native NextJS hosting, edge functions              |

---

## Project Structure

```
coincraft/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── onboarding/           # Character select + setup
│   │   │       ├── page.tsx           # Character select screen
│   │   │       ├── quiz/page.tsx      # "Help me choose" quiz
│   │   │       └── setup/page.tsx     # Post-character setup flow
│   │   ├── (app)/                    # Authenticated app (with sidebar)
│   │   │   ├── layout.tsx            # App shell: sidebar + main content
│   │   │   ├── dashboard/page.tsx    # Customizable dashboard canvas
│   │   │   ├── transactions/page.tsx # Transaction list with filters
│   │   │   ├── accounts/page.tsx     # Account management
│   │   │   ├── categories/page.tsx   # Category management
│   │   │   ├── statistics/page.tsx   # Charts and reports
│   │   │   ├── settings/page.tsx     # App settings
│   │   │   └── modules/             # Module-specific routes
│   │   │       ├── envelopes/page.tsx
│   │   │       ├── goals/page.tsx
│   │   │       └── [moduleId]/page.tsx  # Dynamic module routes
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing/redirect
│   │
│   ├── modules/                      # Module system
│   │   ├── registry.ts              # Module registry — discovers and manages modules
│   │   ├── types.ts                 # Module manifest types
│   │   ├── core/                    # Core module (always active)
│   │   │   ├── manifest.ts
│   │   │   ├── widgets/
│   │   │   │   ├── net-worth.tsx
│   │   │   │   ├── accounts-overview.tsx
│   │   │   │   ├── recent-transactions.tsx
│   │   │   │   ├── income-vs-expenses.tsx
│   │   │   │   ├── spending-by-category.tsx
│   │   │   │   └── cash-flow.tsx
│   │   │   └── form-extensions/      # (none for core)
│   │   ├── statistics/
│   │   │   ├── manifest.ts
│   │   │   ├── widgets/
│   │   │   │   ├── trend-chart.tsx
│   │   │   │   ├── period-comparison.tsx
│   │   │   │   └── top-categories.tsx
│   │   │   └── components/
│   │   │       └── statistics-page.tsx
│   │   ├── envelope/
│   │   │   ├── manifest.ts
│   │   │   ├── widgets/
│   │   │   │   ├── envelope-overview.tsx
│   │   │   │   ├── envelope-warnings.tsx
│   │   │   │   └── allocation-summary.tsx
│   │   │   ├── form-extensions/
│   │   │   │   └── envelope-picker.tsx
│   │   │   ├── components/
│   │   │   │   ├── envelope-list.tsx
│   │   │   │   ├── envelope-card.tsx
│   │   │   │   ├── envelope-form.tsx
│   │   │   │   └── envelope-transfer.tsx
│   │   │   ├── actions/
│   │   │   │   └── envelope-actions.ts
│   │   │   └── queries/
│   │   │       └── envelope-queries.ts
│   │   ├── goals/
│   │   │   ├── manifest.ts
│   │   │   ├── widgets/
│   │   │   │   ├── goal-progress.tsx
│   │   │   │   ├── projected-dates.tsx
│   │   │   │   └── savings-rate.tsx
│   │   │   ├── form-extensions/
│   │   │   │   └── goal-allocator.tsx
│   │   │   ├── components/
│   │   │   │   ├── goal-list.tsx
│   │   │   │   ├── goal-card.tsx
│   │   │   │   ├── goal-form.tsx
│   │   │   │   └── goal-celebration.tsx
│   │   │   ├── actions/
│   │   │   │   └── goal-actions.ts
│   │   │   └── queries/
│   │   │       └── goal-queries.ts
│   │   ├── labels/
│   │   │   ├── manifest.ts
│   │   │   ├── form-extensions/
│   │   │   │   └── label-picker.tsx
│   │   │   └── ...
│   │   ├── planned-payments/
│   │   │   ├── manifest.ts
│   │   │   └── ...
│   │   └── export/
│   │       ├── manifest.ts
│   │       └── ...
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx          # Dynamic sidebar built from module registry
│   │   │   ├── mobile-nav.tsx       # Bottom nav for mobile
│   │   │   ├── header.tsx
│   │   │   └── app-shell.tsx
│   │   ├── dashboard/
│   │   │   ├── dashboard-canvas.tsx # Drag-and-drop widget grid
│   │   │   ├── widget-wrapper.tsx   # Standard widget container
│   │   │   └── add-widget-modal.tsx
│   │   ├── transactions/
│   │   │   ├── quick-add-modal.tsx  # Composable quick add with module extensions
│   │   │   ├── transaction-list.tsx
│   │   │   ├── transaction-item.tsx
│   │   │   ├── transaction-filters.tsx
│   │   │   └── transaction-form.tsx
│   │   ├── accounts/
│   │   │   ├── account-card.tsx
│   │   │   └── account-form.tsx
│   │   ├── categories/
│   │   │   ├── category-picker.tsx
│   │   │   ├── category-grid.tsx
│   │   │   └── category-form.tsx
│   │   ├── onboarding/
│   │   │   ├── character-card.tsx
│   │   │   ├── character-select.tsx
│   │   │   ├── quiz-screen.tsx
│   │   │   └── setup-wizard.tsx
│   │   └── gamification/
│   │       ├── streak-counter.tsx
│   │       ├── achievement-badge.tsx
│   │       ├── health-score.tsx
│   │       └── monthly-recap.tsx
│   │
│   ├── db/
│   │   ├── index.ts                 # Drizzle client setup (connects to Supabase Postgres)
│   │   ├── schema/
│   │   │   ├── core.ts              # transactions, accounts, categories, allocations
│   │   │   ├── auth.ts              # user profiles, user settings
│   │   │   ├── modules.ts           # user_modules (which modules are active)
│   │   │   ├── gamification.ts      # streaks, achievements
│   │   │   └── index.ts             # Re-exports all schemas
│   │   ├── migrations/
│   │   └── seed.ts                  # Default categories, system config
│   │
│   ├── server/
│   │   ├── actions/                 # Server Actions (mutations)
│   │   │   ├── transactions.ts
│   │   │   ├── accounts.ts
│   │   │   ├── categories.ts
│   │   │   ├── allocations.ts
│   │   │   ├── user-settings.ts
│   │   │   └── onboarding.ts
│   │   └── queries/                 # Server-side data fetching
│   │       ├── transactions.ts
│   │       ├── accounts.ts
│   │       ├── categories.ts
│   │       ├── allocations.ts
│   │       ├── dashboard.ts
│   │       ├── statistics.ts
│   │       └── gamification.ts
│   │
│   ├── stores/                      # Zustand stores
│   │   ├── module-store.ts          # Active modules, module config
│   │   ├── dashboard-store.ts       # Widget layout, positions, sizes
│   │   ├── quick-add-store.ts       # Quick add modal state
│   │   └── ui-store.ts              # Sidebar open/close, theme, etc
│   │
│   ├── lib/
│   │   ├── utils.ts                 # General utilities
│   │   ├── format.ts                # Currency formatting, date formatting
│   │   ├── constants.ts             # Default categories, colors, character configs
│   │   ├── types.ts                 # Shared TypeScript types
│   │   └── supabase/
│   │       ├── client.ts            # Supabase browser client
│   │       ├── server.ts            # Supabase server client
│   │       └── middleware.ts        # Auth middleware
│   │
│   └── hooks/
│       ├── use-user.ts              # Current user context
│       ├── use-modules.ts           # Active module helpers
│       └── use-media-query.ts       # Responsive helpers
│
├── supabase/
│   ├── migrations/                  # Supabase SQL migrations
│   └── config.toml                  # Supabase project config
│
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── SPEC.md
├── PLAN.md
├── TASKS.md
├── CLAUDE.md
└── README.md
```

---

## Key Architecture Decisions

### 1. Module System

The module system is the heart of CoinCraft. Each module is a folder under `src/modules/` that exports a manifest.

**Module Manifest Type:**
```typescript
// modules/types.ts
export type ModuleManifest = {
  id: string;                    // Unique identifier: "envelope", "goals", etc
  name: string;                  // Display name
  description: string;           // Short description for module library
  icon: string;                  // Emoji placeholder
  characterId?: string;          // Which character this belongs to (if any)

  // What the module provides
  routes: ModuleRoute[];         // Sidebar entries
  dashboardWidgets: WidgetConfig[];  // Available dashboard widgets
  formExtensions: FormExtension[];   // Quick Add form additions
  allocationType?: string;       // If module uses allocations

  // Module behavior
  settings: ModuleSetting[];     // User-configurable settings
  nudges: NudgeConfig[];         // Smart nudge rules

  // Default dashboard layout when this module's character is selected
  defaultWidgetLayout?: WidgetLayout[];
};

export type ModuleRoute = {
  path: string;
  label: string;
  icon: string;              // Lucide icon name
  order: number;             // Sidebar sort order
};

export type WidgetConfig = {
  id: string;
  name: string;
  description: string;
  sizes: ('S' | 'M' | 'L')[];
  defaultSize: 'S' | 'M' | 'L';
  component: string;         // Component path for dynamic import
};

export type FormExtension = {
  id: string;
  label: string;
  position: 'after-category' | 'after-account' | 'before-save';
  component: string;
  transactionTypes: ('expense' | 'income' | 'transfer')[];
  required: boolean;
};
```

**Module Registry:**
```typescript
// modules/registry.ts
// Reads all module manifests
// Filters by user's active modules
// Provides helpers: getActiveRoutes(), getActiveWidgets(), getActiveFormExtensions()
// Used by sidebar, dashboard, and quick-add to compose the UI dynamically
```

**How modules activate:**
1. User enables module in Settings → Module Library
2. `user_modules` table updated (user_id, module_id, is_active, config)
3. Module registry picks up the change
4. Sidebar, dashboard, and forms recompose automatically

### 2. Character System

Characters are configuration, not code. A character is defined as:

```typescript
// lib/constants.ts
export type CharacterConfig = {
  id: string;                    // "observer", "planner", "saver"
  name: string;                  // "The Observer"
  tagline: string;
  icon: string;                  // Emoji placeholder (replaced by illustrations later)
  accentColor: string;           // Character theme color
  modules: string[];             // Module IDs to activate
  defaultDashboardLayout: WidgetLayout[];
  onboardingSteps: OnboardingStep[];
  available: boolean;            // false for "Coming Soon" characters
};
```

When a user selects a character:
1. Activate the character's modules
2. Apply the default dashboard layout
3. Run character-specific onboarding steps
4. Store `character_id` in user profile

Changing character later:
1. Update `character_id`
2. Offer to reset dashboard to new character's default (optional)
3. Activate/deactivate modules as needed (always ask, never force)

### 3. Supabase Integration

**Auth Flow:**
1. Supabase Auth handles signup/login (email + OAuth providers)
2. On signup, create user profile row with default settings
3. After auth, redirect to onboarding (if first time) or dashboard
4. Supabase middleware protects all `(app)` routes

**Row-Level Security:**
Every table has RLS policies ensuring users only access their own data:
```sql
CREATE POLICY "Users can only see their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Same pattern for all tables
```

**Supabase Client + Drizzle:**
- Use Supabase JS client for auth operations
- Use Drizzle ORM connected to Supabase Postgres for all data queries
- This gives us type-safe queries with full SQL power for complex aggregations

### 4. Server Actions for Mutations

All create/update/delete operations use Next.js Server Actions. No REST API layer.

```typescript
// server/actions/transactions.ts
"use server"

export async function createTransaction(data: NewTransaction) {
  const user = await getAuthUser();
  // Validate
  // Insert via Drizzle
  // If envelope module active + category linked, auto-deduct from envelope
  // If goals module active + income type, check for goal allocation
  // Return created transaction
}
```

**Module-aware actions:** Core server actions check which modules are active and trigger module-specific side effects. For example, creating an expense transaction might:
1. Insert the transaction (core)
2. Update envelope balance if linked (envelope module)
3. Update streak counter (gamification)

### 5. Money as Integers (Centavos)

All monetary values stored as integers to avoid floating-point issues.

```typescript
// lib/format.ts
export function toCentavos(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCentavos(centavos: number): number {
  return centavos / 100;
}

export function formatPHP(centavos: number): string {
  return `₱${fromCentavos(centavos).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
```

### 6. Dashboard Canvas

The dashboard uses a grid layout system where widgets can be positioned and resized.

**Zustand store for layout:**
```typescript
// stores/dashboard-store.ts
type DashboardStore = {
  widgets: WidgetInstance[];  // { id, moduleId, widgetId, size, position }
  addWidget: (widget) => void;
  removeWidget: (id) => void;
  moveWidget: (id, newPosition) => void;
  resizeWidget: (id, newSize) => void;
  resetToDefault: (characterId) => void;
};
```

**Rendering:**
- Dashboard page reads active widgets from store
- Each widget is dynamically imported based on module + widget ID
- Grid layout library (e.g. react-grid-layout) handles positioning
- Layout persisted to database per user

### 7. Date Handling

- Store dates as ISO strings / Postgres date types
- All display in `Asia/Manila` timezone (user setting, default for PH users)
- Use `date-fns` for manipulation
- Period calculations (this month, last month) respect user's "initial day of month" setting

### 8. Responsive Strategy

- **Desktop (>1024px):** Persistent sidebar + main content
- **Tablet (768-1024px):** Collapsible sidebar (icon-only)
- **Mobile (<768px):** Bottom navigation bar, sidebar becomes a drawer
- Quick Add FAB: bottom-right on all sizes, center of bottom nav on mobile

---

## Database Schema Overview

```
┌─────────────────┐     ┌─────────────────┐
│   user_profiles  │     │  user_modules    │
│─────────────────│     │─────────────────│
│ id (= auth.uid) │     │ id               │
│ display_name     │     │ user_id          │
│ character_id     │     │ module_id        │
│ default_currency │     │ is_active        │
│ settings (jsonb) │     │ config (jsonb)   │
│ created_at       │     │ created_at       │
└─────────┬───────┘     └─────────────────┘
          │
          │ user_id on all tables below
          ▼
┌─────────────────┐     ┌─────────────────┐
│    accounts      │     │   categories     │
│─────────────────│     │─────────────────│
│ id               │     │ id               │
│ user_id          │     │ user_id          │
│ name             │     │ name             │
│ type             │     │ type             │
│ currency         │     │ icon             │
│ initial_balance  │     │ color            │
│ icon             │     │ parent_id → self │
│ color            │     │ sort_order       │
│ is_archived      │     │ is_system        │
│ sort_order       │     │ is_hidden        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────────────┤
         ▼    ▼                  │
┌──────────────────────────────────────┐
│            transactions              │
│──────────────────────────────────────│
│ id                                   │
│ user_id                              │
│ type (expense / income / transfer)   │
│ amount (centavos)                    │
│ currency                             │
│ category_id → categories             │
│ account_id → accounts                │
│ to_account_id → accounts (nullable)  │
│ date                                 │
│ note                                 │
│ created_at / updated_at              │
└──────────────┬───────────────────────┘
               │
               │
┌──────────────┴───────────────────────┐
│        allocation_transactions       │
│──────────────────────────────────────│
│ id                                   │
│ transaction_id → transactions        │
│ allocation_id → allocations          │
│ amount (centavos)                    │
└──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│            allocations               │
│──────────────────────────────────────│
│ id                                   │
│ user_id                              │
│ module_type (envelope / goal / debt) │
│ name                                 │
│ icon / color                         │
│ target_amount / current_amount       │
│ period / period_start / deadline     │
│ category_ids (uuid[])                │
│ is_active                            │
│ config (jsonb)                       │
│ sort_order                           │
└──────────────────────────────────────┘

┌──────────────────────────┐
│    gamification           │
│──────────────────────────│
│ streaks table             │
│ achievements table        │
│ user_achievements table   │
│ dashboard_layouts table   │
└──────────────────────────┘

┌──────────────────────────┐
│    labels (module)        │
│──────────────────────────│
│ labels table              │
│ transaction_labels table  │
└──────────────────────────┘

┌──────────────────────────┐
│ planned_payments (module) │
│──────────────────────────│
│ planned_payments table    │
└──────────────────────────┘
```

---

## Deployment

### Development
```bash
# Local dev
pnpm dev

# Supabase local (optional, for offline dev)
supabase start

# Drizzle migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Production
- **App:** Deploy to Vercel (auto-deploy from Git)
- **Database:** Supabase hosted Postgres (free tier works for launch)
- **Environment:** Supabase URL + anon key + service role key in Vercel env vars

### Performance Targets
- Quick Add to save: < 200ms
- Dashboard load: < 500ms
- Transaction list with 1000+ records: smooth scroll, < 300ms filter
- Lighthouse score: > 90 on all metrics
- Time to Interactive: < 2 seconds
