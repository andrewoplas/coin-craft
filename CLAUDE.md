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

## Common Commands

```bash
npm run dev                      # Start dev server
npm run build                    # Production build
npm run lint                     # Run linter

# Database (Drizzle + Supabase)
npm run drizzle-kit generate     # Generate migration from schema changes
npm run drizzle-kit migrate      # Apply migrations
npm run drizzle-kit studio       # Open Drizzle Studio (database GUI)
npx tsx src/db/seed.ts           # Run seed script

# Supabase (if using local dev)
npx supabase start               # Start local Supabase
npx supabase stop                # Stop local Supabase
npx supabase db reset            # Reset local database
```

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

Current Sprint

Update this section every time you start or complete a sprint.

Active Sprint: Sprint 0 — Project Setup
Phase: 1
Status: Not started
Completed Sprints: None
Sprint Progress Log
<!-- Append each sprint completion here -->
<!-- Format: Sprint X — [date] — Summary of what was built -->