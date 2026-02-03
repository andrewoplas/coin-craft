---
active: true
iteration: 1
max_iterations: 20
completion_promise: "SPRINT_COMPLETE"
started_at: "2026-02-03T17:55:04Z"
---

You are building CoinCraft from scratch in a bare directory. There is no existing code — only SPEC.md, PLAN.md, TASKS.md, and CLAUDE.md.

Read CLAUDE.md to find the current active sprint, rules, and verification process. Read TASKS.md to get all tasks for that sprint. Read SPEC.md and PLAN.md for implementation details.

VERIFICATION IS MANDATORY:
- After implementing each task, run npm run check (lint + typecheck + build) if the script is available.
- Fix ALL errors and warnings before marking a task [x].
- Never move to the next task with broken code.
- If npm run check is not yet available (early Sprint 0), skip until the check script is set up, then verify everything.

FOR EACH TASK in the current sprint:
1. Mark it [~] in TASKS.md
2. Implement it following PLAN.md architecture and CLAUDE.md rules
3. Run npm run check — fix any errors until it passes clean
4. Mark it [x] in TASKS.md

AFTER ALL TASKS are [x]:
1. Run npm run check one final time to confirm zero errors
2. Verify the sprint acceptance criteria from TASKS.md
3. Update CLAUDE.md: advance Active Sprint, set Status to Not started, update Completed Sprints, append to Sprint Progress Log
4. Git commit all changes with message: feat(sprint-N): brief description
5. Output exactly: <promise>SPRINT_COMPLETE</promise>

IF BLOCKED:
- Document blocker in CLAUDE.md under a Blockers section
- List what was attempted and what failed
- Output exactly: <promise>SPRINT_COMPLETE</promise>

ENVIRONMENT SETUP:
- If Supabase credentials are needed, create .env.local.example with placeholder keys and document in CLAUDE.md. Use dummy values so the app can still build.
- This is a bare directory. No package.json exists yet. Initialize everything from scratch.
