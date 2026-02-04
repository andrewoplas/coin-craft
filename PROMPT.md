# CoinCraft -- Sprint-by-Sprint Implementation

## Context Files (READ THESE FIRST)
- `CLAUDE.md` -- Active sprint, rules, verification process, architecture patterns
- `TASKS.md` -- Sprint task checklist with acceptance criteria and status tracking
- `SPEC.md` -- Full product specification, data models, UI guidelines
- `PLAN.md` -- Technical architecture, folder structure, database schema

## What To Build
Read CLAUDE.md to find the current Active Sprint. Read TASKS.md to get all tasks for that sprint. Implement every task in order.

## Task Tracking
Tasks in TASKS.md use status markers:
- `- [ ]` = pending
- `- [~]` = in progress  
- `- [x]` = complete

Update these markers as you work through each task.

## Verification (MANDATORY)
After every task, run `npm run check` (which runs lint + typecheck + build).
Fix ALL errors before marking a task [x]. Never move on with broken code.
If `npm run check` is not yet available (early Sprint 0), skip until the check script exists.

## After All Tasks in a Sprint Are [x]
1. Run `npm run check` one final time
2. Verify the sprint acceptance criteria from TASKS.md
3. Update CLAUDE.md: advance Active Sprint, set Status to Not started, update Completed Sprints, append to Sprint Progress Log
4. Continue to the next sprint immediately -- re-read CLAUDE.md for the new active sprint

## Environment
- This may be a bare directory. If no package.json exists, initialize from scratch.
- If Supabase credentials are needed, create .env.local.example with placeholders. Mock what you need so the app builds.
- Do NOT stop to ask for credentials or human input. Keep going.

## Completion
Keep building sprints until Sprint 13 is complete and all of Phase 1 is finished.