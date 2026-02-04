# Decision Journal

Template for documenting significant decisions with confidence scores.

**Format:**
```
## DEC-NNN — [Title]
**Decision:** [What was decided]
**Chosen Option:** [Selected approach]
**Confidence:** [0-100]
**Alternatives Considered:** [Other options]
**Reasoning:** [Why this choice]
**Reversibility:** [Easy/Medium/Hard to change]
**Timestamp:** [UTC ISO 8601]
```

---

## DEC-001 — Transfer Transactions Don't Need Categories

**Decision:** Transfer type transactions will not show the category picker in Quick Add modal.

**Chosen Option:** Hide category picker entirely when transaction type is "transfer"

**Confidence:** 75/100

**Alternatives Considered:**
1. Show categories for transfers (user can optionally categorize)
2. Create special "Transfer" category type
3. Hide category picker for transfers (chosen)

**Reasoning:**
- Database schema has categoryId as NOT NULL, but transfers conceptually move money between accounts
- SPEC.md and TASKS.md don't mention categories for transfers
- Transfers are account-to-account movements, not spending/earning
- Simpler UX: less cognitive load when doing transfers
- Can add a default "Transfer" category in database for this type

**Reversibility:** Easy - can show picker later if needed, just remove conditional hiding

**Timestamp:** 2026-02-04T13:40:00Z

---

---

## DEC-002: Use Select component for account selector (not full dialog)

**Decision:** Use shadcn/ui Select component for account selector instead of full Dialog

**Chosen Option:** Select dropdown component

**Confidence:** 75/100

**Alternatives Considered:**
1. Full Dialog (like CategoryPicker) — more consistent but heavier UX for short lists
2. Native HTML select — simpler but less styled, poor mobile UX
3. Popover with custom list — middle ground, more code than Select

**Reasoning:**
- Accounts list typically shorter than categories (users have 3-10 accounts vs 50+ categories)
- Select dropdown is more compact and appropriate for shorter lists
- Faster to interact with (one click vs dialog open → click → close)
- shadcn/ui Select has good mobile support and accessibility
- Still matches Duolingo design vibe with proper styling

**Reversibility:** HIGH
- Easy to swap to Dialog if user testing shows it's needed
- No database or API changes required
- Component-level change only

**Timestamp:** 2026-02-04T13:50:00Z

## DEC-003 — Store All Quick Add Form Values in Zustand

**Decision:** Move all Quick Add form state from local useState to Zustand store

**Chosen Option:** Full store with all form fields (amount, type, category, account, date, note)

**Confidence:** 65/100

**Alternatives Considered:**
1. Minimal store (only open/close) — simpler but doesn't meet task requirement "form values"
2. Full store with all form state — matches task description, enables draft persistence
3. Hybrid (form local, reset helper in store) — unclear benefit, adds complexity

**Reasoning:**
- Task description explicitly says "manage... form values"
- Allows form state to persist if modal is closed/reopened (better UX)
- Enables potential future features like draft transactions
- Centralized reset logic prevents state bugs
- Follows task requirement: "Build store to manage open/close, form values, and reset"

**Reversibility:** HIGH
- Easy to move state back to component-local if needed
- No database or API changes
- Component-level refactor only

**Timestamp:** 2026-02-04T14:18:00Z


---

## DEC-005: Passing categoryId to form extensions for auto-selection

**Decision:** Access categoryId from Zustand store within form extension component

**Chosen Option:** Import and read from useQuickAddStore() in the component

**Confidence:** 75 (proceed + document)

**Alternatives Considered:**
1. Extend FormExtensionProps type to include categoryId field
2. Pack categoryId into the value field
3. Access from Zustand store (chosen)

**Reasoning:**
- FormExtensionProps is a global module system type, changing it affects all extensions
- Zustand store already contains all form state including categoryId
- Components can import store and read any field they need
- More flexible - extensions can access any form field without prop drilling
- Avoids breaking changes to module system API

**Reversibility:** HIGH
- Can refactor to prop-based approach later if needed
- No architectural lock-in
- Store access is well-established pattern in codebase

**Timestamp:** 2026-02-04T15:20:00Z


---

## DEC-001: Toast Notification Library (sonner vs alternatives)

**Decision:** Use sonner for toast notifications

**Chosen Option:** sonner

**Confidence:** 75

