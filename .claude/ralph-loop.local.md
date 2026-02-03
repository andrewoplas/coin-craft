---
active: true
iteration: 1
max_iterations: 150
completion_promise: "ALL_SPRINTS_DONE"
started_at: "2026-02-03T18:12:57Z"
---

You are building CoinCraft. Read CLAUDE.md to find the current active sprint, rules, and verification process. Read TASKS.md to get all tasks for that sprint. Read SPEC.md and PLAN.md for implementation details.

VERIFICATION IS MANDATORY:
- After implementing each task, run npm run check (lint + typecheck + build) if available.
- Fix ALL errors before marking a task [x].
- Never move to the next task with broken code.

FOR EACH TASK in the current sprint:
1. Mark it [~] in TASKS.md
2. Implement it following PLAN.md architecture and CLAUDE.md rules
3. Run npm run check — fix any errors until clean
4. Mark it [x] in TASKS.md

AFTER ALL TASKS in a sprint are [x]:
1. Run npm run check one final time
2. Verify sprint acceptance criteria from TASKS.md
3. Update CLAUDE.md: advance Active Sprint, set Status to Not started, update Completed Sprints, append to Sprint Progress Log
4. Git commit with message: feat(sprint-N): brief description
5. Immediately continue to the next sprint. Do NOT stop between sprints.

ONLY output <promise>ALL_SPRINTS_DONE</promise> when Sprint 13 is complete and all of Phase 1 is finished.

IF BLOCKED:
- Document blocker in CLAUDE.md under a Blockers section
- List what was attempted and what failed
- Skip the blocked task, continue with remaining tasks
- If entire sprint is blocked, move to next sprint anyway
- Only output <promise>ALL_SPRINTS_DONE</promise> when Sprint 13 is reached or everything possible is done

ENVIRONMENT SETUP:
- If Supabase credentials needed, create .env.local.example with placeholders. Use dummy values so the app builds without live Supabase.
- Do NOT stop to ask for credentials. Mock what you need and keep going.