**Alternatives Considered:**
1. sonner - shadcn/ui's recommended toast library, minimal bundle size, good DX
2. react-hot-toast - Popular, well-maintained, slightly larger bundle
3. Custom CSS toast - Full control but more work, potential bugs
4. react-toastify - Feature-rich but heavier

**Reasoning:**
- shadcn/ui documentation recommends sonner
- Minimal bundle size (~3KB)
- Clean API matching project patterns
- Already using other shadcn components
- Good TypeScript support
- Easy to add celebration animations

**Reversibility:** HIGH
- Can swap toast libraries easily (isolated to toast utility)
- API surface is small (just success/error messages)
- No deep integration required

**Timestamp:** 2026-02-04T16:15:00Z


## DEC-006 — Create Account Modal UI Before Server Action

**Decision:** Build Add Account modal UI first, then wire to createAccount server action in next task

**Chosen Option:** Create modal with form validation, use placeholder save handler

**Confidence:** 75/100

**Alternatives Considered:**
1. Wait to create modal until server action exists (blocks progress, not atomic)
2. Create both modal and server action together (violates one-task-at-a-time rule)
3. Create modal UI first with placeholder, wire in next task (chosen)

**Reasoning:**
- Task is specifically "Create Add Account modal with form validation"
- createAccount server action is a separate task
- Modal can be tested independently (validation, UI, state management)
- Additive change - no modification to existing code
- Follows TDD: can verify form validation logic first
- Safe default: creating new component doesn't break existing features

**Reversibility:** HIGH
- Modal is self-contained component
- Easy to wire server action when ready
- No database changes
- Can remove if approach changes

**Timestamp:** 2026-02-04T18:10:00Z

---


## DEC-007 — Subcategory Reordering Scope

**Decision:** Subcategories reorder within their parent category only, not globally

**Chosen Option:** Within-parent reordering for subcategories

**Confidence:** 75/100

**Alternatives Considered:**
1. Global reordering across all categories (complex, breaks hierarchy)
2. No subcategory reordering (incomplete feature)
3. Within-parent reordering only (chosen)

**Reasoning:**
- Matches hierarchical structure (parent → children)
- Simpler mental model for users (subcategories belong to parent)
- Prevents subcategories from being accidentally moved across parents
- displayOrder is scoped to type (expense/income), additional scoping to parentId is logical
- Safe default: preserves category tree structure

**Reversibility:** HIGH
- Can change to global reordering later if needed
- Database schema supports it (displayOrder is just an integer)
- UI change only

**Timestamp:** 2026-02-04T20:00:00Z

---

## DEC-008 — Arrow Button Visibility for Reordering

**Decision:** Show up/down arrows on all items, disable on first/last positions

**Chosen Option:** Always visible arrows with disabled state

**Confidence:** 80/100

**Alternatives Considered:**
1. Hide arrows completely on first/last items (layout shift issue)
2. Show all arrows, let server action handle bounds (confusing UX)
3. Show arrows, disable on first/last (chosen)

**Reasoning:**
- Disabled state provides clear visual feedback about position
- Consistent UI layout (no jumping when items move)
- Follows common UI patterns (pagination, list controls)
- Better accessibility (screen readers can announce disabled state)
- Prevents layout shift when reordering

**Reversibility:** HIGH
- Pure UI/CSS change
- Easy to switch to hidden arrows if needed
- No impact on server logic

**Timestamp:** 2026-02-04T20:01:00Z

---


## DEC-001: Envelope Transfer Semantics

**Decision:** Transfer between envelopes moves budget allocation (targetAmount), not spent amount (currentAmount).

**Chosen Option:** 
```
source.targetAmount -= transferAmount
target.targetAmount += transferAmount
```

**Confidence:** 60/100

**Alternatives Considered:**
1. Transfer spent amounts (currentAmount) - rejected because it doesn't make sense to move "already spent" money
2. Transfer both targetAmount and currentAmount proportionally - overly complex, not intuitive
3. Transfer remaining balance only - rejected because source may have overspent (currentAmount > targetAmount)

**Reasoning:**
The task says "move allocation from one to another". "Allocation" refers to the budgeted amount (targetAmount), not the spent amount. Users want to reallocate their budget between envelopes, e.g., "I budgeted too much for groceries and not enough for transportation, let me move ₱500 from groceries to transportation."

**Reversibility:** High - users can simply transfer back in the opposite direction.

**Timestamp:** 2026-02-04T13:00:00Z

